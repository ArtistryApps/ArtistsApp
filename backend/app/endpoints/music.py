"""Music-related endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel

from ..config.database import get_db
from ..config.settings import settings
from ..controllers.music_controller import MusicController
from ..adapters.music_adapter import MusicAnalysisAdapter
from ..adapters.repository_adapter import MusicRepositoryAdapter

router = APIRouter(prefix="/api/v1/music", tags=["music"])


class BeatSchema(BaseModel):
    """Beat schema."""
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
    """Song schema."""
    name: str
    artist: str
    key: str = "C"
    bpm: float = None

    class Config:
        from_attributes = True


class SongAnalysisRequest(BaseModel):
    """Song analysis request."""
    song_data: SongSchema
    beats: List[BeatSchema]


@router.post("/analyze")
async def analyze_song(request: SongAnalysisRequest, db: Session = Depends(get_db)):
    """Analyze a song and extract musical information."""
    try:
        # Initialize adapters and controller
        analysis_adapter = MusicAnalysisAdapter(
            settings.OPENAI_API_KEY,
            settings.OPENAI_PROJECT
        )
        repository_adapter = MusicRepositoryAdapter(db)
        controller = MusicController(analysis_adapter, repository_adapter)
        
        # Process song
        result = controller.process_song_analysis(
            request.song_data.dict(),
            [beat.dict() for beat in request.beats]
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
