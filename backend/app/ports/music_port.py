"""Music domain port interfaces."""
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional


class IMusicAnalysisPort(ABC):
    """Port for music analysis operations."""
    
    @abstractmethod
    def analyze_chords(self, beats: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Analyze and categorize chords in beats."""
        pass
    
    @abstractmethod
    def identify_sections(self, beats: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Identify musical sections from beats."""
        pass
    
    @abstractmethod
    def chord_to_degree(self, chord: str, song_key: str) -> Optional[str]:
        """Convert chord name to scale degree."""
        pass
    
    @abstractmethod
    def chord_to_quality(self, chord: str) -> Optional[str]:
        """Extract chord quality (e.g., major, minor, 7th)."""
        pass


class IMusicRepositoryPort(ABC):
    """Port for music data persistence."""
    
    @abstractmethod
    def save_song(self, song_data: Dict[str, Any]) -> int:
        """Save song to database."""
        pass
    
    @abstractmethod
    def get_song(self, song_id: int) -> Optional[Dict[str, Any]]:
        """Retrieve song from database."""
        pass
    
    @abstractmethod
    def save_beats(self, song_id: int, beats: List[Dict[str, Any]]) -> None:
        """Save beats for a song."""
        pass
    
    @abstractmethod
    def get_beats(self, song_id: int) -> List[Dict[str, Any]]:
        """Retrieve beats for a song."""
        pass
    
    @abstractmethod
    def save_sections(self, song_id: int, sections: List[Dict[str, Any]]) -> None:
        """Save sections for a song."""
        pass
    
    @abstractmethod
    def get_sections(self, song_id: int) -> List[Dict[str, Any]]:
        """Retrieve sections for a song."""
        pass
