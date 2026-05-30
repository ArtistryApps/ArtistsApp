"""Authentication service: register, login, logout."""
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Dict, Any

from fastapi import HTTPException
from sqlalchemy.orm import Session as DBSession

from ..db import Session as SessionModel, User


def _hash_password(password: str, salt: str) -> str:
    return hashlib.sha256((password + salt).encode()).hexdigest()


def register_user(
    db: DBSession,
    email: str,
    role: str,
    password: str,
) -> None:
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    salt = secrets.token_hex(32)
    password_hash = _hash_password(password, salt)

    user = User(
        email=email,
        role=role,
        password_hash=password_hash,
        salt=salt,
        privilege_id=1,
    )
    db.add(user)
    db.commit()


def login_user(db: DBSession, email: str, password: str) -> Dict[str, Any]:
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if _hash_password(password, user.salt) != user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    now = datetime.now(timezone.utc)
    expires = now + timedelta(hours=24)
    token = secrets.token_urlsafe(32)

    session = SessionModel(
        dt_created=now,
        dt_expires=expires,
        client_id=user.user_id,
        token=token,
        open=True,
    )
    db.add(session)
    db.commit()

    return {
        "session_token": token,
        "expires_at": expires.isoformat(),
    }


def logout_user(db: DBSession, session_token: str) -> None:
    session = db.query(SessionModel).filter(SessionModel.token == session_token).first()
    if session:
        session.open = False
        db.commit()
