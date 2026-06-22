# Feature 3 — Design

## Overview

Three independent deliverables:

1. **Conversation state** — new MongoDB collection persisting `response_id` per user.
2. **Song notes write** — new Postgres endpoint get-or-creating across 4 tables and upserting `song_notes` + `song_checks_date`.
3. **Song notes filter** — new Postgres query endpoint joining 5 tables with optional `ILIKE` filters.

---

## Capability 1: Conversation State (MongoDB)

### New collection: `ConversationState`

| Field | Type | Description |
|---|---|---|
| `user_id` | int | FK to `users.user_id` |
| `song_name` | str | The song currently being discussed |
| `response_id` | str | Latest response ID from `MusicAnalyticsAssistant` |

One document per user, upserted on each AI call, deleted on logout.

### Changes to `app/services/cache.py`

Two new functions:

```python
CONVERSATION_COLLECTION = "ConversationState"

def write_conversation_state(db, user_id, song_name, response_id) -> None:
    db[CONVERSATION_COLLECTION].replace_one(
        {"user_id": user_id},
        {"user_id": user_id, "song_name": song_name, "response_id": response_id},
        upsert=True,
    )

def read_conversation_state(db, user_id) -> Optional[str]:
    doc = db[CONVERSATION_COLLECTION].find_one({"user_id": user_id})
    return doc["response_id"] if doc else None
```

`clear_cache` extended to also delete from `ConversationState`:

```python
def clear_cache(db, user_id) -> None:
    filter_ = {"user_id": user_id}
    db[BEAT_COLLECTION].delete_one(filter_)
    db[SECTION_COLLECTION].delete_one(filter_)
    db[CHORD_COLLECTION].delete_one(filter_)
    db[CONVERSATION_COLLECTION].delete_one(filter_)
```

### Changes to `app/services/ai_analysis.py`

`get_ai_analysis` now accepts and returns `response_id`:

```python
def get_ai_analysis(user_prompt: str, cache: dict, response_id: str = None) -> tuple[str, str]:
    assistant = MusicAnalyticsAssistant(model="gpt-4o")
    result = assistant.get_analysis(
        user_prompt,
        cache["beats"],
        cache["sections"],
        cache["chord_grid"],
        response_id=response_id,
    )
    return result, assistant.response_id
```

### Changes to `app/endpoints/music.py` — `POST /songs/ai-analysis`

```
1. read_cache(mongo_db, user_id)           → 404 if None
2. read_conversation_state(mongo_db, user_id) → response_id or None
3. get_ai_analysis(prompt, cache, response_id) → (analysis, new_response_id)
4. write_conversation_state(mongo_db, user_id, song_name, new_response_id)
5. return { "analysis": analysis }
```

Steps 2 and 4 are wrapped in try/except — MongoDB failures must not break the response.

Song name for step 4 is read from the `Beats` cache document (it stores `song_name`). Update `read_cache` to also return `song_name`.

---

## Capability 2: Save Song Notes (Postgres)

### New endpoint: `POST /api/v1/music/songs/notes`

All get-or-create logic lives in a new service `app/services/song_notes.py`:

```
save_song_notes(db, user_id, genre, album, artist, song_name, notes) -> int
```

#### Execution order

```
1. genre_row   = get_or_create(db, Genre, genre=genre)
2. artist_row  = get_or_create(db, Artist, artist=artist)
3. album_row   = get_or_create(db, Album, album=album, genre=genre_row.id_genre)
4. song_row    = get_or_create(db, Song,
                   song_name=song_name,
                   genre=genre_row.id_genre,
                   artist=artist_row.id_artist,
                   album=album_row.id_album)
5. note_row    = upsert SongNotes(user=user_id, song=song_row.id_song, notes=notes)
6. check_row   = upsert SongChecksDate(user=user_id, song=song_row.id_song, date_checked=now())
7. db.commit()
8. return note_row.song_note_id
```

`get_or_create` pattern (reusable within the service):
```python
def _get_or_create(db, model, **kwargs):
    instance = db.query(model).filter_by(**kwargs).first()
    if not instance:
        instance = model(**kwargs)
        db.add(instance)
        db.flush()
    return instance
```

For `SongNotes` upsert — filter by `(user, song)`, update `notes` if exists:
```python
note = db.query(SongNotes).filter_by(user=user_id, song=song_id).first()
if note:
    note.notes = notes
else:
    note = SongNotes(user=user_id, song=song_id, notes=notes)
    db.add(note)
db.flush()
```

Same pattern for `SongChecksDate`, updating `date_checked`.

### Pydantic request schema (inline in endpoint or in `app/models/music.py`)

```python
class SongNotesRequest(BaseModel):
    genre:     str = Field(..., min_length=1)
    album:     str = Field(..., min_length=1)
    artist:    str = Field(..., min_length=1)
    song_name: str = Field(..., min_length=1)
    notes:     str = Field(..., min_length=1)
```

---

## Capability 3: Filter Songs (Postgres)

### New endpoint: `GET /api/v1/music/songs/notes`

Query logic in the same `app/services/song_notes.py`:

```python
def filter_song_notes(db, user_id, genre=None, artist=None, album=None, name=None):
    q = (
        db.query(
            SongNotes.song_note_id,
            SongNotes.user,
            Genre.genre.label("genre"),
            Artist.artist.label("artist"),
            Album.album.label("album"),
            Song.song_name.label("name"),
            SongNotes.notes.label("cur_user_notes"),
        )
        .join(Song, SongNotes.song == Song.id_song)
        .outerjoin(Genre, Song.genre == Genre.id_genre)
        .outerjoin(Artist, Song.artist == Artist.id_artist)
        .outerjoin(Album, Song.album == Album.id_album)
        .filter(SongNotes.user == user_id)
    )
    if genre:   q = q.filter(Genre.genre.ilike(f"%{genre}%"))
    if artist:  q = q.filter(Artist.artist.ilike(f"%{artist}%"))
    if album:   q = q.filter(Album.album.ilike(f"%{album}%"))
    if name:    q = q.filter(Song.song_name.ilike(f"%{name}%"))
    return [row._asdict() for row in q.all()]
```

### Pydantic response schema

```python
class SongNoteRow(BaseModel):
    song_note_id:    int
    user:            int
    genre:           Optional[str]
    artist:          Optional[str]
    album:           Optional[str]
    name:            str
    cur_user_notes:  str
```

---

## Module layout additions

```
app/
└── services/
    ├── cache.py          ← add write/read_conversation_state; extend clear_cache
    ├── ai_analysis.py    ← accept + return response_id
    └── song_notes.py     ← save_song_notes / filter_song_notes  (NEW)
```

Modified files:
- `app/services/cache.py`    ← conversation state functions + clear_cache extension
- `app/services/ai_analysis.py` ← response_id threading
- `app/endpoints/music.py`   ← wire conversation state into ai-analysis; add notes endpoints
- `app/services/__init__.py` ← export new functions
