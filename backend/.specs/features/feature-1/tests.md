# Feature 1 — Test Plan

## Test strategy

- **Unit tests** — service functions in isolation, with a SQLite in-memory DB (no Supabase required).
- **Integration tests** — endpoint tests via `httpx.AsyncClient` against a test FastAPI app wired to the same SQLite DB.
- **No mocking of the DB** — use a real session to catch schema/query bugs early.
- GCP Secret Manager is mocked at the `settings.POSTGRES_PASSWORD` level so tests never hit GCP.

All tests live under `tests/`. Fixtures go in `tests/conftest.py`.

---

## conftest.py fixtures

```python
# Override POSTGRES_PASSWORD before any import uses it
@pytest.fixture(scope="session", autouse=True)
def patch_settings():
    with mock.patch.object(Settings, "POSTGRES_PASSWORD", new_callable=lambda: property(lambda self: "testpassword")):
        yield

# SQLite in-memory engine + tables
@pytest.fixture(scope="function")
def db_engine():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db(db_engine):
    session = sessionmaker(bind=db_engine)()
    yield session
    session.close()

# Seed a default Privilege row
@pytest.fixture
def seed_privilege(db):
    p = Privilege(privilege_level="standard")
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

# FastAPI test client
@pytest.fixture
def client(db):
    app.dependency_overrides[get_db] = lambda: db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
```

---

## Test files

### `tests/services/test_auth.py`

**register_user**
- [ ] Registers successfully and returns None (no exception).
- [ ] Inserted User has a hashed password (not the plaintext).
- [ ] Inserted User has a non-empty salt.
- [ ] Duplicate email raises HTTPException 409.

**login_user**
- [ ] Returns dict with `session_token` and `expires_at`.
- [ ] A Session row is created in the DB with `open=True`.
- [ ] Wrong password raises HTTPException 401.
- [ ] Unknown email raises HTTPException 401.

**logout_user**
- [ ] Sets `Session.open = False` for the given token.
- [ ] Calling with an unknown token does not raise (silent no-op or 404 — pick one and document it).

---

### `tests/services/test_municipalities.py`

- [ ] `fetch_municipalities()` returns a non-empty list of strings.
- [ ] All items are strings.

---

### `tests/core/test_session.py`

**require_session**
- [ ] Valid open non-expired session returns the Session row.
- [ ] Missing cookie token raises 401.
- [ ] Expired session (`dt_expires` in the past) raises 401.
- [ ] `open=False` session raises 401.

---

### `tests/endpoints/test_auth.py`

**POST /auth/register**
- [ ] 201 and `{ "message": "User registered successfully" }` for valid payload.
- [ ] 409 for duplicate email.
- [ ] 422 for missing required fields (`email`, `password`, `role`, `municipality`).

**POST /auth/login**
- [ ] 200 with `session_token` in response body.
- [ ] Session cookie is set on the response.
- [ ] 401 for wrong password.
- [ ] 401 for unknown email.

**POST /auth/logout**
- [ ] 200 `{ "message": "Logged out" }` when called with active session.
- [ ] Session is marked `open=False` in DB after logout.
- [ ] Subsequent `/auth/my_details` call returns 401 after logout.

**GET /auth/my_details**
- [ ] 200 with correct user fields when authenticated.
- [ ] Includes `privilege_level` from joined Privilege row.
- [ ] 401 when no session cookie present.

**GET /auth/municipalities**
- [ ] 200 with a list of strings; no auth required.

---

### `tests/endpoints/test_music_analytics.py`

Setup: seed a Song row, register + login a user.

**GET /songs/{song_id}/analytics**
- [ ] 401 when called without a session.
- [ ] 404 when `song_id` does not exist.
- [ ] 200 response contains exactly the three keys: `Beat Analysis`, `Section Analysis`, `Chord Analysis`.
- [ ] Each value is a list.
- [ ] `Beat Analysis` items contain the expected keys: `beat`, `bar`, `bar_in_section`, `beat_in_bar`, `chord`, `label`, `is_new`, `section`, `section_repeat`, `chord_degree`, `chord_quality`.
- [ ] `Section Analysis` items contain: `section`, `section_repeat`, `chords`, `num_bars`, `most_frequent_progression`, `avg_beats_per_chord_change`.
- [ ] `Chord Analysis` items contain at least `section` and one `beat N` key.

> Note: If MusicReader requires real audio/MIDI input, mock the MusicReader call at the controller level and return fixture data matching the spec examples.

---

## Running tests

```bash
pytest tests/ -v
```

To run only unit tests (no endpoint wiring):

```bash
pytest tests/services/ tests/core/ -v
```

---

## What is NOT tested here

- GCP Secret Manager connectivity (integration concern, not a unit test).
- Supabase reachability (covered by a separate infra smoke test).
- Frontend rendering (out of scope for backend tests).
