"""Database models — Base and public re-exports."""
from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import submodules so Base.metadata registers every table.
# .music imports Base from here; the order is safe.
from .music import SongAnalysis, Beat, Section, Chord  # noqa: E402
from .user import LoginRequest, RegisterRequest, SessionResponse, UserDetailsResponse  # noqa: E402

__all__ = [
    "Base",
    # Legacy analysis models
    "SongAnalysis", "Beat", "Section", "Chord",
    # Auth / request-response schemas
    "LoginRequest", "RegisterRequest", "SessionResponse", "UserDetailsResponse",
]
