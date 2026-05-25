"""Additional tests for music models and adapters."""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models import Base
from app.models.music import Song, Beat, Section
from app.adapters.repository_adapter import MusicRepositoryAdapter
from app.adapters.music_adapter import MusicAnalysisAdapter

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_models.db"

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


class TestMusicRepository:
    """Test music repository adapter."""
    
    def test_save_and_get_song(self, db_session):
        """Test saving and retrieving a song."""
        repo = MusicRepositoryAdapter(db_session)
        
        song_data = {
            "name": "Test Song",
            "artist": "Test Artist",
            "key": "C",
            "bpm": 120
        }
        
        song_id = repo.save_song(song_data)
        assert song_id > 0
        
        retrieved = repo.get_song(song_id)
        assert retrieved is not None
        assert retrieved["name"] == "Test Song"
        assert retrieved["artist"] == "Test Artist"
    
    def test_save_and_get_beats(self, db_session):
        """Test saving and retrieving beats."""
        repo = MusicRepositoryAdapter(db_session)
        
        song_id = repo.save_song({
            "name": "Test Song",
            "artist": "Test Artist"
        })
        
        beats = [
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
        
        repo.save_beats(song_id, beats)
        retrieved_beats = repo.get_beats(song_id)
        
        assert len(retrieved_beats) == 2
        assert retrieved_beats[0]["chord"] == "C:maj"
        assert retrieved_beats[0]["is_new"] is True
    
    def test_save_and_get_sections(self, db_session):
        """Test saving and retrieving sections."""
        repo = MusicRepositoryAdapter(db_session)
        
        song_id = repo.save_song({
            "name": "Test Song",
            "artist": "Test Artist"
        })
        
        sections = [
            {
                "section": "Verse",
                "section_repeat": 1,
                "chords": ["C", "F"],
                "num_bars": 8,
                "most_frequent_progression": ["I", "IV"],
                "avg_beats_per_chord_change": 4.0
            }
        ]
        
        repo.save_sections(song_id, sections)
        retrieved_sections = repo.get_sections(song_id)
        
        assert len(retrieved_sections) == 1
        assert retrieved_sections[0]["section_name"] == "Verse"
        assert retrieved_sections[0]["num_bars"] == 8


class TestMusicAnalysisAdapter:
    """Test music analysis adapter."""
    
    def test_chord_to_quality(self):
        """Test chord quality extraction."""
        adapter = MusicAnalysisAdapter()
        
        quality = adapter.chord_to_quality("C:maj")
        assert quality == "maj"
        
        quality = adapter.chord_to_quality("Am:min")
        assert quality == "min"
    
    def test_identify_sections(self):
        """Test section identification."""
        beats = [
            {"chord": "C", "beat_in_bar": 4},
            {"chord": "C", "beat_in_bar": 4},
            {"chord": "F", "beat_in_bar": 4},
            {"chord": "F", "beat_in_bar": 4},
        ]
        
        result = MusicAnalysisAdapter.identify_sections(beats)
        assert len(result) > 0
        assert all('section' in beat for beat in result)
