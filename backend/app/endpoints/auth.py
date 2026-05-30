"""Auth endpoints: register, login, logout, my_details."""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session as DBSession

from ..config import get_db
from ..core import require_session
from ..db import Privilege, Session as SessionModel, User
from ..models import LoginRequest, RegisterRequest, SessionResponse, UserDetailsResponse
from ..services import login_user, logout_user, register_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=201)
def register(body: RegisterRequest, db: DBSession = Depends(get_db)) -> dict:
    register_user(db=db, email=body.email, role=body.role, password=body.password)
    return {"message": "User registered successfully"}


@router.post("/login", response_model=SessionResponse)
def login(
    body: LoginRequest,
    request: Request,
    db: DBSession = Depends(get_db),
) -> SessionResponse:
    data = login_user(db=db, email=body.email, password=body.password)
    request.session["session_token"] = data["session_token"]
    return SessionResponse(**data)


@router.post("/logout")
def logout(request: Request, db: DBSession = Depends(get_db)) -> dict:
    token = request.session.get("session_token")
    if token:
        logout_user(db=db, session_token=token)
        request.session.clear()
    return {"message": "Logged out"}


@router.get("/my_details", response_model=UserDetailsResponse)
def my_details(
    db: DBSession = Depends(get_db),
    session: SessionModel = Depends(require_session),
) -> UserDetailsResponse:
    user = db.query(User).filter(User.user_id == session.client_id).first()
    privilege = db.query(Privilege).filter(Privilege.privilege_id == user.privilege_id).first()
    return UserDetailsResponse(
        user_id=user.user_id,
        email=user.email,
        role=user.role,
        privilege_id=user.privilege_id,
        privilege_level=privilege.privilege_level,
        created_at=user.created_at.isoformat(),
    )
