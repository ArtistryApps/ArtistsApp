"""Integration tests for /auth endpoints."""
import pytest
from app.db.models import Privilege, Session as SessionModel


@pytest.fixture(autouse=True)
def seed_privilege(db):
    if not db.query(Privilege).filter(Privilege.privilege_id == 1).first():
        db.add(Privilege(privilege_level="standard"))
        db.commit()


def _register(client, email="user@test.com"):
    return client.post("/auth/register", json={
        "email": email,
        "role": "artist",
        "password": "secret123"
    })


def _login(client, email="user@test.com"):
    return client.post("/auth/login", json={
        "email": email,
        "password": "secret123",
    })


# ---------------------------------------------------------------------------
# GET /auth/municipalities
# ---------------------------------------------------------------------------

def test_municipalities_no_auth(client):
    r = client.get("/auth/municipalities")
    assert r.status_code == 200
    assert isinstance(r.json(), list)
    assert len(r.json()) > 0


# ---------------------------------------------------------------------------
# POST /auth/register
# ---------------------------------------------------------------------------

def test_register_201(client):
    r = _register(client, "reg1@test.com")
    assert r.status_code == 201
    assert r.json()["message"] == "User registered successfully"


def test_register_duplicate_409(client):
    _register(client, "dup@test.com")
    r = _register(client, "dup@test.com")
    assert r.status_code == 409


def test_register_missing_fields_422(client):
    r = client.post("/auth/register", json={"email": "x@test.com"})
    assert r.status_code == 422


# ---------------------------------------------------------------------------
# POST /auth/login
# ---------------------------------------------------------------------------

def test_login_200_with_token(client):
    _register(client, "login1@test.com")
    r = _login(client, "login1@test.com")
    assert r.status_code == 200
    assert "session_token" in r.json()
    assert "expires_at" in r.json()


def test_login_wrong_password_401(client):
    _register(client, "login2@test.com")
    r = client.post("/auth/login", json={"email": "login2@test.com", "password": "wrong"})
    assert r.status_code == 401


def test_login_unknown_email_401(client):
    r = client.post("/auth/login", json={"email": "nobody@test.com", "password": "pass"})
    assert r.status_code == 401


# ---------------------------------------------------------------------------
# POST /auth/logout
# ---------------------------------------------------------------------------

def test_logout_200(client):
    _register(client, "logout1@test.com")
    _login(client, "logout1@test.com")
    r = client.post("/auth/logout")
    assert r.status_code == 200
    assert r.json()["message"] == "Logged out"


def test_logout_then_my_details_401(client):
    _register(client, "logout2@test.com")
    _login(client, "logout2@test.com")
    client.post("/auth/logout")
    r = client.get("/auth/my_details")
    assert r.status_code == 401


# ---------------------------------------------------------------------------
# GET /auth/my_details
# ---------------------------------------------------------------------------

def test_my_details_authenticated(client):
    _register(client, "details1@test.com")
    _login(client, "details1@test.com")
    r = client.get("/auth/my_details")
    assert r.status_code == 200
    body = r.json()
    assert body["email"] == "details1@test.com"
    assert "privilege_level" in body


def test_my_details_unauthenticated_401(client):
    r = client.get("/auth/my_details")
    assert r.status_code == 401
