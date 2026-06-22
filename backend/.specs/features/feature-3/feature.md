# Feature 3 — Conversation Continuity, Song Notes, and Song Filtering

## Summary

Three independent capabilities:

1. **Conversation continuity** — the AI analysis endpoint maintains conversation state across calls by persisting `response_id` from `MusicAnalyticsAssistant` in MongoDB. Each subsequent call continues the prior conversation thread instead of starting fresh.
2. **Save song notes** — a new endpoint lets authenticated users persist their research about a song to Postgres: genre, album, artist, name, and personal notes. All related tables are updated, including `last_checked`.
3. **Filter songs** — a new endpoint lets authenticated users query their saved song notes with optional filters, returning a flat joined view.

---

## Capability 1: Conversation Continuity

### Who uses it
Transparent to the user — `POST /songs/ai-analysis` automatically threads responses.

### What it does
- After each `get_analysis` call, stores the `response_id` instance variable from `MusicAnalyticsAssistant` in a new MongoDB collection (`ConversationState`), keyed by `user_id`.
- On the next call, reads the stored `response_id` and sets it on the assistant instance before calling `get_analysis`, so the model continues the prior thread.
- The document is upserted on each call and deleted on logout or session expiry.

### Acceptance criteria
- First call: no `response_id` in MongoDB → `get_analysis` called without prior context → `response_id` written after the call.
- Subsequent call: `response_id` found → set on assistant before call → new `response_id` overwrites old after the call.
- On logout: `ConversationState` document deleted for that user.
- If reading/writing `response_id` fails, the call still proceeds and returns an analysis (fail silently, log).

---

## Capability 2: Save Song Notes

### Who uses it
Authenticated users recording research findings about a specific song.

### What it does
- Accepts: `genre`, `album`, `artist`, `song_name`, `notes`.
- Gets or creates rows in `genres`, `artists`, `albums`, `songs`.
- Upserts a `song_notes` record for this user + song.
- Upserts a `song_checks_date` record setting `date_checked = now()`.

### Acceptance criteria
- Returns the `song_note_id` of the created/updated record.
- Duplicate genre/artist/album/song strings reuse existing rows — no duplicates.
- Requires valid session; unauthenticated requests return 401.
- Missing required fields return 422.

---

## Capability 3: Filter Songs

### Who uses it
Authenticated users reviewing their saved song research.

### What it does
- Accepts optional query params: `genre`, `artist`, `album`, `name` (case-insensitive partial match).
- Returns rows scoped to the current user, joined across `song_notes`, `songs`, `genres`, `artists`, `albums`.

### Response shape
```json
[
  {
    "song_note_id": 1,
    "user": 3,
    "genre": "Jazz",
    "artist": "Miles Davis",
    "album": "Kind of Blue",
    "name": "So What",
    "cur_user_notes": "Classic modal jazz. Dorian mode on D."
  }
]
```

### Acceptance criteria
- No filters → returns all song notes for the current user.
- Each filter is a case-insensitive partial match (`ILIKE %value%`).
- Results are always scoped to the logged-in user only.
- Returns an empty list (not 404) when no results match.
- Requires valid session; unauthenticated requests return 401.

---

## API Surface

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/v1/music/songs/ai-analysis` | Yes | (modified) threads `response_id` across calls |
| POST | `/api/v1/music/songs/notes`        | Yes | Save song research to Postgres |
| GET  | `/api/v1/music/songs/notes`        | Yes | Filter and retrieve saved song notes |

### Request — POST /songs/notes
```json
{
  "genre": "Jazz",
  "album": "Kind of Blue",
  "artist": "Miles Davis",
  "song_name": "So What",
  "notes": "Classic modal jazz. Dorian mode on D."
}
```

### Response — POST /songs/notes
```json
{ "song_note_id": 1 }
```

### Query params — GET /songs/notes
`?genre=jazz&artist=miles&album=kind&name=so+what` (all optional)

---

## Out of scope
- Editing or deleting saved notes.
- Sorting or pagination for the filter endpoint.
- Frontend UI (covered in the frontend feature spec).
