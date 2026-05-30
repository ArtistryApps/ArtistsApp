"""Integration tests for GET /api/v1/music/songs/{song_id}/analytics."""
import pytest
from app.db.models import Privilege
from app.models.music import SongAnalysis, Beat, Section


@pytest.fixture(autouse=True)
def seed_privilege(db):
    if not db.query(Privilege).filter(Privilege.privilege_id == 1).first():
        db.add(Privilege(privilege_level="standard"))
        db.commit()


def _register_and_login(client, email="analytics@test.com"):
    client.post("/auth/register", json={
        "email": email, "role": "artist",
        "password": "pass"
    })
    client.post("/auth/login", json={"email": email, "password": "pass"})


@pytest.fixture
def seeded_song(db):
    song = SongAnalysis(name="Test Song", artist="Test Artist", key="C", bpm=120)
    db.add(song)
    db.flush()

    beats = [
        Beat(song_id=song.id, beat_index=i, bar_number=i // 4,
             beat_in_bar=(i % 4) + 1, chord="C:maj", is_new=(i == 0),
             section="section 1", section_repeat=1, bar_in_section=i // 4,
             chord_degree="I", chord_quality="maj")
        for i in range(8)
    ]
    db.add_all(beats)

    section = Section(
        song_id=song.id, section_name="section 1", section_repeat=1,
        chords=["C:maj", "F:maj"], num_bars=2,
        most_frequent_progression=["C:maj", "F:maj"],
        avg_beats_per_chord_change=4.0,
    )
    db.add(section)
    db.commit()
    return song.id


def test_analytics_unauthenticated_401(client):
    r = client.get("/api/v1/music/songs/1/analytics")
    assert r.status_code == 401


def test_analytics_song_not_found_404(client):
    _register_and_login(client, "anot1@test.com")
    r = client.get("/api/v1/music/songs/99999/analytics")
    assert r.status_code == 404


def test_analytics_returns_three_keys(client, seeded_song):
    _register_and_login(client, "anot2@test.com")
    r = client.get(f"/api/v1/music/songs/{seeded_song}/analytics")
    assert r.status_code == 200
    body = r.json()
    assert "Beat Analysis" in body
    assert "Section Analysis" in body
    assert "Chord Analysis" in body


def test_beat_analysis_shape(client, seeded_song):
    _register_and_login(client, "anot3@test.com")
    r = client.get(f"/api/v1/music/songs/{seeded_song}/analytics")
    beat = r.json()["Beat Analysis"][0]
    for key in ("beat", "bar", "bar_in_section", "beat_in_bar",
                "chord", "label", "is_new", "section",
                "section_repeat", "chord_degree", "chord_quality"):
        assert key in beat


def test_section_analysis_shape(client, seeded_song):
    _register_and_login(client, "anot4@test.com")
    r = client.get(f"/api/v1/music/songs/{seeded_song}/analytics")
    section = r.json()["Section Analysis"][0]
    for key in ("section", "section_repeat", "chords", "num_bars",
                "most_frequent_progression", "avg_beats_per_chord_change"):
        assert key in section


def test_chord_analysis_has_section_and_beats(client, seeded_song):
    _register_and_login(client, "anot5@test.com")
    r = client.get(f"/api/v1/music/songs/{seeded_song}/analytics")
    chord_entry = r.json()["Chord Analysis"][0]
    assert "section" in chord_entry
    assert any(k.startswith("beat ") for k in chord_entry)
