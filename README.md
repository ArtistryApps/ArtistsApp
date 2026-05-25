# Artists App - Microservices Architecture

A full-stack application for music composition analysis using hexagonal architecture principles. The project consists of a FastAPI backend (Python) and a React frontend (TypeScript), both running as independent microservices with PostgreSQL as the database.

## 🏗️ Architecture

### Backend - Hexagonal Architecture (Ports & Adapters)

The backend follows **hexagonal architecture** principles to maintain clean separation of concerns:

```
backend/app/
├── config/              # Configuration & database setup
│   ├── settings.py      # Environment & app settings
│   └── database.py      # SQLAlchemy session management
├── models/              # SQLAlchemy ORM models
│   └── music.py         # Song, Beat, Section, Chord models
├── ports/               # Abstract interfaces (Hexagonal)
│   └── music_port.py    # IMusicAnalysisPort, IMusicRepositoryPort
├── adapters/            # Concrete implementations
│   ├── music_adapter.py         # MusicAnalysisAdapter (using MusicReader)
│   └── repository_adapter.py    # MusicRepositoryAdapter (SQLAlchemy)
├── controllers/         # Business logic layer
│   └── music_controller.py      # MusicController
├── endpoints/           # FastAPI routes
│   ├── health.py        # Health check endpoint
│   └── music.py         # Music analysis endpoints
├── main.py              # FastAPI app factory
└── tests/               # Comprehensive test suite
    ├── test_music.py         # Endpoint tests
    ├── test_models.py        # Model & repository tests
    ├── test_controller.py    # Controller integration tests
    └── conftest.py           # Test fixtures
```

#### Key Design Patterns:

- **Ports**: Abstract interfaces (`IMusicAnalysisPort`, `IMusicRepositoryPort`)
- **Adapters**: Concrete implementations (MusicReader integration, SQLAlchemy database)
- **Controllers**: Business logic orchestrating adapters
- **Endpoints**: HTTP layer using FastAPI
- **Dependency Injection**: Clean dependencies via constructor parameters

### Frontend - React + TypeScript

The frontend is built with React, TypeScript, and modern tooling:

```
frontend/src/
├── schemas/             # Zod validation schemas (API contracts)
│   └── index.ts         # All API response/request schemas
├── services/            # API client layer
│   ├── music-service.ts # Music API calls (using Axios)
│   └── health-service.ts# Health check API
├── hooks/               # Custom React hooks
│   ├── useForm.ts       # Form field management with setValue/trigger
│   └── useMusicAnalysis.ts  # Music analysis state management
├── components/          # React components
│   ├── Layout.tsx       # Main layout wrapper
│   └── MusicAnalyzer.tsx   # Song analysis form (react-hook-form)
├── types/               # TypeScript types
├── utils/               # Utility functions
│   └── api-client.ts    # Axios instance with interceptors
└── App.tsx              # Root component
```

#### Frontend Tech Stack:

- **Framework**: React 18 + TypeScript
- **Forms**: react-hook-form with Zod validation
- **HTTP Client**: Axios with request/response interceptors
- **Schemas**: Zod for runtime type validation and API contracts
- **Build Tool**: Vite for fast development and optimized builds
- **Server**: Nginx for production serving + API proxying

### Form Handling Pattern

The frontend demonstrates advanced `react-hook-form` patterns:

```typescript
const { handleSubmit, setValue, trigger, getValues } = useForm();

// Pattern 1: handleSubmit - Wraps submit handlers with validation
<button onClick={handleSubmit(onSubmit)}>Submit</button>

// Pattern 2: setValue + trigger - Manual field updates with re-validation
const handleKeyChange = async (newKey: string) => {
  setValue('key', newKey, { shouldDirty: true });
  await trigger('key');
};

// Pattern 3: getValues - Read field values outside of submit context
const selectedKey = getValues('key');
```

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Quick Start with Docker

1. **Setup environment variables:**

```bash
# Create .env file in project root
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=artists_db
OPENAI_API_KEY=your_openai_key
OPENAI_PROJECT=your_openai_project
```

2. **Start services:**

```bash
docker-compose up -d
```

Services will be available at:
- **Frontend**: http://localhost
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5433

### Local Development

#### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt

# Run tests
pytest tests/

# Run development server
uvicorn app.main:app --reload
```

#### Frontend Setup

```bash
cd frontend
npm install

# Development server
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📊 Database Schema

### Tables

- **songs**: Main song records with metadata (name, artist, key, bpm)
- **beats**: Individual beat-by-beat analysis (chord, degree, bar info)
- **sections**: Musical sections (verse, chorus, bridge) with analysis
- **chords**: Chord library with degree and quality information

## 🔌 API Endpoints

### Music Analysis

**POST** `/api/v1/music/analyze`
```json
{
  "song_data": {
    "name": "Song Name",
    "artist": "Artist Name",
    "key": "C",
    "bpm": 120
  },
  "beats": [
    {
      "beat_index": 0,
      "bar_number": 1,
      "beat_in_bar": 1,
      "chord": "C:maj",
      "is_new": true
    }
  ]
}
```

**GET** `/api/v1/music/song/{song_id}`

Retrieve previously analyzed song with all beats and sections.

### Health

**GET** `/health`

Check API health status.

## 🔗 Integration with MusicReader

The backend integrates the MusicReader domain package located at:
```
C:\Users\AD\Documents\Musik\Compositions\Program For Reading Music\app\MusicReader
```

The `MusicAnalysisAdapter` uses MusicReader's:
- **MusicKnower**: Chord to degree conversion, chord quality extraction
- **MusicAnalyst**: Section identification, chord progression analysis

## 📝 Project Structure Summary

| Component | Technology | Purpose |
|-----------|-----------|----------|
| Backend | FastAPI + SQLAlchemy | API server with hexagonal architecture |
| Frontend | React + TypeScript | Web UI with type-safe forms |
| Database | PostgreSQL | Persistent data storage |
| Forms | react-hook-form + Zod | Type-safe form validation |
| Testing | pytest | Backend unit and integration tests |
| Container | Docker + Compose | Local development and deployment |
| Server | Nginx | Frontend static serving + API proxy |

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
pytest tests/

# Run specific test file
pytest tests/test_music.py

# Run with coverage
pytest --cov=app tests/
```

Test suites include:
- **test_music.py**: Endpoint integration tests
- **test_models.py**: ORM model and repository tests
- **test_controller.py**: Business logic controller tests

## 📦 Dependencies

### Backend
- fastapi: Web framework
- sqlalchemy: ORM
- psycopg2: PostgreSQL adapter
- pydantic: Data validation
- pytest: Testing framework
- openai: MusicReader integration

### Frontend
- react: UI framework
- typescript: Type safety
- react-hook-form: Form management
- zod: Runtime validation
- axios: HTTP client
- vite: Build tool
- nginx: Static server

## 🛠️ Configuration

### Environment Variables

Create `.env` file with:
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=artists_db
POSTGRES_HOST=psql
POSTGRES_PORT=5432
OPENAI_API_KEY=your_key
OPENAI_PROJECT=your_project
USERNAME_API_CIVITAS=optional
USERID_API_CIVITAS=optional
PASSWORD_API_CIVITAS=optional
```

## 📖 Documentation

### API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Code Organization
- **Hexagonal Architecture**: Clear separation between domain logic and infrastructure
- **Type Safety**: Full TypeScript frontend + Zod schemas for API contracts
- **Form Patterns**: Advanced react-hook-form usage with setValue, trigger, getValues
- **Testing**: Comprehensive unit and integration tests

## 🚢 Deployment

The project is containerized and ready for deployment:

```bash
# Build images
docker-compose build

# Run services
docker-compose up -d

# View logs
docker-compose logs -f api
docker-compose logs -f web
```

## 📝 License

MIT
