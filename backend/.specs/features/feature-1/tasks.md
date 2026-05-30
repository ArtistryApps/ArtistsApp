# Feature 1 — Implementation Tasks

Tasks are ordered by dependency. Complete each group before starting the next.

---

## Group 1 — Foundation (no app code yet)

- [ ] **1.1** Add `starlette[sessions]` and `python-multipart` to `requirements.txt` (needed for `SessionMiddleware`).
- [ ] **1.2** Update `app/config/settings.py`:
  - Make `POSTGRES_PASSWORD` a `@cached_property` that calls `get_secret("SUPABASE_PASSWORD")` instead of reading an env var.
  - Add `SUPABASE_HOST`, `SUPABASE_PORT`, `SUPABASE_USER`, `SUPABASE_DB` env-var fields (with sensible defaults).
  - Add `SESSION_SECRET` env-var field (used by SessionMiddleware).
- [ ] **1.3** Update `app/config/database.py` to build `DATABASE_URL` from the new Supabase fields.

---

## Group 2 — Database models

- [ ] **2.1** Create `app/db/__init__.py` (empty).
- [ ] **2.2** Create `app/db/models.py` with all SQLAlchemy models:
  - Auth group: `Privilege`, `User`, `Session`
  - Domain group: `Genre`, `Artist`, `Album`, `Song`, `SongChecksDate`, `SongNotes`
  - All models inherit from the existing `Base` in `app/models/__init__.py`.
- [ ] **2.3** Update `app/models/__init__.py` to import the new models so `Base.metadata.create_all()` in `main.py` picks them up.

---

## Group 3 — Auth service layer

- [ ] **3.1** Create `app/services/municipalities.py` — returns a static hardcoded list of municipality strings.
- [ ] **3.2** Create `app/models/user.py` — Pydantic schemas:
  - `LoginRequest`, `RegisterRequest`
  - `SessionResponse`, `UserDetailsResponse`
- [ ] **3.3** Create `app/core/__init__.py` (empty).
- [ ] **3.4** Create `app/core/session.py` — `require_session` dependency:
  - Reads `session_token` from `request.session`.
  - Queries `Session` table: `open=True`, `dt_expires > utcnow()`.
  - Raises `HTTPException(401)` if not found or expired.
- [ ] **3.5** Create `app/services/auth.py` with three functions:
  - `register_user(db, email, role, password, municipality)` — salt generation, sha-256 hashing, inserts `User`. Raises `409` if email exists.
  - `login_user(db, email, password)` — verifies hash, inserts `Session` (24 h expiry, `token_urlsafe(32)`), returns dict for `SessionResponse`.
  - `logout_user(db, session_token)` — sets `Session.open = False`.

---

## Group 4 — Auth endpoints

- [ ] **4.1** Create `app/endpoints/auth.py` with router and all five auth routes (mirror of the reference code, adapted to the existing module paths):
  - `GET /auth/municipalities`
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/logout`
  - `GET /auth/my_details`
- [ ] **4.2** Update `app/main.py`:
  - Add `SessionMiddleware` (secret from `settings.SESSION_SECRET`).
  - Register `auth.router`.

---

## Group 5 — Song analytics endpoint

- [ ] **5.1** Update `app/endpoints/music.py` (or `app/controllers/music_controller.py`) to add:
  - `GET /songs/{song_id}/analytics`
  - Protected by `require_session`.
  - Loads the song, calls `MusicReader` to get the 3-tuple.
  - Returns `{ "Beat Analysis": ..., "Section Analysis": ..., "Chord Analysis": ... }`.
- [ ] **5.2** Confirm `MusicReader` call signature by checking its installed package and adjust the controller accordingly.

---

## Group 6 — Wiring & smoke test

- [ ] **6.1** Run `uvicorn app.main:app --reload` and verify `/docs` shows all new endpoints.
- [ ] **6.2** Manually POST `/auth/register` then `/auth/login`; confirm cookie is set and `/auth/my_details` returns the correct user.
- [ ] **6.3** Confirm `/songs/1/analytics` returns 401 when called without a session.

---

## Notes

- Do not remove the old `songs`, `beats`, `sections`, `chords` models yet — they may still be referenced by existing adapters. Treat that as a separate cleanup task.
- GCP credentials must be available in the environment (`GOOGLE_APPLICATION_CREDENTIALS` env var pointing to the service account JSON) for the secrets fetch to work locally.
