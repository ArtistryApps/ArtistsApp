"""Legacy music analysis SQLAlchemy models (MusicReader data)."""
from sqlalchemy import Column, Integer, String, Float, JSON, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from . import Base


class SongAnalysis(Base):
    __tablename__ = "legacy_songs"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String, unique=True, index=True)
    artist     = Column(String, index=True)
    key        = Column(String, nullable=True)
    bpm        = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    beats    = relationship("Beat",    back_populates="song", cascade="all, delete-orphan")
    sections = relationship("Section", back_populates="song", cascade="all, delete-orphan")
    chords   = relationship("Chord",   back_populates="song", cascade="all, delete-orphan")


class Beat(Base):
    __tablename__ = "beats"

    id             = Column(Integer, primary_key=True, index=True)
    song_id        = Column(Integer, ForeignKey("legacy_songs.id"), index=True)
    beat_index     = Column(Integer, index=True)
    bar_number     = Column(Integer)
    beat_in_bar    = Column(Integer)
    chord          = Column(String, nullable=True)
    chord_degree   = Column(String, nullable=True)
    chord_quality  = Column(String, nullable=True)
    is_new         = Column(Boolean, default=False)
    section        = Column(String, nullable=True)
    section_repeat = Column(Integer, default=1)
    bar_in_section = Column(Integer, nullable=True)

    song = relationship("SongAnalysis", back_populates="beats")


class Section(Base):
    __tablename__ = "sections"

    id                         = Column(Integer, primary_key=True, index=True)
    song_id                    = Column(Integer, ForeignKey("legacy_songs.id"), index=True)
    section_name               = Column(String, index=True)
    section_repeat             = Column(Integer, default=1)
    chords                     = Column(JSON)
    num_bars                   = Column(Integer)
    most_frequent_progression  = Column(JSON)
    avg_beats_per_chord_change = Column(Float, nullable=True)

    song = relationship("SongAnalysis", back_populates="sections")


class Chord(Base):
    __tablename__ = "chords"

    id        = Column(Integer, primary_key=True, index=True)
    song_id   = Column(Integer, ForeignKey("legacy_songs.id"), index=True)
    name      = Column(String, index=True)
    degree    = Column(String, nullable=True)
    quality   = Column(String, nullable=True)
    frequency = Column(Integer, default=1)

    song = relationship("SongAnalysis", back_populates="chords")
    
