"""FastAPI application factory."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from .config import settings, get_engine
from .endpoints import auth_router, health_router, music_router


@asynccontextmanager
async def _lifespan(_: FastAPI):
    from .models import Base
    Base.metadata.create_all(bind=get_engine())
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.API_TITLE,
        version=settings.API_VERSION,
        description=settings.API_DESCRIPTION,
        lifespan=_lifespan,
    )

    app.add_middleware(SessionMiddleware, secret_key=settings.SESSION_SECRET)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(music_router)
    app.include_router(auth_router)

    return app


app = create_app()
