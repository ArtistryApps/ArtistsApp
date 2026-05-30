"""SQLAlchemy models for auth and app domain."""
from sqlalchemy import (
    Boolean, Column, DateTime, Float, ForeignKey,
    Integer, String,
)
from sqlalchemy.sql import func

from ..models import Base


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class Privilege(Base):
    __tablename__ = "privileges"

    privilege_id    = Column(Integer, primary_key=True, autoincrement=True)
    privilege_level = Column(String, nullable=False)


class User(Base):
    __tablename__ = "users"

    user_id       = Column(Integer, primary_key=True, autoincrement=True)
    email         = Column(String, unique=True, nullable=False, index=True)
    role          = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    salt          = Column(String, nullable=False)
    privilege_id  = Column(Integer, ForeignKey("privileges.privilege_id"), nullable=False, default=1)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())


class Session(Base):
    __tablename__ = "sessions"

    session_id = Column(Integer, primary_key=True, autoincrement=True)
    dt_created = Column(DateTime(timezone=True), nullable=False)
    dt_expires = Column(DateTime(timezone=True), nullable=False)
    client_id  = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    token      = Column(String, unique=True, nullable=False, index=True)
    open       = Column(Boolean, nullable=False, default=True)


# ---------------------------------------------------------------------------
# App domain
# ---------------------------------------------------------------------------

class Genre(Base):
    __tablename__ = "genres"

    id_genre = Column(Integer, primary_key=True, autoincrement=True)
    genre    = Column(String, nullable=False)


class Artist(Base):
    __tablename__ = "artists"

    id_artist = Column(Integer, primary_key=True, autoincrement=True)
    artist    = Column(String, nullable=False)


class Album(Base):
    __tablename__ = "albums"

    id_album = Column(Integer, primary_key=True, autoincrement=True)
    genre    = Column(Integer, ForeignKey("genres.id_genre"), nullable=True)
    album    = Column(String, nullable=False)


class Song(Base):
    __tablename__ = "songs"

    id_song               = Column(Integer, primary_key=True, autoincrement=True)
    genre                 = Column(Integer, ForeignKey("genres.id_genre"), nullable=True)
    artist                = Column(Integer, ForeignKey("artists.id_artist"), nullable=True)
    album                 = Column(Integer, ForeignKey("albums.id_album"), nullable=True)
    song_name             = Column(String, nullable=False)
    song_complexity_score = Column(Float, nullable=True)


class SongChecksDate(Base):
    __tablename__ = "song_checks_date"

    song_check_id = Column(Integer, primary_key=True, autoincrement=True)
    user          = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    song          = Column(Integer, ForeignKey("songs.id_song"), nullable=False)
    date_checked  = Column(DateTime(timezone=True), nullable=False)


class SongNotes(Base):
    __tablename__ = "song_notes"

    song_note_id = Column(Integer, primary_key=True, autoincrement=True)
    user         = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    song         = Column(Integer, ForeignKey("songs.id_song"), nullable=False)
    notes        = Column(String, nullable=False)
