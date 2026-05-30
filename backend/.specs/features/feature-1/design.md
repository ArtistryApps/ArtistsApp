# Feature 1 — Design

## Overview

Two independent deliverables sharing the same database connection:

1. **Song Analytics endpoint** — thin wrapper around MusicReader that returns 3 analysis payloads.
2. **Auth system** — session-token login/register/logout backed by Supabase Postgres.

---

## Database: Supabase Postgres

The existing `database.py` engine + `settings.py` pattern is kept. The only change is that `POSTGRES_PASSWORD` is no longer read from an env var — it is fetched from GCP Secret Manager at startup via the existing `secrets.get_secret("SUPABASE_PASSWORD")`.

`settings.py` is updated so the `DATABASE_URL` property calls `get_secret` once and caches the result.

Supabase connection details (host, port, db name, user) remain env-var driven so they can differ between local and prod.

---

## Module layout additions

```
app/
├── db/
│   └── models.py          ← all SQLAlchemy models (auth + domain)
├── models/
│   └── user.py            ← Pydantic request/response schemas for auth
├── services/
│   ├── auth.py            ← register_user, login_user, logout_user
│   └── municipalities.py  ← fetch_municipalities (static list)
├── core/
│   ├── session.py         ← require_session FastAPI dependency
│   └── middleware.py      ← SessionMiddleware setup helper
└── endpoints/
    ├── auth.py            ← /auth/* routes
    └── music.py           ← updated: add /songs/{song_id}/analytics
```

The existing hexagonal structure (ports / adapters / controllers) is left untouched for now. Auth is service-layer only; there is no adapter needed for password hashing or session tokens.

---

## SQLAlchemy models  (`app/db/models.py`)

### Auth group

```
Privilege
  privilege_id  PK, autoincrement
  privilege_level  String, not null

User
  user_id       PK, autoincrement
  email         String, unique, not null, indexed
  role          String, not null
  password_hash String, not null
  salt          String, not null
  municipality  String, not null
  privilege_id  FK → privileges.privilege_id, default 1
  created_at    DateTime(tz), server_default now()

Session
  session_id  PK, autoincrement
  dt_created  DateTime(tz), not null
  dt_expires  DateTime(tz), not null
  client_id   FK → users.user_id, not null
  token       String, unique, not null, indexed
  open        Boolean, not null, default True
```

### Domain group

```
Genre
  id_genre  PK, autoincrement
  genre     String, not null

Artist
  id_artist  PK, autoincrement
  artist     String, not null

Album
  id_album  PK, autoincrement
  genre     FK → genres.id_genre
  album     String, not null

Song
  id_song                PK, autoincrement
  genre                  FK → genres.id_genre
  artist                 FK → artists.id_artist
  album                  FK → albums.id_album
  song_name              String, not null
  song_complexity_score  Float, nullable

SongChecksDate
  song_check_id  PK, autoincrement
  user           FK → users.user_id
  song           FK → songs.id_song
  date_checked   DateTime(tz)

SongNotes
  song_note_id  PK, autoincrement
  user          FK → users.user_id
  song          FK → songs.id_song
  notes         String
```

> The existing `songs`, `beats`, `sections`, `chords` SQLAlchemy models in `app/models/music.py` are kept for backwards-compatibility during transition. The new `Song` in `app/db/models.py` maps to the normalised table schema required by the spec.

---

## Auth flow

```
POST /auth/register
  body: { email, role, password, municipality }
  → generates salt, hashes password (sha-256 + salt)
  → inserts User (privilege_id defaults to 1)
  → 201 { message }

POST /auth/login
  body: { email, password }
  → fetch User, verify hash
  → create Session row (token = secrets.token_urlsafe(32), expires in 24 h)
  → store token in Starlette session cookie
  → return SessionResponse { session_token, expires_at }

POST /auth/logout
  → read token from session cookie
  → set Session.open = False in DB
  → clear cookie
  → 200 { message }

GET /auth/my_details  [requires valid session]
  → join User + Privilege
  → return UserDetailsResponse

GET /auth/municipalities
  → static list of municipalities (no auth required)
```

### `require_session` dependency

Reads `session_token` from `request.session`, queries `Session` table for a row where `token = token`, `open = True`, `dt_expires > now()`. Raises `401` if not found.

### Session middleware

`starlette.middleware.sessions.SessionMiddleware` added in `main.py` with a secret key from GCP (`SESSION_SECRET`) or env var. This replaces the current CORS-only middleware approach. CORS middleware is kept.

---

## Song Analytics endpoint

```
GET /songs/{song_id}/analytics
  [requires valid session]
  → load song from DB (id_song)
  → call MusicReader to produce the 3-tuple
  → return:
    {
      "Beat Analysis":    [ { beat, bar, bar_in_section, beat_in_bar,
                              chord, label, is_new, section,
                              section_repeat, chord_degree, chord_quality }, … ],
      "Section Analysis": [ { section, section_repeat, chords, num_bars,
                               most_frequent_progression,
                               avg_beats_per_chord_change }, … ],
      "Chord Analysis":   [ { section, beat_N: chord, … }, … ]
    }
```

No transformation beyond key renaming. The controller calls MusicReader and returns the raw tuple items under the three named keys.

---

## Secret management

`app/config/secrets.py` already has `get_secret(secret_id)`. Settings is updated to call it lazily:

```python
@cached_property
def POSTGRES_PASSWORD(self) -> str:
    return get_secret("SUPABASE_PASSWORD")
```

This avoids calling GCP at import time during tests (mock-friendly).

---

## Password hashing

Use Python's `hashlib.sha256` with a per-user random salt (`secrets.token_hex(32)`). No third-party library dependency added.

```python
salt = secrets.token_hex(32)
password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
```

Verification re-hashes the candidate password with the stored salt and compares.
