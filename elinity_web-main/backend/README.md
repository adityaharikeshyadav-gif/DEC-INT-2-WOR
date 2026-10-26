# Elinity Backend

FastAPI backend for Elinity. It powers trips, experiences, quizzes, conversations, voice helpers, and multiplayer game sessions.

For full project onboarding, see the root `README.md`.

## Stack

- FastAPI
- Uvicorn
- Pydantic
- Groq/OpenAI-compatible AI clients
- FastAPI WebSockets
- Static in-repo data modules

## Structure

```txt
backend/
├── app/
│   ├── main.py                  # FastAPI app setup and router mounting
│   ├── ai.py                    # Shared AI client config
│   ├── prompts.py               # Lumi prompt helpers
│   ├── data/
│   │   ├── trips_data.py
│   │   ├── experiences_data.py
│   │   ├── quiz_data.py
│   │   ├── personas_data.py
│   │   ├── journeys_data.py
│   │   └── game_data/           # One file per game plus registry
│   ├── routers/
│   │   ├── trips.py
│   │   ├── experiences.py
│   │   ├── quizzes.py
│   │   ├── conversations.py
│   │   ├── games.py
│   │   └── voice.py
│   └── voice/
│       ├── stt.py
│       ├── tts.py
│       └── realtime.py
├── run.py
├── requirements.txt
├── runtime.txt
└── test_*.py
```

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Add at least:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Optional for voice:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Run

```bash
cd backend
.venv/bin/python run.py --reload
```

Server:

```txt
http://localhost:8000
```

Docs:

```txt
http://localhost:8000/docs
http://localhost:8000/redoc
```

## Main endpoints

Trips:

- `GET /trips`
- `GET /trips/{trip_id}`
- `POST /trips/book`
- `POST /trips/{trip_id}/lumi-insight`

Experiences:

- `GET /experiences`
- `GET /experiences/{experience_id}`
- `POST /experiences/book`
- `POST /experiences/{experience_id}/lumi-insight`

Quizzes:

- `GET /quizzes`
- `POST /session/start`
- `POST /chat`
- `POST /chat/general`
- `POST /session/switch-quiz`

Conversations:

- `GET /conversations/personas`
- `GET /conversations/journeys`
- `POST /conversations/session/start`
- `POST /conversations/chat`
- `GET /conversations/history`
- `GET /conversations/insights`

Games:

- `GET /games/catalog`
- `POST /games/sessions`
- `GET /games/sessions/{session_id}`
- `GET /games/sessions/by-code/{invite_code}`
- `WS /games/ws/{session_id}?username={display_name}`

Voice:

- `POST /conversations/voice/transcribe`
- `GET /conversations/voice/tts`
- `POST /conversations/voice/chat`

## Game catalog

Game definitions live in:

```txt
backend/app/data/game_data/
```

The public catalog is controlled by:

```txt
backend/app/data/game_data/registry.py
```

Current public games: 12.

Implemented but hidden: `game-of-games` / `meta_game`.

## Tests

From the repo root:

```bash
PYTHONPATH=. python3 backend/test_game_data_registry.py
PYTHONPATH=. python3 backend/test_unsaid.py
PYTHONPATH=. python3 backend/test_turncoat.py
PYTHONPATH=. python3 backend/test_letters.py
PYTHONPATH=. python3 backend/test_game_of_games.py
```

Some tests are live integration scripts and expect the backend to be running:

```bash
python3 backend/test_conversations.py
```

## Notes

- Game rooms are currently in-memory.
- Restarting the backend clears active sessions.
- Scaling multiplayer games beyond one process needs shared state/pub-sub.
- CORS is currently open for development.
- Most catalogs are static Python data modules, not database-backed.
