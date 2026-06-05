"""Song notes service — save and filter user song research."""
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from ..db import Genre, Artist, Album, Song, SongChecksDate, SongNotes


def _get_or_create(db: Session, model, **kwargs):
    instance = db.query(model).filter_by(**kwargs).first()
    if not instance:
        instance = model(**kwargs)
        db.add(instance)
        db.flush()
    return instance


def save_song_notes(
    db: Session,
    user_id: int,
    genre: str,
    album: str,
    artist: str,
    song_name: str,
    notes: str,
) -> int:
    genre_row  = _get_or_create(db, Genre, genre=genre)
    artist_row = _get_or_create(db, Artist, artist=artist)
    album_row  = _get_or_create(db, Album, album=album, genre=genre_row.id_genre)
    song_row   = _get_or_create(
        db, Song,
        song_name=song_name,
        genre=genre_row.id_genre,
        artist=artist_row.id_artist,
        album=album_row.id_album,
    )

    note = db.query(SongNotes).filter_by(user=user_id, song=song_row.id_song).first()
    if note:
        note.notes = notes
    else:
        note = SongNotes(user=user_id, song=song_row.id_song, notes=notes)
        db.add(note)
    db.flush()

    check = db.query(SongChecksDate).filter_by(user=user_id, song=song_row.id_song).first()
    now = datetime.now(timezone.utc)
    if check:
        check.date_checked = now
    else:
        check = SongChecksDate(user=user_id, song=song_row.id_song, date_checked=now)
        db.add(check)

    db.commit()
    return note.song_note_id


def filter_song_notes(
    db: Session,
    user_id: int,
    genre: Optional[str] = None,
    artist: Optional[str] = None,
    album: Optional[str] = None,
    name: Optional[str] = None,
) -> List[Dict[str, Any]]:
    q = (
        db.query(
            SongNotes.song_note_id,
            SongNotes.user,
            Genre.genre.label("genre"),
            Artist.artist.label("artist"),
            Album.album.label("album"),
            Song.song_name.label("name"),
            SongNotes.notes.label("cur_user_notes"),
        )
        .join(Song, SongNotes.song == Song.id_song)
        .outerjoin(Genre, Song.genre == Genre.id_genre)
        .outerjoin(Artist, Song.artist == Artist.id_artist)
        .outerjoin(Album, Song.album == Album.id_album)
        .filter(SongNotes.user == user_id)
    )
    if genre:   q = q.filter(Genre.genre.ilike(f"%{genre}%"))
    if artist:  q = q.filter(Artist.artist.ilike(f"%{artist}%"))
    if album:   q = q.filter(Album.album.ilike(f"%{album}%"))
    if name:    q = q.filter(Song.song_name.ilike(f"%{name}%"))
    return [row._asdict() for row in q.all()]
