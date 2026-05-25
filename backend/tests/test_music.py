"""Tests for music endpoints."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import create_app
from app.config.database import get_db
from app.models import Base

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    """Override get_db for tests."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    """Create test client."""
    Base.metadata.create_all(bind=engine)
    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    
    client = TestClient(app)
    yield client
    
    Base.metadata.drop_all(bind=engine)


def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_analyze_song(client):
    """Test song analysis endpoint."""
    payload = {
        "song_data": {
            "name": "Test Song",
            "artist": "Test Artist",
            "key": "C",
            "bpm": 120
        },
        "beats": [
            {
                "beat_index": 0,
                "bar_number": 1,
                "beat_in_bar": 1,
                "chord": "C:maj",
                "is_new": True
            },
            {
                "beat_index": 1,
                "bar_number": 1,
                "beat_in_bar": 2,
                "chord": "C:maj",
                "is_new": False
            }
        ]
    }
    
    response = client.post("/api/v1/music/analyze", json=payload)
    assert response.status_code == 200
    result = response.json()
    assert "song_id" in result
    assert "beats" in result
    assert "sections" in result
