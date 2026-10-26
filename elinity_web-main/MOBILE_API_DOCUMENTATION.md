# Elinity Mobile API Quick Doc

Short API reference for the mobile app, based on the current FastAPI backend and frontend API wrappers.

Base URL:

```txt
http://localhost:8000
```

Use deployed backend URL in production. All endpoints below are relative to `BASE_URL`.

## Important Notes

- JSON APIs use `Content-Type: application/json`.
- Voice APIs upload raw audio bytes, not multipart form data.
- No auth is implemented yet.
- Sessions, game rooms, bookings, and saved insights are in memory. Backend restart clears them.
- Error format:

```json
{ "detail": "Error message" }
```

Common errors: `400`, `404`, `409`, `422`, `500`.

## Health

| Method | Endpoint | Use |
| --- | --- | --- |
| `GET` | `/` | Backend status |

Response:

```json
{ "service": "Elinity API", "status": "running", "version": "2.0.0" }
```

## Trips

| Method | Endpoint | Body / Query |
| --- | --- | --- |
| `GET` | `/trips` | Query: `vibe`, `region`, `max_duration`, `max_price`, `difficulty`, `recommended_only`, `q` |
| `GET` | `/trips/{trip_id}` | - |
| `POST` | `/trips/book` | Booking JSON |
| `POST` | `/trips/{trip_id}/lumi-insight` | `{ "user_context": "..." }` |

Booking body:

```json
{
  "trip_id": "trip-id",
  "trip_title": "Trip title",
  "price": 25000,
  "user_email": "user@example.com",
  "user_name": "User Name"
}
```

Booking response:

```json
{
  "booking_id": "uuid",
  "status": "pending",
  "trip_id": "trip-id",
  "message": "Booking received..."
}
```

Lumi insight response:

```json
{ "insight": "AI insight", "trip_id": "trip-id" }
```

## Experiences

| Method | Endpoint | Body / Query |
| --- | --- | --- |
| `GET` | `/experiences` | Query: `category`, `city`, `max_price`, `recommended_only`, `q` |
| `GET` | `/experiences/{experience_id}` | - |
| `POST` | `/experiences/book` | Booking JSON |
| `POST` | `/experiences/{experience_id}/lumi-insight` | `{ "user_context": "..." }` |

Booking body:

```json
{
  "experience_id": "experience-id",
  "experience_title": "Experience title",
  "price": 3500,
  "user_email": "user@example.com",
  "user_name": "User Name"
}
```

Booking response:

```json
{
  "booking_id": "uuid",
  "status": "pending",
  "experience_id": "experience-id",
  "message": "Booking received..."
}
```

Lumi insight response:

```json
{ "insight": "AI insight", "experience_id": "experience-id" }
```

## Quizzes And General Chat

These quiz routes are mounted at root level.

| Method | Endpoint | Body / Query |
| --- | --- | --- |
| `GET` | `/quizzes` | - |
| `POST` | `/session/start` | Start quiz/general session |
| `POST` | `/chat` | Send quiz session message |
| `POST` | `/chat/general` | General Lumi chat |
| `POST` | `/session/switch-quiz` | Query: `session_id`, `quiz_id`, `mode`, `participants` |

Start session body:

```json
{
  "quiz_id": 1,
  "mode": "solo",
  "participants": ["Asha", "Rohan"]
}
```

Start response:

```json
{ "session_id": "uuid", "greeting": "AI greeting" }
```

Chat body:

```json
{ "session_id": "uuid", "message": "My answer" }
```

Chat response:

```json
{ "response": "AI response", "quiz_active": true, "quiz_id": 1 }
```

General chat body:

```json
{
  "message": "Help me choose an experience.",
  "history": [{ "sender": "user", "text": "I like calm spaces." }]
}
```

## Conversations

| Method | Endpoint | Body / Query |
| --- | --- | --- |
| `GET` | `/conversations/personas` | - |
| `GET` | `/conversations/personas/{persona_id}` | - |
| `GET` | `/conversations/journeys` | - |
| `POST` | `/conversations/session/start` | Start persona conversation |
| `POST` | `/conversations/chat` | Send message |
| `POST` | `/conversations/save-insight` | Save reflection |
| `GET` | `/conversations/history` | In-memory history |
| `GET` | `/conversations/insights` | Saved insights |
| `GET` | `/conversations/session/{session_id}` | Raw session |

Start body:

```json
{
  "persona_id": "persona-id",
  "journey_id": "journey-id",
  "mode": "text"
}
```

Start response:

```json
{
  "session_id": "uuid",
  "greeting": "AI greeting",
  "persona_name": "Persona Name",
  "persona_portrait": "image-url"
}
```

Chat body:

```json
{ "session_id": "uuid", "message": "Hello" }
```

Chat response:

```json
{
  "response": "AI response",
  "session_concluded": false,
  "reflection": null
}
```

When complete:

```json
{
  "response": "Final message",
  "session_concluded": true,
  "reflection": {
    "summary": "Summary",
    "insight": "Insight"
  }
}
```

Save insight body:

```json
{
  "session_id": "uuid",
  "persona_id": "persona-id",
  "persona_name": "Persona Name",
  "persona_portrait": "image-url",
  "journey_title": "Journey title",
  "summary": "Summary",
  "insight": "Insight"
}
```

## Voice

| Method | Endpoint | Body / Query |
| --- | --- | --- |
| `POST` | `/conversations/voice/transcribe` | Raw audio bytes. Query: `filename` |
| `GET` | `/conversations/voice/tts` | Query: `text`, `voice` |
| `POST` | `/conversations/voice/chat` | Raw audio bytes. Query: `session_id`, `filename`, `voice` |

Audio headers:

```http
Content-Type: audio/webm
```

Transcribe response:

```json
{ "text": "Transcribed speech" }
```

Voice chat response:

```json
{
  "user_transcript": "What user said",
  "ai_response": "AI response",
  "session_concluded": false,
  "reflection": null,
  "audio_base64": "base64-mp3-or-empty"
}
```

If `audio_base64` is empty, use native mobile TTS fallback.

## Games REST

| Method | Endpoint | Body / Query |
| --- | --- | --- |
| `GET` | `/games/catalog` | - |
| `POST` | `/games/sessions` | `{ "game_slug": "callout", "mood": "Reflective" }` |
| `GET` | `/games/sessions/{session_id}` | Session state |
| `GET` | `/games/sessions/by-code/{invite_code}` | Join by invite code |

Create session response:

```json
{
  "session_id": "uuid",
  "game_slug": "callout",
  "status": "LOBBY",
  "invite_code": "EL-ABCD-E"
}
```

Game session response includes:

```json
{
  "session_id": "uuid",
  "invite_code": "EL-ABCD-E",
  "game_slug": "callout",
  "status": "LOBBY",
  "mood": "Reflective",
  "players": [{ "username": "Asha", "ready": false }],
  "current_round": 1,
  "current_player_id": null,
  "messages": [],
  "concluded": false,
  "game_state": { "phase": "LOBBY" }
}
```

## Games WebSocket

Connect:

```txt
ws://HOST/games/ws/{session_id}?username={display_name}
```

Reconnect with token:

```txt
ws://HOST/games/ws/{session_id}?username=Asha&participant_token=token
```

Store `participant_token` per `session_id + username`.

Server messages:

```json
{ "type": "participant_token", "payload": "token" }
```

```json
{ "type": "game_state", "payload": { "session_id": "uuid", "game_state": {} } }
```

```json
{ "type": "host_typing", "payload": true }
```

```json
{ "type": "error", "message": "Error message" }
```

Client message format:

```json
{ "type": "action_name", "data": {} }
```

Common actions:

| Type | Data |
| --- | --- |
| `toggle_ready` | `{ "is_ready": true }` |
| `start_game` | `{}` |
| `update_mood` | `{ "mood": "Reflective" }` |
| `update_game_config` | Game-specific config |
| `submit_answer` | `{ "text": "answer" }` |
| `pass_turn` | `{}` |
| `next_phase` | `{}` |

Callout actions:

| Type | Data |
| --- | --- |
| `use_veto` | `{}` |
| `submit_private_answer` | `{ "text": "answer" }` |
| `submit_guess` | `{ "text": "guess" }` |
| `submit_bluff` | `{ "text": "fake answer" }` |
| `submit_vote` | `{ "option_index": 0 }` |

The Unsaid actions:

| Type | Data |
| --- | --- |
| `submit_depth_choice` | `{ "choice": "stay" }` |
| `submit_release_sentence` | `{ "starter": "What I needed to say was...", "text": "text", "share": true }` |
| `pause_game` | `{}` |
| `resume_game` | `{}` |
| `stop_game` | `{}` |

Turncoat actions:

| Type | Data |
| --- | --- |
| `submit_turncoat_setup` | `{ "position": "A belief I hold..." }` |
| `submit_turncoat_stance` | `{ "side": "agree" }` |
| `submit_turncoat_peer_scores` | `{ "scores": { "Asha": { "conviction": 8, "logic": 7, "originality": 8, "adaptability": 6 } } }` |

Letters Long Table actions:

| Type | Data |
| --- | --- |
| `submit_letters_compass` | `{ "text": "...", "history": [] }` |
| `submit_letters_occasion` | `{ "text": "..." }` |
| `submit_letters_intake` | `{ "text": "...", "passed": false }` |
| `confirm_letters_sparse_intake` | `{}` |
| `close_letters_session` | `{}` |

Game Of Games actions:

| Type | Data |
| --- | --- |
| `seed_game_of_games_profile` | `{ "profile": { ... } }` |
| `submit_answer` | `{ "text": "choice_key" }` |
| `next_phase` | `{}` |

## Mobile Flow

1. Call `GET /` to check backend.
2. Load catalogs: `/trips`, `/experiences`, `/games/catalog`, `/quizzes`, `/conversations/personas`.
3. Start AI sessions before chatting.
4. For games, create or find a room, then connect WebSocket.
5. Store `session_id` and game `participant_token` locally.
6. Retry game socket once without token if reconnect fails.

## Environment Keys

Backend:

```env
GROQ_API_KEY=required_for_ai
OPENAI_API_KEY=required_for_voice
```

