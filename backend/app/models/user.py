"""Pydantic request / response schemas for auth."""
from pydantic import BaseModel


class RegisterRequest(BaseModel):
    email: str
    role: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class SessionResponse(BaseModel):
    session_token: str
    expires_at: str


class UserDetailsResponse(BaseModel):
    user_id: int
    email: str
    role: str
    privilege_id: int
    privilege_level: str
    created_at: str
