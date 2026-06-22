# Feature 3 — Implementation Tasks

Tasks are ordered by dependency. Complete each group before starting the next.

---

## Group 1 — Conversation state (MongoDB)

- [ ] **1.1** Add `CONVERSATION_COLLECTION = "ConversationState"` constant to `app/services/cache.py`.
- [ ] **1.2** Add `write_conversation_state(db, user_id, song_name, response_id) -> None` to `cache.py` — upserts by `user_id`.
- [ ] **1.3** Add `read_conversation_state(db, user_id) -> Optional[str]` to `cache.py` — returns `response_id` or `None`.
- [ ] **1.4** Extend `clear_cache` in `cache.py` to also delete from `ConversationState`.
- [ ] **1.5** Update `read_cache` to also return `song_name` in its result dict (needed by the endpoint to write conversation state).
- [ ] **1.6** Update `get_ai_analysis` in `app/services/ai_analysis.py` to accept `response_id: str = None`, pass it as an argument to `get_analysis`, and return `(analysis_str, assistant.response_id)` — reading `response_id` back from the instance variable after the call.
- [ ] **1.7** Update `POST /songs/ai-analysis` in `app/endpoints/music.py`:
  - Read `response_id` from MongoDB via `read_conversation_state` (inside try/except).
  - Pass `response_id` to `get_ai_analysis`.
  - Write the returned `new_response_id` back via `write_conversation_state` (inside try/except).
- [ ] **1.8** Export `write_conversation_state` and `read_conversation_state` from `app/services/__init__.py`.

---

## Group 2 — Save song notes (Postgres)

- [ ] **2.1** Create `app/services/song_notes.py` with:
  - `_get_or_create(db, model, **kwargs)` — query by kwargs, insert and flush if missing.
  - `save_song_notes(db, user_id, genre, album, artist, song_name, notes) -> int` — full get-or-create chain + upsert of `SongNotes` and `SongChecksDate`.
- [ ] **2.2** Add `SongNotesRequest` Pydantic schema to `app/endpoints/music.py` (or `app/models/music.py`): fields `genre`, `album`, `artist`, `song_name`, `notes` — all `str`, `min_length=1`.
- [ ] **2.3** Add `POST /api/v1/music/songs/notes` to `app/endpoints/music.py`:
  - Protected by `require_session`.
  - Calls `save_song_notes(db, session.client_id, ...)`.
  - Returns `{ "song_note_id": int }`.
- [ ] **2.4** Export `save_song_notes` from `app/services/__init__.py`.

---

## Group 3 — Filter songs (Postgres)

- [ ] **3.1** Add `filter_song_notes(db, user_id, genre, artist, album, name) -> list` to `app/services/song_notes.py` — joined query with optional `ILIKE` filters, returns list of dicts.
- [ ] **3.2** Add `SongNoteRow` Pydantic response schema: `song_note_id`, `user`, `genre`, `artist`, `album`, `name`, `cur_user_notes` (genre/artist/album optional strings).
- [ ] **3.3** Add `GET /api/v1/music/songs/notes` to `app/endpoints/music.py`:
  - Protected by `require_session`.
  - Query params: `genre`, `artist`, `album`, `name` (all `Optional[str]`, default `None`).
  - Calls `filter_song_notes(db, session.client_id, ...)`.
  - Returns `List[SongNoteRow]`.
- [ ] **3.4** Export `filter_song_notes` from `app/services/__init__.py`.

---

## Group 4 — Smoke test

- [ ] **4.1** Call `POST /songs/ai-analysis` twice; verify Atlas shows a `ConversationState` document and the `response_id` changes between calls.
- [ ] **4.2** Call `POST /auth/logout`; verify `ConversationState` document is gone from Atlas.
- [ ] **4.3** Call `POST /songs/notes` with a new song; verify rows appear in `genres`, `artists`, `albums`, `songs`, `song_notes`, `song_checks_date`.
- [ ] **4.4** Call `POST /songs/notes` with the same song again; verify no duplicate rows are created and `song_notes.notes` is updated.
- [ ] **4.5** Call `GET /songs/notes` with no filters; verify the saved song appears.
- [ ] **4.6** Call `GET /songs/notes?artist=miles`; verify only matching results are returned.
