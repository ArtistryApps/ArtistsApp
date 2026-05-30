"""FastAPI route definitions."""
from .auth import router as auth_router
from .health import router as health_router
from .music import router as music_router

__all__ = ["auth_router", "health_router", "music_router"]
