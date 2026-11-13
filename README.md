# Artists App

**The goal: automatically build practice sessions for musicians and bands.**

The idea came from playing in a band, where an app that prepared practice sessions automatically would have helped a lot. Artists App takes a song, works out its structure, and turns that into a ready-to-use session inside a DAW (digital audio workstation) such as Pro Tools or Reaper. Doing that relies heavily on the DAWs' SDKs and APIs.

## How it works

The core is **MusicReader**, a private Python package that does the music understanding:

1. **Read the song.** Work out its beats, bars and chords, with each chord's quality and scale degree relative to the song's key.
2. **Find the structure.** Split the song into sections (verse, chorus, bridge, …) and analyze the chord progression in each one.
3. **Explain it.** An AI assistant answers questions about the analyzed song, and the conversation carries over between questions.
4. **Build the practice session** (in progress). Use the analysis to set up practice material automatically in a DAW.

Companion private packages add related tools. For example, **VideoEditor** aligns and merges separately recorded audio and video takes.

This repository is the web app around those packages. It handles user accounts, the analysis dashboard, the AI chat, per-song research notes and the video tool. The core features live in separate private repositories and are installed as packages when the Docker image is built, which is why most of the music logic doesn't appear in this codebase.

## Roadmap

What exists today is the web app and the analysis pipeline, deployed with Docker Compose on a VM (see [Deployment](#deployment)). The plan, still being worked out:

- **Packaging and deployment:** publish the private packages to GCP Artifact Registry and install them while GitHub Actions builds the image. Then push the image to Artifact Registry and deploy it on Cloud Run. Infrastructure may later move into Terraform repositories.
- **DAW host:** DAWs need a desktop, so they'll run on a Windows VM set up over RDP. The app will start and stop that VM through the GCP API. The fallback is a self-owned machine connected to the GCP VPC through Cloud VPN.
- **Frontend and backend split:** how these should work in the final product isn't decided yet.
- **AI in the workflow:** the project is developed with Claude Code, and the plan is to use it in the GitHub Actions workflows too (see below).

## How it's built: spec-driven development with Claude Code

The final goal spans several parts: music analysis packages, a web app, cloud infrastructure, a remotely controlled Windows VM and DAW integrations. Too much of that is still undecided to start coding straight away. So every feature starts as a written spec, and Claude Code implements it from the spec.

### The spec workflow

Every feature gets a numbered folder under `backend/.specs/features/feature-N/` (and `frontend/.specs/features/` for UI work):

| File | Purpose |
|------|---------|
| `feature.md` | What the feature does, who uses it, and the acceptance criteria |
| `design.md` | How it will be built: affected modules, data model, endpoints |
| `tasks.md` | Checkbox tasks, grouped and ordered by dependency |
| `tests.md` | The tests that prove the acceptance criteria are met |

Project-wide coding rules live in `backend/.specs/project/conventions.md`, so every spec is implemented the same way. Simple features can get by with just `feature.md`. Larger ones use all four files.

For example, feature 3 added conversation continuity for the AI assistant, song notes and song filtering. It was specified this way and then built group by group from its `tasks.md`.

### Claude skills and plugins

Claude Code gets repo-specific context from `.claude/CLAUDE.md` and runs repeatable workflows as **skills**. The first one, `implement-new-feature`, turns a spec into code:

1. Lists the available feature specs and asks which one to implement (default: the latest).
2. Asks whether to build the full spec structure (`feature` / `design` / `tasks` / `tests`) or work from `feature.md` alone.
3. Proposes two ways to solve the problem and implements the one chosen. If neither fits, it works with the developer until the approach is right.
4. Shows a summary of the changes at the end.

The plan is to keep turning recurring steps into skills and bundle them as **Claude Code plugins** as the project grows. Two kinds of steps are in view:

- **Development:** writing specs, implementing features, reviewing changes against the spec.
- **Operations:** packaging the private libraries, building and deploying images, managing the GCP infrastructure and the DAW VM.

The same skills are meant to run in **GitHub Actions**. That way the specs, the code and the automation that delivers the final goal all follow the same documented process.

## Tech stack

| Part | Stack |
|------|-------|
| Backend (`backend/`) | FastAPI, SQLAlchemy 2, Alembic, pymongo |
| Frontend (`frontend/`) | React 18, TypeScript, Vite, react-hook-form + Zod, axios |
| Relational DB | PostgreSQL (hosted on Supabase) |
| Cache / conversation state | MongoDB |
| Analysis engines | `MusicReader` and `VideoEditor` (private packages) |
| Secrets | GCP Secret Manager (used when env vars aren't set) |
| Deployment | Docker Compose on a VM, images on `ghcr.io/artistryapps` |

## Getting started

### Prerequisites

- Docker and Docker Compose
- Python 3.11 and Node.js 20 for running locally without Docker
- Access to the private PyPI index that hosts `MusicReader` and `VideoEditor`
- A Postgres database and a MongoDB instance

### Environment variables

Create a `.env` file in the project root:

```bash
# Postgres
POSTGRES_HOST=...
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_DB=postgres
POSTGRES_PASSWORD=...          # if unset, read from GCP secret SUPABASE_PASSWORD

# Cookie sessions
SESSION_SECRET=...             # if unset, read from GCP secret SESSION_SECRET

# MongoDB
MONGODB_URI=mongodb://...
MONGO_DB_NAME=artistsapp

# OpenAI (used by MusicReader's AI analysis)
OPENAI_API_KEY=...
OPENAI_KEY=...
OPENAI_PROJECT=...

# Private package index (Docker build args)
PRIVATE_PYPI_URL=...
PRIVATE_PYPI_USER=...
PRIVATE_PYPI_PASS=...
```

When `POSTGRES_PASSWORD` or `SESSION_SECRET` is missing, the backend fetches it from GCP Secret Manager (project `musicwebsite-425022`). That requires `GOOGLE_APPLICATION_CREDENTIALS` to point at a service-account JSON file.

> `docker-compose.yml` does not currently pass `POSTGRES_PASSWORD` or `SESSION_SECRET` to the `api` container. Inside Docker, both come from Secret Manager.

### Run with Docker

```bash
docker compose up -d --build
docker compose logs -f api   # or: web
```

| Service | URL |
|---------|-----|
| Frontend (Vite dev server) | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Swagger UI / ReDoc | http://localhost:8080/docs and `/redoc` |

The frontend proxies `/api` and `/auth` to `http://api:8080`, using the `artistry-network` Docker network.

The backend image builds on top of `ghcr.io/artistryapps/artists_api_base:latest`. That base image comes from `backend/Dockerfile.base` and pre-installs ffmpeg, torch, tensorflow and the other heavy ML dependencies. Rebuild and push the base image only when those pinned dependencies change.

### Run locally

Backend:

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows; use `source venv/bin/activate` elsewhere
pip install -r requirements.txt --extra-index-url <private-pypi-url>
uvicorn app.main:app --reload --port 8080
```

To debug, `backend/debugging-entrypoint.sh` starts uvicorn under `debugpy` on port 5678 and waits for a debugger to attach. A VS Code launch config is in `backend/dot-vscode/launch.json`.

Frontend:

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
npm run build        # type-check and production build
npm run lint
npm run type-check
```

When you run Vite outside Docker, the proxy target `http://api:8080` won't resolve. Change it in `vite.config.ts` to `http://localhost:8080`.

## Architecture

### Backend

```
backend/app/
├── main.py          # create_app(): session + CORS middleware, routers, create_all on startup
├── config/          # settings (env + GCP fallback), lazy Postgres engine, lazy Mongo client
├── core/            # require_session dependency
├── ports/           # abstract interfaces (IMusicAnalysisPort, IMusicRepositoryPort)
├── adapters/        # MusicReader adapter, SQLAlchemy repository adapter
├── controllers/     # MusicController (orchestrates the adapters)
├── services/        # auth, Mongo cache, AI analysis, song notes
├── models/          # declarative Base + original music models
├── db/models.py     # auth and domain tables
└── endpoints/       # health, auth, music, video routers
```

- **Hexagonal core.** The original song-analysis flow goes ports → adapters → controller → endpoint. Newer features (auth, notes, AI analysis, caching) are plain functions in `services/` that endpoints call directly.
- **Lazy heavy imports.** `MusicReader`, `VideoEditor` and their ML dependencies are imported inside the functions that use them. App startup and tests stay fast and don't need those packages loaded.
- **Authentication.** `POST /auth/login` stores a session token in a signed cookie (Starlette `SessionMiddleware`). Protected routes depend on `require_session`, which checks the `sessions` table for an open, unexpired session.
- **Analysis flow.** `GET /songs/{song_name}/analytics` runs MusicReader and caches the result in MongoDB. `POST /songs/ai-analysis` asks the AI assistant about the cached song. It keeps the OpenAI `response_id` in MongoDB so follow-up questions continue the same conversation.

### Frontend

```
frontend/src/
├── App.tsx          # auth state + page switching (no router)
├── components/      # LoginPage, HomePage, AnalyticsDashboard, VideoEditorPage, MusicAnalyzer
├── services/        # one module per API area (auth, analytics, chat, notes, video, ...)
├── schemas/         # Zod schemas for API contracts
├── hooks/           # form and analysis hooks
└── utils/api-client.ts
```

`App.tsx` switches pages by state instead of using a router. All requests go through a shared axios instance (`withCredentials: true` so the session cookie is sent). Any 401 response triggers a window `unauthorized` event, and the app returns to the login page. The `@/` import alias maps to `src/`.

## API

All routes except `/health` and `/auth/register` / `/auth/login` require a valid session.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Health check |
| POST | `/auth/register` | Create a user (`email`, `role`, `password`) |
| POST | `/auth/login` | Log in and set the session cookie |
| POST | `/auth/logout` | Close the current session |
| GET | `/auth/my_details` | Current user's details |
| POST | `/api/v1/music/analyze` | Analyze a song from its beats/chords and store it |
| GET | `/api/v1/music/song/{song_id}` | Retrieve a stored analysis |
| GET | `/api/v1/music/songs/{song_name}/analytics` | Beat, section and chord analysis via MusicReader |
| POST | `/api/v1/music/songs/ai-analysis` | AI insight about the cached analysis (`prompt`) |
| POST | `/api/v1/music/songs/notes` | Save research notes for a song |
| GET | `/api/v1/music/songs/notes` | Filter the current user's notes |
| POST | `/api/v1/video/video/join_audio_video_overlap` | Align and merge base64 audio and video |

Full request and response schemas are in Swagger at `/docs`.

## Database

Postgres tables:
- **Auth:** `users`, `sessions`, `privileges`
- **Music catalog:** `genres`, `artists`, `albums`, `songs`, `song_checks_date`, `song_notes`
- **Analysis:** `legacy_songs`, `beats`, `sections`, `chords`

MongoDB holds the analysis cache and the `ConversationState` collection.

The schema can change in three ways, and they need to stay in sync:
- Alembic migrations in `backend/alembic/versions/`. Run `alembic upgrade head` from `backend/`; the database URL comes from the app settings.
- Raw SQL migrations for Supabase in `supabase/migrations/`.
- `Base.metadata.create_all`, which runs on API startup.

## Testing

```bash
cd backend
pytest tests/                               # everything
pytest tests/endpoints/test_auth.py         # one file
pytest tests/test_music.py::test_name       # one test
pytest --cov=app tests/                     # coverage (needs pytest-cov)
```

`tests/conftest.py` sets dummy `POSTGRES_PASSWORD` and `SESSION_SECRET` values before the app is imported, so tests never contact GCP. It also points `get_db` at a local SQLite file. Use the `client` fixture for endpoint tests and `db` for direct session tests.

## Development conventions

- Backend style rules are in `backend/.specs/project/conventions.md`: typed parameters using `typing` generics, short docstrings, `_private` members, relative imports inside `app/`, exports listed in `__init__.py` / `__all__`, and ruff with ~85-column lines.
- New work starts as a spec under `.specs/features/` (see [How it's built](#how-its-built-spec-driven-development-with-claude-code)).
- Commit messages start with an uppercase past-tense verb, e.g. `ADDED:`, `FIXED:`, `UPDATED:`, `REFACTORED:`.

## Deployment

Every push to `main` triggers `.github/workflows/deploy.yml`:

1. Bumps the patch version tag (`vX.Y.Z`).
2. A self-hosted runner SSHes into the VM and runs `git pull` there.
3. For each of `frontend/` and `backend/` that changed in the last commit, it rebuilds that compose service (`web` / `api`), restarts it, and pushes the image to `ghcr.io/artistryapps/`.

This is the current setup. The plan is to move to Artifact Registry and Cloud Run (see [Roadmap](#roadmap)).

## License

MIT
