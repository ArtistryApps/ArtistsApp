"""Music-related endpoints."""
import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from ..config import get_db, get_mongo_db, settings
from ..controllers import MusicController
from ..adapters import MusicAnalysisAdapter, MusicRepositoryAdapter
from ..core import require_session
from ..db import Session as SessionModel
from ..services import (
    write_cache, read_cache, get_ai_analysis,
    write_conversation_state, read_conversation_state,
    save_song_notes, filter_song_notes,
)

logger = logging.getLogger(__name__)

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


class AIAnalysisRequest(BaseModel):
    prompt: str = Field(..., min_length=1)


class SongNotesRequest(BaseModel):
    genre:     str = Field(..., min_length=1)
    album:     str = Field(..., min_length=1)
    artist:    str = Field(..., min_length=1)
    song_name: str = Field(..., min_length=1)
    notes:     str = Field(..., min_length=1)


class SongNoteRow(BaseModel):
    song_note_id:   int
    user:           int
    genre:          Optional[str]
    artist:         Optional[str]
    album:          Optional[str]
    name:           str
    cur_user_notes: str


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


def _paginate(data: list, offset: int, limit: int) -> Dict[str, Any]:
    return {
        "total":  len(data),
        "offset": offset,
        "limit":  limit,
        "data":   data[offset : offset + limit],
    }


@router.get("/songs/{song_name}/analytics")
def get_song_analytics(
    song_name: str,
    offset: int = 0,
    limit: int = 50,
    session: SessionModel = Depends(require_session),
) -> Dict[str, Any]:
    """Return beat, section and chord analysis for a song via MusicReader."""
    beats = section_analysis = chord_grid = None

    try:
        mongo_db = get_mongo_db()
        cached = read_cache(mongo_db, session.client_id, song_name)
        if cached:
            beats            = cached["beats"]
            section_analysis = cached["sections"]
            chord_grid       = cached["chord_grid"]
    except Exception:
        logger.exception("MongoDB read_cache failed — falling back to MusicReader")

    if beats is None:
        analysis_adapter = MusicAnalysisAdapter()
        result = analysis_adapter.get_analytics_by_name(song_name)
        if result is None:
            raise HTTPException(status_code=404, detail="Song not found on Chordify")

        beats, section_analysis, chord_grid, details = result

        try:
            mongo_db = get_mongo_db()
            write_cache(mongo_db, session.client_id, song_name, beats, section_analysis, chord_grid)
        except Exception:
            logger.exception("MongoDB write_cache failed — continuing without cache")


    return {
        "Beat Analysis":    _paginate(beats, offset, limit),
        "Section Analysis": _paginate(section_analysis, offset, limit),
        "Chord Analysis":   _paginate(chord_grid, offset, limit),
    }


@router.post("/songs/ai-analysis")
def ai_song_analysis(
    body: AIAnalysisRequest,
    session: SessionModel = Depends(require_session),
) -> Dict[str, Any]:
    """Return an AI-generated insight about the currently cached song analysis."""
    mongo_db = get_mongo_db()
    cache = read_cache(mongo_db, session.client_id)
    if cache is None:
        raise HTTPException(
            status_code=404,
            detail="No cached analysis found — call /songs/{song_name}/analytics first",
        )

    response_id = None
    try:
        response_id = read_conversation_state(mongo_db, session.client_id)
    except Exception:
        logger.exception("MongoDB read_conversation_state failed — proceeding without prior context")

    analysis, new_response_id = get_ai_analysis(body.prompt, cache, response_id)

    try:
        write_conversation_state(mongo_db, session.client_id, cache["song_name"], new_response_id)
    except Exception:
        logger.exception("MongoDB write_conversation_state failed")

    return {"analysis": analysis}


@router.post("/songs/notes")
def save_notes(
    body: SongNotesRequest,
    session: SessionModel = Depends(require_session),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """Save user song research to Postgres."""
    song_note_id = save_song_notes(
        db,
        session.client_id,
        body.genre,
        body.album,
        body.artist,
        body.song_name,
        body.notes,
    )
    return {"song_note_id": song_note_id}


@router.get("/songs/notes", response_model=List[SongNoteRow])
def get_notes(
    genre:  Optional[str] = None,
    artist: Optional[str] = None,
    album:  Optional[str] = None,
    name:   Optional[str] = None,
    session: SessionModel = Depends(require_session),
    db: Session = Depends(get_db),
) -> List[SongNoteRow]:
    """Filter and retrieve saved song notes for the current user."""
    return filter_song_notes(db, session.client_id, genre, artist, album, name)
