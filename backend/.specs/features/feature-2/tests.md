# Feature 2 — Test Plan

## Test strategy

- **Cache service tests** — unit tests using `mongomock` so no real Atlas connection is needed.
- **AI analysis service tests** — unit tests with `MusicAnalyticsAssistant` mocked; no real OpenAI calls.
- **Endpoint tests** — via `TestClient`, with both `get_music_analysis` and `MusicAnalyticsAssistant` mocked, and `get_mongo_db` patched to return a `mongomock` database.

---

## conftest.py additions

```python
import mongomock

@pytest.fixture
def mongo_db():
    client = mongomock.MongoClient()
    db = client["test_artistsapp"]
    yield db
    client.close()

@pytest.fixture(autouse=True)
def patch_mongo(mongo_db, monkeypatch):
    monkeypatch.setattr("app.config.mongo.get_mongo_db", lambda: mongo_db)
```

---

## `tests/services/test_cache.py`

**write_cache**
- [ ] Three documents are created in the three collections after one `write_cache` call.
- [ ] `user_id` and `song_name` are stored correctly on each document.
- [ ] Calling `write_cache` a second time upserts (replaces) the documents — total document count stays at one per collection per user.

**read_cache**
- [ ] Returns `None` when no documents exist for the user.
- [ ] Returns a dict with keys `beats`, `sections`, `chord_grid` after `write_cache`.
- [ ] Returned `beats` value matches what was passed to `write_cache`.
- [ ] Returns `None` if only some collections have documents (partial cache).

**clear_cache**
- [ ] Deletes all three documents for the user.
- [ ] `read_cache` returns `None` immediately after `clear_cache`.
- [ ] Calling `clear_cache` for a user with no documents does not raise.
- [ ] `clear_cache` for user A does not affect documents belonging to user B.

---

## `tests/services/test_ai_analysis.py`

Setup: mock `MusicAnalyticsAssistant.get_analysis` to return `"mocked analysis"`.

- [ ] `get_ai_analysis` calls `get_analysis` with the correct `user_prompt`, `beats`, `sections`, `chord_grid` arguments.
- [ ] Returns the string returned by `get_analysis`.
- [ ] No real OpenAI call is made (mock verified via `assert_called_once_with`).

---

## `tests/endpoints/test_music_ai.py`

Setup: register + login a user; mock `get_music_analysis` to return fixture data; seed cache via `write_cache`.

**GET /songs/{song_name}/analytics (cache side-effect)**
- [ ] After a successful analytics call, three documents exist in the mock MongoDB for the logged-in user.
- [ ] A second analytics call for a different song replaces the documents (still three total).
- [ ] A MongoDB write error does not change the 200 response from the analytics endpoint.

**POST /songs/ai-analysis**
- [ ] 401 when no session cookie is present.
- [ ] 404 when no cache documents exist for the user.
- [ ] 200 with `{ "analysis": "..." }` when cache is populated and prompt is valid.
- [ ] 422 when `prompt` field is missing.
- [ ] 422 when `prompt` is an empty string.
- [ ] `get_analysis` is called with the data from the cache (verified via mock).

**Cache cleared on logout**
- [ ] `POST /auth/logout` → `POST /songs/ai-analysis` returns 404 (cache gone).

---

## Running tests

```bash
pytest tests/ -v
```

To run only cache and AI tests:

```bash
pytest tests/services/test_cache.py tests/services/test_ai_analysis.py tests/endpoints/test_music_ai.py -v
```

---

## What is NOT tested here

- Real MongoDB Atlas connectivity.
- Real OpenAI / GPT calls.
- Chordify scraping (mocked at `get_music_analysis` level).
