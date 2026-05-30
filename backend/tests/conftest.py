"""Shared test fixtures."""
import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Provide credentials before any app module is imported so the lazy
# cached_property never tries to reach GCP.
os.environ.setdefault("POSTGRES_PASSWORD", "test")
os.environ.setdefault("SESSION_SECRET", "test-secret")

from app.main import create_app          # noqa: E402
from app.config.database import get_db  # noqa: E402
from app.models import Base              # noqa: E402

_SQLITE_URL = "sqlite:///./test_shared.db"

_engine = create_engine(_SQLITE_URL, connect_args={"check_same_thread": False})
_Session = sessionmaker(autocommit=False, autoflush=False, bind=_engine)


def _override_db():
    db = _Session()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def create_tables():
    Base.metadata.create_all(bind=_engine)
    yield
    Base.metadata.drop_all(bind=_engine)


@pytest.fixture
def db(create_tables):
    Base.metadata.create_all(bind=_engine)
    session = _Session()
    yield session
    session.rollback()
    session.close()


@pytest.fixture
def client(create_tables):
    application = create_app()
    application.dependency_overrides[get_db] = _override_db
    with TestClient(application, raise_server_exceptions=True) as c:
        yield c
    application.dependency_overrides.clear()
