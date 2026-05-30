"""Music domain adapter using MusicReader."""
from typing import List, Dict, Any, Optional
from ..ports import IMusicAnalysisPort
import sys

MUSIC_READER_PATH = r"C:\Users\AD\Documents\Musik\Compositions\Program For Reading Music\app"
sys.path.insert(0, MUSIC_READER_PATH)

try:
    from MusicReader.src import MusicKnower
    from MusicReader.src.MusicAnalyst import MusicAnalyst
    MUSIC_READER_AVAILABLE = True
except ImportError:
    MUSIC_READER_AVAILABLE = False


class MusicAnalysisAdapter(IMusicAnalysisPort):
    """Adapter for music analysis using MusicReader."""

    def __init__(self, openai_api_key: Optional[str] = None, openai_project: Optional[str] = None):
        self.music_knower = MusicKnower() if MUSIC_READER_AVAILABLE else None
        self.music_analyst = None

        if MUSIC_READER_AVAILABLE and openai_api_key and openai_project:
            self.music_analyst = MusicAnalyst(openai_api_key, openai_project)

    def analyze_chords(self, beats: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not MUSIC_READER_AVAILABLE or not self.music_analyst:
            return beats
        return self.music_analyst.analyse(beats)

    def identify_sections(self, beats: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not MUSIC_READER_AVAILABLE or not self.music_analyst:
            return beats
        return MusicAnalyst.identify_sections(beats)

    def chord_to_degree(self, chord: str, song_key: str) -> Optional[str]:
        if not MUSIC_READER_AVAILABLE or not self.music_knower:
            return None
        return self.music_knower.chord_to_degree(chord, song_key)

    def chord_to_quality(self, chord: str) -> Optional[str]:
        if not MUSIC_READER_AVAILABLE or not self.music_knower:
            return None
        return self.music_knower.chord_to_quality(chord)
