"""require_session FastAPI dependency."""
from datetime import datetime, timezone

from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session as DBSession

from ..config import get_db
from ..db import Session as SessionModel


def require_session(
    request: Request,
    db: DBSession = Depends(get_db),
) -> SessionModel:
    token = request.session.get("session_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    now = datetime.now(timezone.utc)
    session = (
        db.query(SessionModel)
        .filter(
            SessionModel.token == token,
            SessionModel.open == True,  # noqa: E712
            SessionModel.dt_expires > now,
        )
        .first()
    )
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    return session
