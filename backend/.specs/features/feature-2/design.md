# Feature 2 — Design

## Overview

Two independent deliverables sharing the same MongoDB connection:

1. **Cache layer** — three MongoDB collections, one per analysis type, each holding at most one document per user.
2. **AI analysis service** — reads from cache and calls `MusicAnalyticsAssistant.get_analysis()`.

---

## MongoDB connection

Use **PyMongo** (synchronous, consistent with the existing SQLAlchemy sync approach).

Module: `app/config/mongo.py`

```python
from pymongo import MongoClient
from .settings import settings

_client = None

def get_mongo_db():
    global _client
    if _client is None:
        _client = MongoClient(settings.MONGODB_URI)
    return _client[settings.MONGODB_DB_NAME]
```

New fields in `settings.py`:
```python
MONGODB_URI:     str = os.getenv("MONGODB_URI")
MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "artistsapp")
```

New entry in `.env`:
```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
MONGODB_DB_NAME=artistsapp
```

---

## MongoDB collections

Three collections, one per analysis type. Each collection holds exactly one document per user (upserted on every analytics call).

| Collection | Document fields |
|---|---|
| `beat_analysis_cache` | `user_id`, `song_name`, `data: List[Dict]` |
| `section_analysis_cache` | `user_id`, `song_name`, `data: List[Dict]` |
| `chord_grid_cache` | `user_id`, `song_name`, `data: List[Dict]` |

`user_id` is the integer PK from the Postgres `users` table, obtained from the active session.

---

## Cache service — `app/services/cache.py`

```
write_cache(db, user_id, song_name, beats, sections, chord_grid) -> None
    Upserts one document per collection for this user.
    db is the PyMongo database handle (from get_mongo_db()).

read_cache(db, user_id) -> Optional[Dict]
    Returns { "beats": [...], "sections": [...], "chord_grid": [...] }
    or None if any collection has no document for this user.

clear_cache(db, user_id) -> None
    Deletes all three documents for this user.
    Silent no-op if documents do not exist.
```

---

## Cache lifecycle

| Event | Action |
|---|---|
| `GET /songs/{song_name}/analytics` succeeds | `write_cache(...)` — upserts, replacing old data |
| `POST /auth/logout` | `clear_cache(...)` before closing the session |

MongoDB errors during `write_cache` are caught, logged, and swallowed so the analytics response is not affected.

---

## AI analysis service — `app/services/ai_analysis.py`

```python
from MusicReader.src.MusicAnalyticsAssistant import MusicAnalyticsAssistant

def get_ai_analysis(user_prompt: str, cache: dict) -> str:
    assistant = MusicAnalyticsAssistant()
    return assistant.get_analysis(
        user_prompt,
        cache["beats"],
        cache["sections"],
        cache["chord_grid"],
    )
```

`MusicAnalyticsAssistant.get_analysis` is a two-step GPT call:
1. Identifies which analysis type (beat / section / chord) is relevant to the prompt.
2. Sends only the relevant data to GPT and returns the answer as a plain string.

---

## Module layout additions

```
app/
├── config/
│   └── mongo.py              ← MongoClient singleton + get_mongo_db()
└── services/
    ├── cache.py              ← write_cache / read_cache / clear_cache
    └── ai_analysis.py        ← get_ai_analysis()
```

Modified files:
- `app/config/settings.py`    ← add MONGODB_URI, MONGODB_DB_NAME
- `app/endpoints/music.py`    ← add POST /songs/ai-analysis; wire write_cache into analytics endpoint
- `app/endpoints/auth.py`     ← wire clear_cache into logout

---

## New endpoint

```
POST /api/v1/music/songs/ai-analysis
  [requires valid session]
  body: { "prompt": str }
  → read_cache(user_id) → 404 if None
  → get_ai_analysis(prompt, cache)
  → return { "analysis": str }
```
