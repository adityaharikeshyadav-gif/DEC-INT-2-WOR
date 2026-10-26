# Elinity Web

Elinity is a full-stack web app for relationship, reflection, travel, experience, quiz, conversation, and multiplayer game flows.

The frontend is a Vite + React + TypeScript app. The backend is a FastAPI service that provides catalogs, AI-assisted sessions, voice utilities, and multiplayer game WebSocket state.

## Current status

This repo currently includes:

- Public marketing/site pages: landing, about, contact, blog, legal, enterprise, careers, podcast, charter/foundations/studios/physical-universe pages.
- Quizzes: static quiz catalog with Lumi chat flow.
- Conversations: persona/journey selection, chat sessions, history, saved insights, and voice-related hooks.
- Trips: API-backed trip catalog, filters, detail pages, Lumi insight, and booking intent endpoint.
- Experiences: API-backed experience catalog, filters, detail pages, Lumi insight, and booking intent endpoint.
- Play platform: multiplayer game catalog, lobby, WebSocket sessions, custom game screens, and “How to play” guides.
- Backend tests for conversations and game flows.

Game catalog status:

- 13 game modules are implemented in `backend/app/data/game_data/`.
- 12 games are currently public in `/games/catalog`.
- `game-of-games` is implemented but hidden because `meta_game` is commented out in `backend/app/data/game_data/registry.py`.

## Tech stack

Frontend:

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Lucide icons

Backend:

- FastAPI
- Uvicorn
- Pydantic
- Groq/OpenAI-compatible AI clients
- WebSockets via FastAPI/Starlette
- Static in-repo data modules for trips, experiences, quizzes, personas, journeys, and games

## Repository structure

```txt
.
├── src/                         # Frontend app
│   ├── App.tsx                  # Main route table
│   ├── components/              # Shared and feature components
│   │   ├── conversation/        # Conversation UI pieces
│   │   ├── experiences/         # Experience cards, filters, detail UI
│   │   ├── games/               # Game-specific lobby/session/help components
│   │   └── trips/               # Trip cards, filters, detail UI
│   ├── hooks/                   # React hooks, including game WebSocket and voice hooks
│   ├── lib/                     # Frontend API clients and local helpers
│   ├── pages/                   # Route-level pages
│   ├── styles/                  # CSS files
│   ├── types/                   # Shared frontend types
│   └── utils/                   # Frontend utility functions
│
├── backend/                     # FastAPI backend
│   ├── app/
│   │   ├── main.py              # FastAPI app and router mounting
│   │   ├── ai.py                # Shared AI client setup
│   │   ├── prompts.py           # Lumi prompt helpers
│   │   ├── data/                # Static catalogs and prompt/game definitions
│   │   │   └── game_data/       # One file per game + registry
│   │   ├── routers/             # API routers
│   │   └── voice/               # STT/TTS/realtime helpers
│   ├── run.py                   # Local backend runner
│   ├── requirements.txt         # Python dependencies
│   └── test_*.py                # Backend tests/scripts
│
├── public/                      # Static public assets
├── package.json                 # Frontend scripts/dependencies
├── vite.config.ts               # Vite config
├── tailwind.config.js           # Tailwind config
├── ui-registry.md               # UI pattern notes
└── memory.md                    # Project/session notes
```

## Prerequisites

- Node.js 18+ recommended
- npm
- Python 3.12 recommended
- A Groq API key for Lumi AI responses
- Optional OpenAI API key for voice/STT/TTS features

## Environment variables

Backend env file:

```bash
cp backend/.env.example backend/.env
```

At minimum:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Optional voice-related key:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Frontend env is optional for local development. If not set, the app defaults to `http://localhost:8000`.

Create `.env` in the project root only if you need overrides:

```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url_if_using_supabase
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_if_using_supabase
```

## How to run locally

Use two terminals.

### 1. Start the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
.venv/bin/python run.py --reload
```

Backend runs at:

```txt
http://localhost:8000
```

API docs:

```txt
http://localhost:8000/docs
http://localhost:8000/redoc
```

### 2. Start the frontend

From the repo root:

```bash
npm install
npm run dev
```

Frontend runs at:

```txt
http://localhost:5173
```

## Useful commands

Frontend:

```bash
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run preview    # Preview built app
npm run lint       # Run ESLint
```

Backend:

```bash
cd backend
.venv/bin/python run.py --reload
```

Selected tests:

```bash
PYTHONPATH=. python3 backend/test_game_data_registry.py
PYTHONPATH=. python3 backend/test_unsaid.py
PYTHONPATH=. python3 backend/test_turncoat.py
PYTHONPATH=. python3 backend/test_letters.py
PYTHONPATH=. python3 backend/test_game_of_games.py
```

Some integration tests expect the backend server to already be running:

```bash
python3 backend/test_conversations.py
```

## Main frontend routes

Core site:

- `/` landing page
- `/about`
- `/contact`
- `/blog`
- `/blog/:id`
- `/ellaris`
- `/quizzes`
- `/trips`
- `/trips/:id`
- `/experiences`
- `/experiences/:id`
- `/conversations`
- `/conversations/persona/:id`
- `/conversations/chat/:sessionId`
- `/conversations/history`
- `/play`
- `/play/lobby/:sessionId`
- `/play/session/:sessionId`

Additional pages:

- `/join-us`
- `/enterprise`
- `/legal`
- `/sitemap`
- `/privacypolicy`
- `/pod`
- `/software`
- `/designhead`
- `/headai`
- `/charter`
- `/foundations`
- `/studios`
- `/physical-universe`

## Main backend API areas

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
- `GET /conversations/personas/{persona_id}`
- `POST /conversations/session/start`
- `POST /conversations/chat`
- `POST /conversations/save-insight`
- `GET /conversations/history`
- `GET /conversations/insights`
- `GET /conversations/session/{session_id}`

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

## Games included right now

Public in the Play catalog:

1. Drift
2. Callout
3. Threadweave
4. Uncharted Horizons
5. The Unsaid
6. Turncoat: The Other Side
7. The Letters at the Long Table
8. Roleswap
9. Planet Enigma
10. The Odyssey of Mind
11. The Philosophy Arena
12. The Appreciation Game

Implemented but hidden:

- The Game of Games

To show The Game of Games again, edit:

```txt
backend/app/data/game_data/registry.py
```

Change:

```py
# meta_game,
```

to:

```py
meta_game,
```

If you re-enable it, also update `backend/test_game_data_registry.py` so the expected public catalog includes `game-of-games`.

## How data flows

Frontend catalog pages call small API clients in `src/lib/`.

```txt
React page/component
  → src/lib/*Api.ts
  → FastAPI router in backend/app/routers/
  → static data/prompt logic in backend/app/data/
  → JSON response back to the UI
```

Games use a slightly different flow:

```txt
/play
  → GET /games/catalog
  → create session with POST /games/sessions
  → lobby/session connects to WS /games/ws/{session_id}
  → backend updates in-memory session state
  → all connected players receive game_state broadcasts
```

Important: game sessions are currently in-memory. Restarting the backend clears active sessions.

## How to update the project

### Add or edit a game

1. Add/edit the backend game definition:

   ```txt
   backend/app/data/game_data/{game_name}.py
   ```

2. Register it in:

   ```txt
   backend/app/data/game_data/registry.py
   ```

3. Add session initialization/flow handling if needed:

   ```txt
   backend/app/routers/games.py
   ```

4. Add frontend API types if the game needs new state fields:

   ```txt
   src/lib/gamesApi.ts
   ```

5. Add a custom UI only if the generic game page is not enough:

   ```txt
   src/components/games/
   src/pages/GameLobby.tsx
   src/pages/GameSession.tsx
   ```

6. Add/update the guide:

   ```txt
   src/lib/gameHelp.ts
   ```

7. Run:

   ```bash
   npm run build
   PYTHONPATH=. python3 backend/test_game_data_registry.py
   ```

### Update a game card

Game cards come from backend catalog data, not from the frontend.

Edit the `GAME` object in the relevant file:

```txt
backend/app/data/game_data/
```

The Play page reads:

```txt
GET /games/catalog
```

### Hide a game card

Edit:

```txt
backend/app/data/game_data/registry.py
```

Remove or comment the game module inside `PUBLIC_GAME_MODULES`.

### Update “How to play”

Edit:

```txt
src/lib/gameHelp.ts
```

Every visible game should have a matching guide. Keep guides practical:

- what players do first
- round/session flow
- available safety controls
- how scoring or winning works
- short tips

### Update Trips

Backend data:

```txt
backend/app/data/trips_data.py
```

Backend routes:

```txt
backend/app/routers/trips.py
```

Frontend API:

```txt
src/lib/tripsApi.ts
```

Frontend UI:

```txt
src/pages/ElinityTrips.tsx
src/components/trips/
src/types/trip.ts
```

### Update Experiences

Backend data:

```txt
backend/app/data/experiences_data.py
```

Backend routes:

```txt
backend/app/routers/experiences.py
```

Frontend API:

```txt
src/lib/experiencesApi.ts
```

Frontend UI:

```txt
src/pages/ElinityExperiences.tsx
src/components/experiences/
```

### Update Conversations

Backend data:

```txt
backend/app/data/personas_data.py
backend/app/data/journeys_data.py
```

Backend routes:

```txt
backend/app/routers/conversations.py
```

Frontend API/UI:

```txt
src/lib/conversationsApi.ts
src/pages/Conversations.tsx
src/pages/ConversationDetail.tsx
src/pages/ConversationChat.tsx
src/components/conversation/
```

### Add a new page

1. Add the page in `src/pages/`.
2. Add a route in `src/App.tsx`.
3. Add a nav link in `src/components/Navbar.tsx` if it should be public navigation.
4. Run `npm run build`.

## Common troubleshooting

### Frontend says WebSocket connection failed

Make sure the backend is running:

```bash
cd backend
.venv/bin/python run.py --reload
```

Make sure the frontend points to the backend:

```env
VITE_API_URL=http://localhost:8000
```

The frontend derives WebSocket URL from `VITE_API_URL`.

### Game says display name belongs to another participant

The same display name is already connected to that game session. Use a different name or restart the session/backend during local testing.

## Deckoviz Taste Quizzes & Atelier Chatbot Integration

Deckoviz features are delivered conversationally through the website chatbot pipeline:

- **Taste Quizzes (#46–49)**: Added Style Calibration, Folio Taste Matrix, Illuminated Story Studio, and Archival Gazette to the catalog with conversational evaluation through Lumi.
- **Vizzy Curator Persona**: Added `vizzy` to `/conversations/personas` for 1-on-1 aesthetic and chiaroscuro guidance.
- **Curated Atelier Experiences**: Added Archival Atelier, Illuminated Story Studio, and Art Folio Salon to the `/experiences` catalog.
- **Purple Brand Theme & Logo**: Integrated the royal purple palette and `/logo.jpeg` branding across the UI and floating chatbot widget.
- **Verification**: Run `python -m pytest backend/test_deckoviz_integration.py` to verify all routes and endpoints.

