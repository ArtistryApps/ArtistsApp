"""Tests for auth service functions."""
import pytest
from fastapi import HTTPException

from app.db.models import Privilege, Session as SessionModel, User
from app.services.auth import login_user, logout_user, register_user


@pytest.fixture(autouse=True)
def seed_privilege(db):
    existing = db.query(Privilege).filter(Privilege.privilege_id == 1).first()
    if not existing:
        db.add(Privilege(privilege_level="standard"))
        db.commit()


# ---------------------------------------------------------------------------
# register_user
# ---------------------------------------------------------------------------

def test_register_success(db):
    register_user(db, "new@test.com", "artist", "secret123")
    user = db.query(User).filter(User.email == "new@test.com").first()
    assert user is not None


def test_register_hashes_password(db):
    register_user(db, "hash@test.com", "artist", "mypassword")
    user = db.query(User).filter(User.email == "hash@test.com").first()
    assert user.password_hash != "mypassword"
    assert len(user.salt) > 0


def test_register_duplicate_email_raises_409(db):
    register_user(db, "dup@test.com", "artist", "pass")
    with pytest.raises(HTTPException) as exc:
        register_user(db, "dup@test.com", "artist", "pass2")
    assert exc.value.status_code == 409


# ---------------------------------------------------------------------------
# login_user
# ---------------------------------------------------------------------------

def test_login_returns_token(db):
    register_user(db, "login@test.com", "artist", "pass123")
    result = login_user(db, "login@test.com", "pass123")
    assert "session_token" in result
    assert "expires_at" in result


def test_login_creates_open_session(db):
    register_user(db, "session@test.com", "artist", "pass")
    result = login_user(db, "session@test.com", "pass")
    session = db.query(SessionModel).filter(
        SessionModel.token == result["session_token"]
    ).first()
    assert session is not None
    assert session.open is True


def test_login_wrong_password_raises_401(db):
    register_user(db, "badpass@test.com", "artist", "correct")
    with pytest.raises(HTTPException) as exc:
        login_user(db, "badpass@test.com", "wrong")
    assert exc.value.status_code == 401


def test_login_unknown_email_raises_401(db):
    with pytest.raises(HTTPException) as exc:
        login_user(db, "nobody@test.com", "pass")
    assert exc.value.status_code == 401


# ---------------------------------------------------------------------------
# logout_user
# ---------------------------------------------------------------------------

def test_logout_closes_session(db):
    register_user(db, "logout@test.com", "artist", "pass")
    result = login_user(db, "logout@test.com", "pass")
    token = result["session_token"]

    logout_user(db, token)

    session = db.query(SessionModel).filter(SessionModel.token == token).first()
    assert session.open is False


def test_logout_unknown_token_is_silent(db):
    logout_user(db, "nonexistent-token-xyz")
