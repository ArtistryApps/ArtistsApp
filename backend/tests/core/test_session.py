"""Tests for require_session dependency."""
import pytest
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock

from fastapi import HTTPException

from app.db.models import Privilege, Session as SessionModel
from app.core.session import require_session
from app.services.auth import register_user, login_user


@pytest.fixture(autouse=True)
def seed_privilege(db):
    if not db.query(Privilege).filter(Privilege.privilege_id == 1).first():
        db.add(Privilege(privilege_level="standard"))
        db.commit()


def _make_request(token: str | None) -> MagicMock:
    req = MagicMock()
    req.session = {"session_token": token} if token else {}
    return req


def _open_session(db, email: str) -> str:
    register_user(db, email, "artist", "pass")
    return login_user(db, email, "pass")["session_token"]


def test_valid_session_returns_session_row(db):
    token = _open_session(db, "valid@test.com")
    result = require_session(_make_request(token), db)
    assert result.token == token


def test_missing_token_raises_401(db):
    with pytest.raises(HTTPException) as exc:
        require_session(_make_request(None), db)
    assert exc.value.status_code == 401


def test_expired_session_raises_401(db):
    token = _open_session(db, "expired@test.com")
    session = db.query(SessionModel).filter(SessionModel.token == token).first()
    session.dt_expires = datetime.now(timezone.utc) - timedelta(hours=1)
    db.commit()

    with pytest.raises(HTTPException) as exc:
        require_session(_make_request(token), db)
    assert exc.value.status_code == 401


def test_closed_session_raises_401(db):
    token = _open_session(db, "closed@test.com")
    session = db.query(SessionModel).filter(SessionModel.token == token).first()
    session.open = False
    db.commit()

    with pytest.raises(HTTPException) as exc:
        require_session(_make_request(token), db)
    assert exc.value.status_code == 401
