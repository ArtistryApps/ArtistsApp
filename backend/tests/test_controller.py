"""Integration tests for music controller."""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models import Base
from app.controllers.music_controller import MusicController
from app.adapters.music_adapter import MusicAnalysisAdapter
from app.adapters.repository_adapter import MusicRepositoryAdapter

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_controller.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


@pytest.fixture
def db_session():
    """Create test database session."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


class TestMusicController:
    """Test music controller."""
    
    def test_process_song_analysis(self, db_session):
        """Test complete song analysis processing."""
        analysis_adapter = MusicAnalysisAdapter()
        repository_adapter = MusicRepositoryAdapter(db_session)
        controller = MusicController(analysis_adapter, repository_adapter)
        
        song_data = {
            "name": "Test Song",
            "artist": "Test Artist",
            "key": "C",
            "bpm": 120
        }
        
        beats = [
            {
                "beat_index": 0,
                "bar_number": 1,
                "beat_in_bar": 4,
                "chord": "C:maj",
                "is_new": True
            },
            {
                "beat_index": 1,
                "bar_number": 1,
                "beat_in_bar": 4,
                "chord": "F:maj",
                "is_new": True
            }
        ]
        
        result = controller.process_song_analysis(song_data, beats)
        
        assert "song_id" in result
        assert result["song_id"] > 0
        assert "beats" in result
        assert "sections" in result
    
    def test_get_song_analysis(self, db_session):
        """Test retrieving song analysis."""
        analysis_adapter = MusicAnalysisAdapter()
        repository_adapter = MusicRepositoryAdapter(db_session)
        controller = MusicController(analysis_adapter, repository_adapter)
        
        # First, save a song
        song_data = {
            "name": "Test Song",
            "artist": "Test Artist",
            "key": "C"
        }
        
        beats = []
        result = controller.process_song_analysis(song_data, beats)
        song_id = result["song_id"]
        
        # Now retrieve it
        analysis = controller.get_song_analysis(song_id)
        
        assert analysis["song"]["name"] == "Test Song"
        assert analysis["song"]["artist"] == "Test Artist"
