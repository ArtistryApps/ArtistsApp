"""Music-related endpoints."""
import base64
import logging
from typing import Any, Dict, Optional

from fastapi import Depends, APIRouter
from pydantic import BaseModel

from ..core import require_session
from ..db import Session as SessionModel
from VideoEditor import FileAligner

class AudioVideoOverlapRequest(BaseModel):
    audio_base64: str
    video_base64: str
    remove_audio_from_mp4s: Optional[bool]

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/video", tags=["video"])

@router.post("/video/join_audio_video_overlap")
def join_audio_video_overlap(
    body: AudioVideoOverlapRequest,
    session: SessionModel = Depends(require_session),
) -> Dict[str, Any]:
    """Re."""
    video_bytes = base64.b64decode(body.video_base64)
    audio_bytes = base64.b64decode(body.audio_base64)

    bytes_united_video = FileAligner().align_files(
        audio_bytes, [video_bytes],
        remove_audio_from_mp4s=body.remove_audio_from_mp4s
    )

    return {"base64_video": base64.b64encode(bytes_united_video).decode("utf-8")}
