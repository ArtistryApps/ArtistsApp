"""Application settings and configuration."""
import os
from functools import cached_property
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application configuration."""

    # Supabase / Postgres connection (all except password come from env)
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "postgres")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))

    MONGODB_URI:     str = os.getenv("MONGODB_URI", "")
    MONGODB_DB_NAME: str = os.getenv("MONGO_DB_NAME", "artistsapp")

    # API metadata
    API_TITLE: str = "Artists API"
    API_VERSION: str = "0.1.0"
    API_DESCRIPTION: str = "FastAPI backend for music composition analysis"

    @cached_property
    def POSTGRES_PASSWORD(self) -> str:
        """Prefer env var so tests and local dev never hit GCP."""
        env_val = os.getenv("POSTGRES_PASSWORD")
        if env_val:
            return env_val
        from .secrets import get_secret
        return get_secret("SUPABASE_PASSWORD")

    @cached_property
    def SESSION_SECRET(self) -> str:
        """Prefer env var so tests and local dev never hit GCP."""
        env_val = os.getenv("SESSION_SECRET")
        if env_val:
            return env_val
        from .secrets import get_secret
        return get_secret("SESSION_SECRET")

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


settings = Settings()
