# Feature 3 — Test Plan

## Test strategy

- **Cache service tests** — unit tests on new `write/read_conversation_state` and updated `clear_cache` using `mongomock`.
- **AI analysis service tests** — unit tests verifying `response_id` is set on the assistant and returned correctly; `MusicAnalyticsAssistant` mocked.
- **Song notes service tests** — unit tests using an in-memory SQLite database via SQLAlchemy.
- **Endpoint tests** — via `TestClient`, with MongoDB patched to `mongomock` and Postgres using the test DB fixture.

---

## `tests/services/test_cache.py` — additions

**write_conversation_state / read_conversation_state**
- [ ] `read_conversation_state` returns `None` when no document exists.
- [ ] After `write_conversation_state`, `read_conversation_state` returns the correct `response_id`.
- [ ] Calling `write_conversation_state` twice upserts — only one document remains; `response_id` reflects the latest call.
- [ ] `song_name` is stored correctly on the document.

**clear_cache — extended**
- [ ] After `clear_cache`, `read_conversation_state` returns `None`.
- [ ] `clear_cache` deletes `ConversationState` for the target user but not for other users.

**read_cache — updated**
- [ ] Returned dict includes `song_name` key.

---

## `tests/services/test_ai_analysis.py` — additions

Setup: mock `MusicAnalyticsAssistant` so `get_analysis` returns `"mocked analysis"` and `response_id` is set to `"resp_abc"` after the call.

- [ ] When `response_id=None` is passed, `get_analysis` is called without a `response_id` argument.
- [ ] When `response_id="resp_xyz"` is passed, `get_analysis` is called with `response_id="resp_xyz"` as an argument.
- [ ] Return value is a tuple `(str, str)` — first element is the analysis, second is `assistant.response_id`.
- [ ] No real OpenAI call is made.

---

## `tests/services/test_song_notes.py` — new file

Setup: SQLite in-memory database seeded with the same SQLAlchemy models.

**save_song_notes**
- [ ] Creates rows in `genres`, `artists`, `albums`, `songs`, `song_notes`, `song_checks_date`.
- [ ] Returns a valid `song_note_id` integer.
- [ ] Calling with the same genre/artist/album/song strings a second time does not create duplicate rows in those tables.
- [ ] Calling twice for the same user + song updates `song_notes.notes` and `song_checks_date.date_checked` — row count stays at 1.
- [ ] Calling for a different user with the same song reuses the song row but creates separate `song_notes` and `song_checks_date` rows.

**filter_song_notes**
- [ ] Returns all notes for the user when no filters are supplied.
- [ ] `genre` filter is case-insensitive partial match.
- [ ] `artist` filter is case-insensitive partial match.
- [ ] `album` filter is case-insensitive partial match.
- [ ] `name` filter is case-insensitive partial match.
- [ ] Returns empty list when no results match.
- [ ] Results are scoped to the current user — notes from other users are not returned.
- [ ] Each row contains keys: `song_note_id`, `user`, `genre`, `artist`, `album`, `name`, `cur_user_notes`.

---

## `tests/endpoints/test_music_notes.py` — new file

Setup: register + login a user; patch MongoDB to `mongomock`; use test Postgres DB.

**POST /songs/ai-analysis — conversation state side-effect**
- [ ] First call: no `ConversationState` document exists before call; document created after.
- [ ] Second call: existing `response_id` is read and set on the assistant; document updated with new `response_id`.
- [ ] MongoDB read/write failure does not prevent the endpoint returning 200.

**POST /songs/notes**
- [ ] 401 with no session.
- [ ] 422 when any required field is missing.
- [ ] 422 when any field is an empty string.
- [ ] 200 with `{ "song_note_id": int }` on valid request.
- [ ] Second call with same song returns the same `song_note_id` and updates notes.

**GET /songs/notes**
- [ ] 401 with no session.
- [ ] Returns empty list when no notes saved.
- [ ] Returns correct rows after `POST /songs/notes`.
- [ ] `?genre=` filter returns only matching rows.
- [ ] `?artist=` filter returns only matching rows.
- [ ] Results do not include notes belonging to a different user.

**Logout clears conversation state**
- [ ] `POST /auth/logout` → second `POST /songs/ai-analysis` call has no prior `response_id` (verified via mock).

---

## Running tests

```bash
pytest tests/ -v
```

To run only feature-3 tests:

```bash
pytest tests/services/test_cache.py tests/services/test_ai_analysis.py tests/services/test_song_notes.py tests/endpoints/test_music_notes.py -v
```

---

## What is NOT tested here

- Real MongoDB Atlas connectivity.
- Real OpenAI calls or actual conversation threading.
- Chordify scraping.
