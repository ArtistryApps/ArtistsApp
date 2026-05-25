"""Repository adapter for data persistence."""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from ..ports.music_port import IMusicRepositoryPort
from ..models.music import Song, Beat, Section, Chord
from datetime import datetime


class MusicRepositoryAdapter(IMusicRepositoryPort):
    """Repository adapter using SQLAlchemy."""
    
    def __init__(self, db: Session):
        """Initialize with database session."""
        self.db = db
    
    def save_song(self, song_data: Dict[str, Any]) -> int:
        """Save song to database."""
        song = Song(
            name=song_data.get("name"),
            artist=song_data.get("artist"),
            key=song_data.get("key"),
            bpm=song_data.get("bpm"),
        )
        self.db.add(song)
        self.db.commit()
        self.db.refresh(song)
        return song.id
    
    def get_song(self, song_id: int) -> Optional[Dict[str, Any]]:
        """Retrieve song from database."""
        song = self.db.query(Song).filter(Song.id == song_id).first()
        if not song:
            return None
        
        return {
            "id": song.id,
            "name": song.name,
            "artist": song.artist,
            "key": song.key,
            "bpm": song.bpm,
            "created_at": song.created_at,
            "updated_at": song.updated_at,
        }
    
    def save_beats(self, song_id: int, beats: List[Dict[str, Any]]) -> None:
        """Save beats for a song."""
        # Delete existing beats
        self.db.query(Beat).filter(Beat.song_id == song_id).delete()
        
        # Add new beats
        for beat_data in beats:
            beat = Beat(
                song_id=song_id,
                beat_index=beat_data.get("beat_index", 0),
                bar_number=beat_data.get("bar_number", 0),
                beat_in_bar=beat_data.get("beat_in_bar", 1),
                chord=beat_data.get("chord"),
                chord_degree=beat_data.get("chord_degree"),
                chord_quality=beat_data.get("chord_quality"),
                is_new=beat_data.get("is_new", False),
                section=beat_data.get("section"),
                section_repeat=beat_data.get("section_repeat", 1),
                bar_in_section=beat_data.get("bar_in_section"),
            )
            self.db.add(beat)
        
        self.db.commit()
    
    def get_beats(self, song_id: int) -> List[Dict[str, Any]]:
        """Retrieve beats for a song."""
        beats = self.db.query(Beat).filter(Beat.song_id == song_id).all()
        return [
            {
                "id": beat.id,
                "beat_index": beat.beat_index,
                "bar_number": beat.bar_number,
                "beat_in_bar": beat.beat_in_bar,
                "chord": beat.chord,
                "chord_degree": beat.chord_degree,
                "chord_quality": beat.chord_quality,
                "is_new": beat.is_new,
                "section": beat.section,
                "section_repeat": beat.section_repeat,
                "bar_in_section": beat.bar_in_section,
            }
            for beat in beats
        ]
    
    def save_sections(self, song_id: int, sections: List[Dict[str, Any]]) -> None:
        """Save sections for a song."""
        # Delete existing sections
        self.db.query(Section).filter(Section.song_id == song_id).delete()
        
        # Add new sections
        for section_data in sections:
            section = Section(
                song_id=song_id,
                section_name=section_data.get("section", ""),
                section_repeat=section_data.get("section_repeat", 1),
                chords=section_data.get("chords"),
                num_bars=section_data.get("num_bars", 0),
                most_frequent_progression=section_data.get("most_frequent_progression"),
                avg_beats_per_chord_change=section_data.get("avg_beats_per_chord_change"),
            )
            self.db.add(section)
        
        self.db.commit()
    
    def get_sections(self, song_id: int) -> List[Dict[str, Any]]:
        """Retrieve sections for a song."""
        sections = self.db.query(Section).filter(Section.song_id == song_id).all()
        return [
            {
                "id": section.id,
                "section_name": section.section_name,
                "section_repeat": section.section_repeat,
                "chords": section.chords,
                "num_bars": section.num_bars,
                "most_frequent_progression": section.most_frequent_progression,
                "avg_beats_per_chord_change": section.avg_beats_per_chord_change,
            }
            for section in sections
        ]
