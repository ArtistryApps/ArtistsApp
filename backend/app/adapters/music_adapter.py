"""Music domain adapter using MusicReader."""
from typing import List, Dict, Any, Optional, Tuple
from ..ports import IMusicAnalysisPort
import sys

MUSIC_READER_PATH = r"C:\Users\AD\Documents\Musik\Compositions\Program For Reading Music\app"
sys.path.insert(0, MUSIC_READER_PATH)

try:
    from MusicReader.main import get_music_analysis
    MUSIC_READER_AVAILABLE = True
except ImportError:
    MUSIC_READER_AVAILABLE = False


class MusicAnalysisAdapter(IMusicAnalysisPort):
    """Adapter for music analysis using MusicReader."""

    def __init__(self):
        pass

    def analyze_chords(self, beats: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return beats

    def identify_sections(self, beats: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return beats

    def chord_to_degree(self, chord: str, song_key: str) -> Optional[str]:
        return None

    def chord_to_quality(self, chord: str) -> Optional[str]:
        return None

    def get_analytics_by_name(
        self, song_name: str
    ) -> Optional[Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]]:
        if not MUSIC_READER_AVAILABLE:
            return None
        return get_music_analysis(song_name)
