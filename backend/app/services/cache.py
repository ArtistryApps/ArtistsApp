"""MongoDB cache — per-user ephemeral storage for the current song analysis."""
import logging
from typing import Any, Dict, List, Optional

from pymongo.database import Database

BEAT_COLLECTION    = "Beats"
SECTION_COLLECTION = "Sections"
CHORD_COLLECTION   = "FourBarChart"

logger = logging.getLogger(__name__)


def write_cache(
    db: Database,
    user_id: int,
    song_name: str,
    beats: List[Dict[str, Any]],
    sections: List[Dict[str, Any]],
    chord_grid: List[Dict[str, Any]],
) -> None:
    filter_ = {"user_id": user_id}
    db[BEAT_COLLECTION].replace_one(
        filter_, {"user_id": user_id, "song_name": song_name, "data": beats}, upsert=True
    )
    db[SECTION_COLLECTION].replace_one(
        filter_, {"user_id": user_id, "song_name": song_name, "data": sections}, upsert=True
    )
    db[CHORD_COLLECTION].replace_one(
        filter_, {"user_id": user_id, "song_name": song_name, "data": chord_grid}, upsert=True
    )


def read_cache(db: Database, user_id: int, song_name: str = None) -> Optional[Dict[str, Any]]:
    filter_ = {"user_id": user_id}
    if song_name:
        filter_["song_name"] = song_name
    beat_doc    = db[BEAT_COLLECTION].find_one(filter_)
    section_doc = db[SECTION_COLLECTION].find_one(filter_)
    chord_doc   = db[CHORD_COLLECTION].find_one(filter_)

    if not beat_doc or not section_doc or not chord_doc:
        return None

    return {
        "beats":      beat_doc["data"],
        "sections":   section_doc["data"],
        "chord_grid": chord_doc["data"],
    }


def clear_cache(db: Database, user_id: int) -> None:
    filter_ = {"user_id": user_id}
    db[BEAT_COLLECTION].delete_one(filter_)
    db[SECTION_COLLECTION].delete_one(filter_)
    db[CHORD_COLLECTION].delete_one(filter_)
