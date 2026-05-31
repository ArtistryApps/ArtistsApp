# Feature 2 — AI Song Analysis with MongoDB Cache

## Summary

Two new capabilities built on top of the existing analytics pipeline:

1. **MongoDB Cache** — when a song is analysed the three payloads (beat, section, chord) are written to MongoDB as a per-user ephemeral cache. The cache is replaced when the user requests a different song and deleted on logout.
2. **AI Analysis Endpoint** — a new endpoint accepts a free-text user prompt, reads the cached analysis from MongoDB, and calls `MusicAnalyticsAssistant.get_analysis()` to return an AI-generated musical insight.

---

## Capability 1: MongoDB Cache

### Who uses it
Transparent to the user — internal infrastructure that makes AI analysis possible without re-scraping Chordify.

### What it does
- After `GET /songs/{song_name}/analytics` returns successfully, writes the three analysis payloads into three MongoDB collections, keyed by `user_id`.
- A new song request overwrites (upserts) the existing documents for that user.
- `POST /auth/logout` deletes all cache documents for that user.

### Acceptance criteria
- After calling the analytics endpoint, three documents exist in MongoDB for the logged-in user.
- Calling analytics for a second song replaces the previous documents, not appends to them.
- After logout, no cache documents remain for that user.
- A MongoDB connection failure must not break the analytics endpoint — fail silently and log.

---

## Capability 2: AI Analysis Endpoint

### Who uses it
Authenticated users who want AI-generated insight about the song currently loaded.

### What it does
- Accepts a free-text `prompt` (e.g. "What key is this song in?" or "Describe the chord progression").
- Reads the three cached payloads from MongoDB for the current user.
- Calls `MusicAnalyticsAssistant.get_analysis(prompt, chords_beat_by_beat, section_analysis, chord_grid)`.
- Returns the AI response string.

### Acceptance criteria
- Requires a valid session; unauthenticated requests return 401.
- Returns 404 if no cached analysis exists for the user (must call analytics endpoint first).
- Returns `{ "analysis": "..." }` on success.
- Missing or empty `prompt` returns 422.

---

## API Surface

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | `/songs/{song_name}/analytics` | Yes | (existing) now also writes MongoDB cache |
| POST | `/songs/ai-analysis`           | Yes | AI insight using cached song data |

### Request — POST /songs/ai-analysis

```json
{ "prompt": "What is the tonal centre of this song?" }
```

### Response — POST /songs/ai-analysis

```json
{ "analysis": "The tonal centre appears to be Ab minor, established strongly in section 1..." }
```

---

## Out of scope

- Persisting AI responses to the database.
- Multi-song cache history.
- Frontend UI for the prompt input (covered in the frontend feature spec).
