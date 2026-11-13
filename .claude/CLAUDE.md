# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Music composition analysis app: FastAPI backend (`backend/`) + React/TypeScript/Vite frontend (`frontend/`), run together via `docker-compose.yml`. Postgres (hosted on Supabase) holds relational data; MongoDB holds analysis cache and AI conversation state.

Parts of `README.md` are out of date. The API listens on **8080**, not 8000, and the web container runs the **Vite dev server on 3000**, not nginx. `frontend/nginx.conf` is unused.

## Commands

Backend (run from `backend/`):
```bash
pip install -r requirements.txt          # needs private PyPI for MusicReader / VideoEditor
uvicorn app.main:app --reload --port 8080
pytest tests/                            # all tests
pytest tests/endpoints/test_auth.py      # one file
pytest tests/test_music.py::test_name    # one test
ruff check app                           # lint (max line length ~85)
alembic upgrade head                     # migrations (uses settings.DATABASE_URL)
```

Frontend (run from `frontend/`):
```bash
npm run dev          # Vite on :3000, proxies /api and /auth to http://api:8080
npm run build        # tsc && vite build
npm run lint
npm run type-check
```

Docker: `docker compose up -d --build`. `backend/debugging-entrypoint.sh` runs uvicorn under debugpy on port 5678 (`--wait-for-client`).

## Backend architecture

- `app/main.py`: `create_app()` factory. Sets up SessionMiddleware (cookie sessions) and CORS, registers the routers (`health`, `music` at `/api/v1/music`, `auth` at `/auth`, `video` at `/api/v1/video`), and calls `Base.metadata.create_all` on startup.
- Hexagonal layering for music analysis: `ports/` (abstract interfaces) → `adapters/` (`MusicAnalysisAdapter` wraps the external `MusicReader` package; `MusicRepositoryAdapter` wraps SQLAlchemy) → `controllers/MusicController` → `endpoints/`. Newer features (auth, notes, AI analysis, cache) skip ports/adapters and use plain functions in `services/`, called directly from endpoints.
- Models are in two places, both on the same `Base` from `app/models/__init__.py`. `app/models/` holds the original music models. `app/db/models.py` holds auth (`User`, `Session`, `Privilege`) and domain tables (`Genre`, `Artist`, `Album`, `Song`, `SongNotes`, …). Alembic's `env.py` imports both.
- Schema changes can go through three paths: Alembic (`backend/alembic/versions`), raw SQL in `supabase/migrations/`, and `create_all` at startup. Keep them consistent.
- Auth: `POST /auth/login` stores a `session_token` in the signed cookie session. Protected endpoints depend on `core.require_session`, which checks the `sessions` table for an open, unexpired row.
- Config (`app/config/`): `settings` reads env vars. `POSTGRES_PASSWORD` and `SESSION_SECRET` are lazy `cached_property`s that fall back to GCP Secret Manager (`config/secrets.py`) only when the env var is missing. Use `config.get_db` / `get_engine` / `get_mongo_db`, which are lazy singletons. `app/core/database.py` is a legacy module that calls GCP on import; don't use it.
- Heavy ML/media dependencies (`MusicReader`, `VideoEditor`, torch, demucs, etc.) are imported **inside** the endpoint/service functions that need them, so app startup and tests stay light. Keep new heavy imports lazy the same way.
- `MusicReader` is a private package. The adapters also `sys.path.insert` a hard-coded local Windows path to it.

## Testing

`tests/conftest.py` sets `POSTGRES_PASSWORD` and `SESSION_SECRET` env defaults **before** importing the app, so GCP is never contacted. It also overrides `get_db` with a SQLite file (`test_shared.db`). Use the `client` fixture (TestClient) for endpoint tests and `db` for direct session tests.

## Frontend architecture

- Navigation is state-based in `App.tsx`, with no router: `authenticated` + `currentPage` switch between `LoginPage`, `HomePage`, `AnalyticsDashboard` and `VideoEditorPage`.
- All HTTP goes through `src/utils/api-client.ts` (axios, `withCredentials: true` for the session cookie). A 401 dispatches a window `unauthorized` event, which `App` listens for to log the user out.
- One service module per API area in `src/services/`. Zod schemas for API contracts are in `src/schemas/index.ts`. Forms use react-hook-form + Zod. The `@/` alias maps to `src/`.

## Backend code conventions (from `backend/.specs/project/conventions.md`)

- Type every parameter, using `typing` generics (`Dict[str, Any]`, not `dict`).
- Prefix private members with `_`.
- Every function/method gets a short docstring (≤4 lines unless it's long and important).
- Import order: stdlib, then external libraries, then internal project modules. Use **relative** imports inside `app/` (`from ..config import settings`).
- Anything meant to be imported from a package goes in its `__init__.py` and its `__all__`.
- Use REST-style endpoint naming.

## Feature specs

Feature work is planned in `backend/.specs/features/feature-N/` and `frontend/.specs/features/feature-N/` (`feature.md`, `design.md`, `tasks.md` with checkbox task groups, `tests.md`). When implementing a feature, read its spec and update `tasks.md`.

## Deployment

On push to `main`, `.github/workflows/deploy.yml` bumps a `v*` patch tag. A self-hosted runner then SSHes to the VM, runs `git pull`, and rebuilds/pushes only the compose service (`web` or `api`) whose directory changed in the last commit. Images go to `ghcr.io/artistryapps/`. The backend image builds on `ghcr.io/artistryapps/artists_api_base` (see `backend/Dockerfile.base`).
    