"""Music-related endpoints."""
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



@router.get("/songs/{song_name}/analytics", dependencies=[Depends(require_session)])
def get_song_analytics(
    song_name: str,
) -> Dict[str, Any]:
    """Return beat, section and chord analysis for a song via MusicReader."""
    analysis_adapter = MusicAnalysisAdapter()

    result = analysis_adapter.get_analytics_by_name(song_name)
    if result is None:
        raise HTTPException(status_code=404, detail="Song not found on Chordify")

    beats, section_analysis, chord_grid = result

    return {
        "Beat Analysis":    beats,
        "Section Analysis": section_analysis,
        "Chord Analysis":   chord_grid,
    }
