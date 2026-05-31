# Feature 2 — Implementation Tasks

Tasks are ordered by dependency. Complete each group before starting the next.

---

## Group 1 — MongoDB setup

- [ ] **1.1** Add `pymongo` to `requirements.txt` and install.
- [ ] **1.2** Add `MONGODB_URI` and `MONGODB_DB_NAME` to `app/config/settings.py` (env-var driven, no defaults for URI).
- [ ] **1.3** Add `MONGODB_URI` and `MONGODB_DB_NAME` to `.env`.
- [ ] **1.4** Create `app/config/mongo.py` with `get_mongo_db()` — lazy singleton MongoClient returning the named database.
- [ ] **1.5** Export `get_mongo_db` from `app/config/__init__.py`.

---

## Group 2 — Cache service

- [ ] **2.1** Create `app/services/cache.py` with three functions:
  - `write_cache(db, user_id, song_name, beats, sections, chord_grid)` — upserts one document per collection.
  - `read_cache(db, user_id)` — returns `{ "beats", "sections", "chord_grid" }` or `None` if any is missing.
  - `clear_cache(db, user_id)` — deletes all three documents for the user; silent if none exist.
- [ ] **2.2** Wire `write_cache` into `GET /songs/{song_name}/analytics` — call after the MusicReader result is returned, inside a try/except so MongoDB errors do not affect the response.
- [ ] **2.3** Wire `clear_cache` into `POST /auth/logout` — call before `logout_user`.

---

## Group 3 — AI analysis

- [ ] **3.1** Create `app/services/ai_analysis.py` with `get_ai_analysis(user_prompt, cache) -> str` that instantiates `MusicAnalyticsAssistant` and calls `get_analysis`.
- [ ] **3.2** Add Pydantic request schema `AIAnalysisRequest(prompt: str)` to `app/models/music.py` or inline in the endpoint.
- [ ] **3.3** Add `POST /api/v1/music/songs/ai-analysis` to `app/endpoints/music.py`:
  - Protected by `require_session`.
  - Reads `user_id` from the session object returned by `require_session`.
  - Calls `read_cache(db, user_id)` → raises 404 if `None`.
  - Calls `get_ai_analysis(body.prompt, cache)` → returns `{ "analysis": result }`.

---

## Group 4 — Smoke test

- [ ] **4.1** Call `GET /songs/{song_name}/analytics` and verify three documents appear in MongoDB Atlas.
- [ ] **4.2** Call `POST /songs/ai-analysis` with a prompt and verify an AI string is returned.
- [ ] **4.3** Call `POST /auth/logout` and verify the three MongoDB documents are gone.
- [ ] **4.4** Call `POST /songs/ai-analysis` after logout and verify 404 is returned.
