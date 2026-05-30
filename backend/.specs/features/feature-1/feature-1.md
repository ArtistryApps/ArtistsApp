# Single endpoint for getting song analytics Initial Dashboard

Most of the data that you'll see will be returned in json formats (actually, they're lists of dictionaries).
There are 3 main categories of data.
The returned values will come in a tuple of 3 different items, each of those items is a list of dictionaries, all with the same keys, values all in the same formats.

Item 1 (example): 
- beat => 3
- bar => 0
- bar_in_section => 0
- beat_in_bar => 4
- chord => Ab:min
- label => La♭ₘ
- is_new => VERDADEIRO
- section => section 1
- section_repeat => 1
- chord_degree =>  
- chord_quality => min

Item 2 (example):
- section => section 1
- section_repeat => 1
- chords => ['Ab:min', 'Eb:min', 'B:maj', 'Gb:maj', 'Db:maj']
- num_bars => 8
- most_frequent_progression => ['Ab:min', 'Eb:min', 'Ab:min', 'B:maj']
- avg_beats_per_chord_change => 3,625

Item 3 (example):
section => section 1 (2)
beat 1 => Ab:min
beat 2 => Ab:min
beat 3 => Ab:min
beat 4 => Ab:min
beat 5 => B:maj
beat 6 => B:maj
beat 7 => B:maj
beat 8 => B:maj
beat 9 => B:maj
beat 10 => B:maj
beat 11 => B:maj
beat 12 => B:maj
beat 13 => Gb:maj
beat 14 => Db:maj
beat 15 => Db:maj
beat 16 => Db:maj


Don't do much on this endpoint. For now just return those values to the frontend, and name each of those items with the following keys: Beat Analysis, Section Analysis, Chord Analysis, The frontend will receive those values and put them in a beautiful readable format.


Also, you'll need to be able to connect to the Supabase psql database instance. its password you should grab over gcp secrets. The gcp secret you gotta try to grab is this one: SUPABASE_PASSWORD. I've copied and pasted the past secrets file I've already used in other projects, use that to grab this secret.

I'll need some supabase models too.
For this feature, we'll need 2 different basic functions.

For the FIRST Supabase model, we'll need the initial login page credentials, I want you to add a login page in which sessions will be created with tokens, stored in the database, using the cors middleware to keep track of the user's session in the browser.

* Privilege:
    __tablename__ = "privileges"

    privilege_id    = Column(Integer, primary_key=True, autoincrement=True)
    privilege_level = Column(String, nullable=False)

* User:
    __tablename__ = "users"

    user_id       = Column(Integer, primary_key=True, autoincrement=True)
    email         = Column(String, unique=True, nullable=False, index=True)
    role          = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    salt          = Column(String, nullable=False)
    municipality  = Column(String, nullable=False)
    privilege_id  = Column(Integer, ForeignKey("privileges.privilege_id"), nullable=False, default=1)
    created_at    = Column(DateTime(timezone=True), server_default=func.now())


* Session
    __tablename__ = "sessions"

    session_id = Column(Integer, primary_key=True, autoincrement=True)
    dt_created = Column(DateTime(timezone=True), nullable=False)
    dt_expires = Column(DateTime(timezone=True), nullable=False)
    client_id  = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    token      = Column(String, unique=True, nullable=False, index=True)
    open       = Column(Boolean, nullable=False, default=True)



The other types of models are non-related to login or sessions, they're related to the main app's functionality, which is to help users attribute feelings to songs, and understand patterns in songs they like.

* Genre
    - id_genre: primary key (auto)
    - genre: str

* Album 
    - id_album: primary key (auto)
    - genre: foreign_key
    - album: str

* Artist 
    - id_artist: primary key (auto)
    - artist: str

* Song
    - id_song: primary key (auto)
    - genre: foreign_key
    - artist: foreign_key
    - album: foreign_key
    - song_name: str
    - song_complexity_score: float (possibly null)

* SongChecksDate
    - song_check_id: primary key
    - user: foreign_key
    - song: foreign_key
    - date_checked: datetime

* SongNotes
    - song_note_id: primary key
    - user: foreign_key
    - song: foreign_key
    - notes: str

For now, WHAT I NEED are just the main endpoints with the login functionalities, use this past file as an example to understand exactly what I want. If you can think of a more clever way to do it, you're free.

What I TRULLY want for now, is a main supabase database where everything is taken care of with the models, AND the login endpoints.

```python 
from typing import List

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session as DBSession

from app.core.database import get_db
from app.core.session import require_session
from app.db.models import Privilege, Session, User
from app.models.user import LoginRequest, RegisterRequest, SessionResponse, UserDetailsResponse
from app.services.auth import login_user, logout_user, register_user
from app.services.municipalities import fetch_municipalities

router = APIRouter()


@router.get("/auth/municipalities", response_model=List[str])
def get_municipalities() -> List[str]:
    return fetch_municipalities()


@router.post("/auth/register", status_code=201)
def register(body: RegisterRequest, db: DBSession = Depends(get_db)) -> dict:
    register_user(
        db=db,
        email=body.email,
        role=body.role,
        password=body.password,
        municipality=body.municipality,
    )
    return {"message": "User registered successfully"}


@router.post("/auth/login", response_model=SessionResponse)
def login(body: LoginRequest, request: Request, db: DBSession = Depends(get_db)) -> SessionResponse:
    data = login_user(db=db, email=body.email, password=body.password)
    request.session["session_token"] = data["session_token"]
    return SessionResponse(**data)


@router.post("/auth/logout")
def logout(request: Request, db: DBSession = Depends(get_db)) -> dict:
    token = request.session.get("session_token")
    if token:
        logout_user(db=db, session_token=token)
        request.session.clear()
    return {"message": "Logged out"}


@router.get("/auth/my_details", response_model=UserDetailsResponse)
def my_details(
    db: DBSession = Depends(get_db),
    session: Session = Depends(require_session),
) -> UserDetailsResponse:
    user = db.query(User).filter(User.user_id == session.client_id).first()
    privilege = db.query(Privilege).filter(Privilege.privilege_id == user.privilege_id).first()
    return UserDetailsResponse(
        user_id=user.user_id,
        email=user.email,
        role=user.role,
        municipality=user.municipality,
        privilege_id=user.privilege_id,
        privilege_level=privilege.privilege_level,
        created_at=user.created_at.isoformat(),
    )


```

