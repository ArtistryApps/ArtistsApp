"""Application settings and configuration."""
import os
from typing import Optional


class Settings:
    """Application configuration."""
    
    # Database
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "password")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "artists_db")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "psql")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))
    
    # Database URL
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # API Configuration
    API_TITLE: str = "Artists API"
    API_VERSION: str = "0.1.0"
    API_DESCRIPTION: str = "FastAPI backend for music composition analysis"
    
    # OpenAI
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    OPENAI_PROJECT: Optional[str] = os.getenv("OPENAI_PROJECT")
    
    # External APIs
    USERNAME_API_CIVITAS: Optional[str] = os.getenv("USERNAME_API_CIVITAS")
    USERID_API_CIVITAS: Optional[str] = os.getenv("USERID_API_CIVITAS")
    PASSWORD_API_CIVITAS: Optional[str] = os.getenv("PASSWORD_API_CIVITAS")


settings = Settings()
