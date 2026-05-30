"""Music-related endpoints."""
from collections import defaultdict
from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..config import get_db, settings
from ..controllers import MusicController
from ..adapters import MusicAnalysisAdapter, MusicRepositoryAdapter
from ..core import require_session

router = APIRouter(prefix="/api/v1/music", tags=["music"])


class BeatSchema(BaseModel):
    beat_index: int
    bar_number: int
    beat_in_bar: int
    chord: str
    is_new: bool = False
    section: str = None
    bar_in_section: int = None

    class Config:
        from_attributes = True


class SongSchema(BaseModel):
    name: str
    artist: str
    key: str = "C"
    bpm: float = None

    class Config:
        from_attributes = True


class SongAnalysisRequest(BaseModel):
    song_data: SongSchema
    beats: List[BeatSchema]


@router.post("/analyze")
async def analyze_song(request: SongAnalysisRequest, db: Session = Depends(get_db)):
    """Analyze a song and extract musical information."""
    try:
        analysis_adapter = MusicAnalysisAdapter(
            settings.OPENAI_API_KEY if hasattr(settings, "OPENAI_API_KEY") else None,
            settings.OPENAI_PROJECT if hasattr(settings, "OPENAI_PROJECT") else None,
        )
        repository_adapter = MusicRepositoryAdapter(db)
        controller = MusicController(analysis_adapter, repository_adapter)

        result = controller.process_song_analysis(
            request.song_data.dict(),
            [beat.dict() for beat in request.beats],
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/song/{song_id}")
async def get_song_analysis(song_id: int, db: Session = Depends(get_db)):
    """Retrieve song analysis."""
    try:
        repository_adapter = MusicRepositoryAdapter(db)
        controller = MusicController(None, repository_adapter)

        result = controller.get_song_analysis(song_id)
        if not result:
            raise HTTPException(status_code=404, detail="Song not found")

        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Analytics endpoint
# ---------------------------------------------------------------------------

def _chord_analysis(beats: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Group beats by section occurrence and map each beat position to its chord."""
    groups: Dict[str, Dict] = defaultdict(dict)
    counters: Dict[str, int] = defaultdict(int)

    for beat in beats:
        section_key = f"{beat['section']} ({beat['section_repeat']})"
        counters[section_key] += 1
        groups[section_key][f"beat {counters[section_key]}"] = beat["chord"]

    result = []
    for section_key, chord_map in groups.items():
        item: Dict[str, Any] = {"section": section_key}
        item.update(chord_map)
        result.append(item)
    return result


@router.get("/songs/{song_id}/analytics", dependencies=[Depends(require_session)])
def get_song_analytics(
    song_id: int,
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Return beat, section and chord analysis for a song."""
    repository = MusicRepositoryAdapter(db)

    song = repository.get_song(song_id)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    beats = repository.get_beats(song_id)
    sections = repository.get_sections(song_id)

    beat_analysis = [
        {
            "beat":           b["beat_index"],
            "bar":            b["bar_number"],
            "bar_in_section": b["bar_in_section"],
            "beat_in_bar":    b["beat_in_bar"],
            "chord":          b["chord"],
            "label":          "",
            "is_new":         b["is_new"],
            "section":        b["section"],
            "section_repeat": b["section_repeat"],
            "chord_degree":   b["chord_degree"],
            "chord_quality":  b["chord_quality"],
        }
        for b in beats
    ]

    section_analysis = [
        {
            "section":                    s["section_name"],
            "section_repeat":             s["section_repeat"],
            "chords":                     s["chords"],
            "num_bars":                   s["num_bars"],
            "most_frequent_progression":  s["most_frequent_progression"],
            "avg_beats_per_chord_change": s["avg_beats_per_chord_change"],
        }
        for s in sections
    ]

    return {
        "Beat Analysis":    beat_analysis,
        "Section Analysis": section_analysis,
        "Chord Analysis":   _chord_analysis(beats),
    }
