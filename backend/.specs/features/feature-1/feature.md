# Feature 1 — Feature Description

## Summary

Deliver the initial backend for ArtistsApp. Two user-facing capabilities:

1. Users can log in, register, and maintain authenticated sessions.
2. Authenticated users can retrieve song analytics (beat, section, and chord data) for a given song.

---

## Capability 1: Authentication & Session Management

### Who uses it
Any user accessing the app for the first time, or returning users resuming a session.

### What it does
- **Register** — Creates a new user account with a hashed password, a municipality, and a default privilege level.
- **Login** — Validates credentials, creates a session token stored in the database, sets it in a secure server-side session cookie.
- **Logout** — Closes the active session in the database and clears the cookie.
- **My Details** — Returns the authenticated user's profile including their privilege level.
- **Municipalities** — Returns the list of valid municipalities (no auth required, used to populate a registration dropdown).

### Acceptance criteria
- A registered user can log in and receive a session token.
- The session token is stored as a secure cookie in the browser (via SessionMiddleware).
- The session expires after 24 hours; expired sessions are rejected.
- Logging out marks the session as closed; subsequent requests with that token return 401.
- Registering with an already-used email returns a clear 409 error.
- Passwords are never stored in plaintext.

---

## Capability 2: Song Analytics Endpoint

### Who uses it
Authenticated users on the initial dashboard view.

### What it does
Returns pre-computed music analysis for a song in three structured categories:

| Key | Description |
|-----|-------------|
| `Beat Analysis` | One row per beat: chord, position in bar/section, label, whether it is a chord change. |
| `Section Analysis` | One row per section occurrence: unique chords, bar count, most frequent progression, avg beats per chord change. |
| `Chord Analysis` | One row per section occurrence keyed by beat number: which chord is playing on each beat. |

### Acceptance criteria
- Endpoint requires a valid session; unauthenticated requests return 401.
- Response contains exactly the three keys `Beat Analysis`, `Section Analysis`, `Chord Analysis`.
- Each value is a list of dictionaries.
- A request for a non-existent song returns 404.
- The shape of each item matches the examples in `feature-1.md`.

---

## API Surface

### Auth endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET  | `/auth/municipalities` | No  | List of municipalities |
| POST | `/auth/register`       | No  | Create account |
| POST | `/auth/login`          | No  | Obtain session token |
| POST | `/auth/logout`         | Yes | Close session |
| GET  | `/auth/my_details`     | Yes | Current user profile |

### Analytics endpoint

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/songs/{song_id}/analytics` | Yes | Beat, section, chord analysis |

---

## Pydantic schemas

### Requests

**RegisterRequest**
```json
{
  "email": "user@example.com",
  "role": "artist",
  "password": "secret",
  "municipality": "Lisboa"
}
```

**LoginRequest**
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```

### Responses

**SessionResponse**
```json
{
  "session_token": "abc123...",
  "expires_at": "2026-05-27T12:00:00+00:00"
}
```

**UserDetailsResponse**
```json
{
  "user_id": 1,
  "email": "user@example.com",
  "role": "artist",
  "municipality": "Lisboa",
  "privilege_id": 1,
  "privilege_level": "standard",
  "created_at": "2026-05-26T10:00:00+00:00"
}
```

**SongAnalyticsResponse**
```json
{
  "Beat Analysis": [
    {
      "beat": 3,
      "bar": 0,
      "bar_in_section": 0,
      "beat_in_bar": 4,
      "chord": "Ab:min",
      "label": "La♭ₘ",
      "is_new": true,
      "section": "section 1",
      "section_repeat": 1,
      "chord_degree": "",
      "chord_quality": "min"
    }
  ],
  "Section Analysis": [
    {
      "section": "section 1",
      "section_repeat": 1,
      "chords": ["Ab:min", "Eb:min", "B:maj", "Gb:maj", "Db:maj"],
      "num_bars": 8,
      "most_frequent_progression": ["Ab:min", "Eb:min", "Ab:min", "B:maj"],
      "avg_beats_per_chord_change": 3.625
    }
  ],
  "Chord Analysis": [
    {
      "section": "section 1 (2)",
      "beat 1": "Ab:min",
      "beat 2": "Ab:min",
      "beat 5": "B:maj"
    }
  ]
}
```

---

## Out of scope for this feature

- Frontend rendering of analytics data.
- Feelings / emotional attribution flows.
- Song CRUD (creation, upload, deletion).
- Admin privilege management.
