"""AI analysis service using MusicAnalyticsAssistant."""
import sys
from typing import Any, Dict

MUSIC_READER_PATH = r"C:\Users\AD\Documents\Musik\Compositions\Program For Reading Music\app"
sys.path.insert(0, MUSIC_READER_PATH)

from MusicReader.src.MusicAnalyticsAssistant import MusicAnalyticsAssistant


def get_ai_analysis(user_prompt: str, cache: Dict[str, Any]) -> str:
    assistant = MusicAnalyticsAssistant(model="gpt-4o")
    return assistant.get_analysis(
        user_prompt,
        cache["beats"],
        cache["sections"],
        cache["chord_grid"],
    )
