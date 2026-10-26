import asyncio
import json
import logging
import uuid
import re
import copy
from datetime import datetime, timezone
from typing import Optional, List
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from ..ai import GROQ_API_KEY, GROQ_MODEL, groq_client
from ..data.games_data import GAMES_CATALOG, GAMES_BY_SLUG, get_lumi_system_prompt
from ..data.game_data.meta_game import (
    GAME_OF_GAMES_PROFILE_FIELDS,
    GAME_OF_GAMES_SCENARIO_PACKS,
    GAME_OF_GAMES_SCENARIOS,
    GAME_OF_GAMES_SCENARIOS_BY_SLUG,
)

logger = logging.getLogger("games.router")

router = APIRouter(prefix="/games", tags=["games"])

# In-memory stores
game_sessions: dict[str, dict] = {}
game_participant_tokens: dict[str, dict[str, str]] = {}

UNSAID_TERRAINS = {"appreciation", "regret", "apology", "admission", "hard_thing", "wander"}
UNSAID_DEPTHS = ("surface", "current", "bedrock")
UNSAID_RELEASE_STARTERS = (
    "What I needed to say was...",
    "What I needed to hear was...",
    "What I'm letting go of tonight is...",
    "What I'm taking with me is...",
)
TURNCOAT_MODES = {"classic", "full_circle"}
TURNCOAT_TERRITORIES = {
    "mixed", "life_philosophy", "ethics_morality", "thought_experiments",
    "personal_choices", "society_world", "wild_card",
}
TURNCOAT_BASE_DIMENSIONS = ("conviction", "logic", "originality", "adaptability")
LETTERS_MODES = {"letter", "conversation", "council"}
LETTERS_ANCHORS = (
    ("child", 6, 12, "The Child"),
    ("young_one", 13, 19, "The Young One"),
    ("striver", 20, 30, "The Striver"),
    ("maker", 31, 49, "The Maker"),
    ("elder", 50, 69, "The Elder"),
    ("ancient", 70, 90, "The Ancient"),
)
LETTERS_INTAKE_COUNT = 5
GAME_OF_GAMES_MODES = {"discovery", "academy"}
GAME_OF_GAMES_PACKS = set(GAME_OF_GAMES_SCENARIO_PACKS.keys())
GAME_OF_GAMES_DEFAULT_TIMER_SECONDS = 180
GAME_OF_GAMES_DEFAULT_SCENARIO_COUNT = 3


def sanitize_session_state(session: dict, user: str) -> dict:
    if not session:
        return session

    if session.get("game_slug") == "the-unsaid":
        session_copy = copy.deepcopy(session)
        game_state = session_copy.get("game_state") or {}
        releases = game_state.pop("release_sentences", {})
        depth_votes = game_state.pop("depth_votes", {})
        individual_maps = game_state.pop("individual_maps", {})
        paused_by = game_state.pop("paused_by", None)
        game_state.pop("session_events", None)

        release = releases.get(user) if user else None
        game_state["my_release_submitted"] = release is not None
        game_state["my_release_starter"] = release.get("starter") if isinstance(release, dict) else None
        game_state["my_depth_choice"] = depth_votes.get(user) if user else None
        game_state["depth_vote_count"] = len(depth_votes)
        game_state["individual_map"] = individual_maps.get(user) if user else None
        host = session_copy.get("players", [{}])[0].get("username") if session_copy.get("players") else None
        game_state["can_resume"] = bool(user and (user == paused_by or user == host))
        return session_copy

    if session.get("game_slug") == "turncoat":
        session_copy = copy.deepcopy(session)
        game_state = session_copy.get("game_state") or {}
        phase = game_state.get("phase")
        real_sides = game_state.pop("real_sides", {})
        lumi_scores = game_state.pop("lumi_scores", {})
        peer_scores = game_state.pop("peer_scores", {})
        bonus_awarded = game_state.pop("turncoat_bonus_awarded", None)
        bonus_round = game_state.pop("turncoat_bonus_round", None)
        game_state.pop("session_events", None)
        game_state["my_real_side"] = real_sides.get(user) if user else None
        game_state["stance_count"] = len(real_sides)
        game_state["my_peer_scores_submitted"] = bool(user and user in peer_scores)
        if phase in {"REVEAL", "COMPLETED"}:
            game_state["revealed_lumi_scores"] = lumi_scores
            game_state["revealed_peer_scores"] = peer_scores
            game_state["turncoat_bonus_awarded"] = bonus_awarded
            game_state["turncoat_bonus_round"] = bonus_round
        return session_copy

    if session.get("game_slug") == "letters-long-table":
        session_copy = copy.deepcopy(session)
        game_state = session_copy.get("game_state") or {}
        game_state.pop("history_snapshot", None)
        game_state.pop("session_events", None)
        if not user:
            session_copy["messages"] = []
            session_copy["drift_log"] = None
            safe_keys = {"phase", "mode"}
            session_copy["game_state"] = {
                key: value for key, value in game_state.items() if key in safe_keys
            }
        return session_copy

    if session.get("game_slug") == "game-of-games":
        session_copy = copy.deepcopy(session)
        game_state = session_copy.get("game_state") or {}
        choices = game_state.get("choices", {})
        scenario = game_state.get("current_scenario") or {}
        phase = game_state.get("phase")
        scenario_format = scenario.get("format")
        game_state.pop("session_events", None)
        game_state.pop("profile_seeds", None)
        game_state["submitted_players"] = list(choices.keys()) if isinstance(choices, dict) else []
        game_state["choice_count"] = len(choices) if isinstance(choices, dict) else 0
        game_state["my_choice"] = choices.get(user) if user and isinstance(choices, dict) else None

        if isinstance(choices, dict) and phase not in {"REVEAL", "COMPLETED"}:
            if scenario_format in {"sequential_choice", "negotiation"}:
                game_state["choices"] = choices.copy()
            else:
                game_state["choices"] = {
                    player: (choice if player == user else True)
                    for player, choice in choices.items()
                }
        return session_copy

    if session.get("game_slug") != "callout":
        return session

    game_state = session.get("game_state")
    if not game_state or not isinstance(game_state, dict):
        return session

    phase = game_state.get("phase")
    round_data = game_state.get("round_data")
    if not round_data or not isinstance(round_data, dict):
        return session

    target_player = round_data.get("target_player")

    # Create a deep copy to keep master in-memory state pristine
    session_copy = copy.deepcopy(session)
    game_state_copy = session_copy["game_state"]
    round_data_copy = game_state_copy["round_data"]

    # 1. Hide private/correct answer from all players except the target player,
    # unless we are in the REVEAL phase or the game is COMPLETED.
    if phase not in ("REVEAL", "COMPLETED") and user != target_player:
        if "private_answer" in round_data_copy:
            round_data_copy["private_answer"] = None
        if "correct_answer" in round_data_copy:
            round_data_copy["correct_answer"] = None

    # 2. Hide guesses content from other players during the guessing phase.
    # Keep the username keys so the frontend knows who has submitted a guess,
    # but replace the guess text with True.
    if phase in ("HOT_SEAT_GUESSING", "RAPID_SUBMITTING", "FINAL_GUESSING") and phase != "REVEAL":
        guesses = round_data_copy.get("guesses", {})
        for player in list(guesses.keys()):
            if player != user:
                guesses[player] = True

    # 3. Hide bluffs content from everyone except the creator during submission,
    # and hide bluff maps completely from non-target players during the voting phase.
    if phase == "BLUFF_SUBMITTING_FAKE":
        bluffs = round_data_copy.get("bluffs", {})
        for player in list(bluffs.keys()):
            if player != user:
                bluffs[player] = True
    elif phase == "BLUFF_VOTING":
        if user != target_player:
            bluffs = round_data_copy.get("bluffs", {})
            round_data_copy["bluffs"] = {player: True for player in bluffs}

    # 4. Sanitize bluff_options in BLUFF_VOTING phase.
    # Remove 'creator' and 'is_correct' keys from choices for voters (non-target players).
    if phase == "BLUFF_VOTING" and user != target_player:
        bluff_options = round_data_copy.get("bluff_options", [])
        sanitized_options = []
        for opt in bluff_options:
            if isinstance(opt, dict):
                sanitized_opt = opt.copy()
                sanitized_opt.pop("creator", None)
                sanitized_opt.pop("is_correct", None)
                sanitized_options.append(sanitized_opt)
            else:
                sanitized_options.append(opt)
        round_data_copy["bluff_options"] = sanitized_options

    # 5. Hide votes from everyone during voting phase.
    # A voter can see their own vote, but others shouldn't see it until reveal.
    if phase == "BLUFF_VOTING":
        votes = round_data_copy.get("votes", {})
        for player in list(votes.keys()):
            if player != user:
                votes[player] = True

    return session_copy

class ConnectionManager:
    def __init__(self):
        # Maps session_id -> {username: WebSocket}
        self.active_connections: dict[str, dict[str, WebSocket]] = {}

    async def connect(self, session_id: str, username: str, websocket: WebSocket, subprotocol: Optional[str] = None):
        await websocket.accept(subprotocol=subprotocol)
        if session_id not in self.active_connections:
            self.active_connections[session_id] = {}
        self.active_connections[session_id][username] = websocket

    def disconnect(self, session_id: str, username: str, websocket: WebSocket):
        if session_id in self.active_connections:
            if username in self.active_connections[session_id]:
                # Only disconnect if this matches the active connection instance
                if self.active_connections[session_id][username] == websocket:
                    del self.active_connections[session_id][username]
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

    async def broadcast(self, session_id: str, message: dict):
        if session_id in self.active_connections:
            # Snapshot before yielding so later state mutations cannot alter an earlier payload.
            connections = list(self.active_connections[session_id].items())
            await asyncio.gather(*(
                self._send_safe(user, ws, session_id, copy.deepcopy(message))
                for user, ws in connections
            ))

    async def _send_safe(self, user: str, ws: WebSocket, session_id: str, message: dict):
        msg_type = message.get("type")
        try:
            if msg_type == "game_state" and "payload" in message:
                sanitized_msg = message.copy()
                sanitized_msg["payload"] = sanitize_session_state(sanitized_msg["payload"], user)
                await ws.send_json(sanitized_msg)
            else:
                await ws.send_json(message)
        except Exception as e:
            logger.error(f"Error broadcasting to {user} in session {session_id}: {e}")
            self.disconnect(session_id, user, ws)

manager = ConnectionManager()

def remove_disconnected_lobby_player(session_id: str, session: dict, username: str) -> bool:
    """Remove a player from a lobby only after their active socket is gone."""
    if session.get("status") != "LOBBY":
        return False
    if manager.active_connections.get(session_id, {}).get(username) is not None:
        return False

    players = session.get("players") or []
    remaining_players = [player for player in players if player.get("username") != username]
    if len(remaining_players) == len(players):
        return False

    session["players"] = remaining_players
    return True

# --- Pydantic Models for REST API ---

class CreateSessionRequest(BaseModel):
    game_slug: str
    mood: Optional[str] = "Reflective"

class CreateSessionResponse(BaseModel):
    session_id: str
    game_slug: str
    status: str
    invite_code: str

# --- REST Endpoints ---

@router.get("/catalog")
async def get_catalog():
    return GAMES_CATALOG

@router.post("/sessions", response_model=CreateSessionResponse)
async def create_game_session(req: CreateSessionRequest):
    game = GAMES_BY_SLUG.get(req.game_slug)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    session_id = str(uuid.uuid4())
    # Generate simple clean invite code
    invite_code = f"EL-{uuid.uuid4().hex[:4].upper()}-{uuid.uuid4().hex[-1].upper()}"

    game_state = None
    if req.game_slug == "drift":
        game_state = {
            "phase": "LOBBY",
            "players_state": {},        # {player: {feeling}}
            "mood_votes": {},           # {player: mood}
            "collective_answers": {},   # {player: answer}
            "twist_offered": False,
            "session_events": []
        }
    elif req.game_slug == "callout":
        game_state = {
            "phase": "LOBBY",
            "scores": {},
            "vetos_used": {},
            "hot_seat_player_id": None,
            "round_data": {
                "prompt": None,
                "target_player": None,
                "private_answer": None,
                "guesses": {},
                "bluffs": {},
                "votes": {},
                "timestamps": {},
                "correct_answer": None,
                "bluff_options": []
            },
            "session_events": []
        }
    elif req.game_slug == "threadweave":
        game_state = {
            "phase": "LOBBY",
            "mode": "loom",           # "loom" | "spindle"
            "texture": "hybrid",      # "warm" | "weird" | "dark" | "sci_fi" | "thriller" | "hybrid"
            "story_segments": [],
            "pressure_point_asked": False,
            "curveball_used": False,
            "session_events": []
        }
    elif req.game_slug == "uncharted-horizons":
        game_state = {
            "phase": "LOBBY",
            "mode": "solo",            # "solo" | "shared"
            "terrain": "dream",        # one of 6 terrains
            "depth_level": "surface",  # "surface" | "current" | "bedrock"
            "terrain_badges": {},
            "session_events": []
        }
    elif req.game_slug == "the-unsaid":
        game_state = {
            "phase": "LOBBY",
            "mode": "solo",            # "solo" | "face_to_face" | "group"
            "terrain": "hard_thing",   # one of 5 terrains
            "depth_level": "surface",
            "opening_answers": {},
            "turns_at_depth": 0,
            "depth_votes": {},
            "release_sentences": {},
            "individual_maps": {},
            "shared_map": None,
            "last_lumi_move": None,
            "paused": False,
            "paused_by": None,
            "stopped": False,
            "session_events": []
        }
    elif req.game_slug == "turncoat":
        game_state = {
            "phase": "LOBBY",
            "mode": "classic",
            "total_rounds": 3,
            "territory": "mixed",
            "setup_positions": {},
            "motion": None,
            "motion_territory": None,
            "real_sides": {},
            "assigned_positions": {},
            "arguments": {},
            "lumi_scores": {},
            "peer_scores": {},
            "score_history": [],
            "totals": {},
            "round": 1,
            "turn_index": 0,
            "curveball": None,
            "turncoat_bonus_awarded": None,
            "turncoat_bonus_round": None,
            "final_declarations": None,
            "session_events": []
        }
    elif req.game_slug == "letters-long-table":
        game_state = {
            "phase": "LOBBY",
            "mode": "conversation",
            "selected_ages": [{"age": 80, "anchor": "ancient", "label": "The Ancient · age 80"}],
            "compass": None,
            "occasion": None,
            "history_snapshot": [],
            "return_match": None,
            "intake_question": None,
            "intake_answers": [],
            "intake_index": 0,
            "letter_sections": [],
            "letter_moves": [],
            "interaction_count": 0,
            "council_turns": [],
            "table_log": None,
            "assembled_letter": None,
            "paused": False,
            "full_table_achieved": False,
            "newly_visited_anchors": [],
            "session_events": []
        }
    elif req.game_slug == "roleswap":
        game_state = {
            "phase": "LOBBY",
            "swap_mode": "full",        # "pure" | "deep" | "full"
            "assignments": {},          # {player: who_they_play}
            "scenario_level": 0,        # 0-4
            "scores": {},               # {player: {instinct, voice, depth}}
            "perfect_swap_awarded": False,
            "curveball_used": False,
            "is_mirror_round": False,
            "pending_score_from": None, # username of target player who needs to score
            "session_events": []
        }
    elif req.game_slug == "planet-enigma":
        game_state = {
            "phase": "LOBBY",
            "world": "desert_island",  # one of 7 world keys
            "mode": "solo",             # "solo" | "multiplayer"
            "scores": {},               # {player: int}
            "current_puzzle": None,     # {text, answer, category, hint_1, hint_2, hint_3}
            "current_puzzle_index": 0,
            "hints_used": {},           # {puzzle_index: {player: count}}
            "current_answers": {},      # {player: answer_text} for current puzzle
            "speed_bonus_awarded": None, # username of speed bonus recipient
            "vault": [],                # list of puzzle texts used (anti-repetition)
            "world_completed": False,
            "session_events": []
        }
    elif req.game_slug == "odyssey-mind":
        game_state = {
            "phase": "LOBBY",
            "realm": "synthesis",      # Selected realm slug
            "realm_type": "trial",     # Realm challenge format
            "difficulty_tier": 1,      # Tier 1-4
            "scores": {},              # {player: int}
            "attributes": {"wisdom": 10, "wit": 10, "depth": 10, "empathy": 10, "creativity": 10},
            "abilities": [],           # Unlocked abilities
            "character_level": 1,      # Character level
            "rank": "Wanderer",        # Ranks Wanderer -> The One
            "expedition_log": [],      # Evocative expedition notes
            "session_events": []
        }
    elif req.game_slug == "philosophy-arena":
        game_state = {
            "phase": "LOBBY",
            "tier": "agora",           # "agora" | "academy"
            "domain": "ethics",        # Active domain
            "challenge_format": "socratic_dialogue", # Challenge format
            "philosophical_rank": "Questioner", # Philosophical rank
            "scores": {},              # {player: int}
            "abilities": [],           # Unlocked abilities
            "agora_vocabulary": [],    # Vocabulary built
            "historical_witness_active": False,
            "session_events": []
        }
    elif req.game_slug == "appreciation-game":
        game_state = {
            "phase": "LOBBY",
            "opening_inventory": {},   # {player: private_hope}
            "specific_appreciations": [], # List of specific appreciations
            "seen_marker_awarded": False,
            "hopes_met_count": 0,
            "session_events": []
        }
    elif req.game_slug == "game-of-games":
        game_state = {
            "phase": "LOBBY",
            "mode": "discovery",       # "discovery" | "academy"
            "scenario_pack": "foundations",
            "scenario_count": GAME_OF_GAMES_DEFAULT_SCENARIO_COUNT,
            "scenario_index": 0,
            "scenario_order": [],
            "current_scenario": None,
            "active_choices": [],
            "required_players": [],
            "choices": {},
            "revealed_choices": {},
            "payoff_result": None,
            "round_tracker": [],
            "scenario_history": [],
            "profile_seeds": {},
            "timer_seconds": GAME_OF_GAMES_DEFAULT_TIMER_SECONDS,
            "timer_started_at": None,
            "scores": {},
            "decision_profile": {},
            "session_events": []
        }


    game_sessions[session_id] = {
        "session_id": session_id,
        "invite_code": invite_code,
        "game_slug": req.game_slug,
        "status": "LOBBY",
        "mood": req.mood,
        "players": [],  # List of {"username": str, "ready": bool}
        "current_round": 1,
        "current_player_id": None,
        "messages": [],  # List of {"role": str, "sender": str, "content": str}
        "concluded": False,
        "drift_log": None,
        "twist_offered": False,
        "game_state": game_state
    }

    return CreateSessionResponse(
        session_id=session_id,
        game_slug=req.game_slug,
        status="LOBBY",
        invite_code=invite_code
    )

def get_or_create_session(session_id: str) -> dict:
    session = game_sessions.get(session_id)
    if not session:
        # Lazy fallback creation to prevent developer disconnects on reload
        invite_code = f"EL-{session_id[:4].upper()}-{session_id[-1].upper()}"
        game_state = {
            "phase": "LOBBY",
            "scores": {},
            "vetos_used": {},
            "hot_seat_player_id": None,
            "round_data": {
                "prompt": None,
                "target_player": None,
                "private_answer": None,
                "guesses": {},
                "bluffs": {},
                "votes": {},
                "timestamps": {},
                "correct_answer": None,
                "bluff_options": []
            },
            "session_events": []
        }
        session = {
            "session_id": session_id,
            "invite_code": invite_code,
            "game_slug": "callout",
            "status": "LOBBY",
            "mood": "Playful",
            "players": [],
            "current_round": 1,
            "current_player_id": None,
            "messages": [],
            "concluded": False,
            "drift_log": None,
            "twist_offered": False,
            "game_state": game_state
        }
        game_sessions[session_id] = session
    return session


NEW_GAME_SLUGS = {
    "threadweave", "uncharted-horizons", "the-unsaid", "turncoat",
    "letters-long-table", "roleswap", "planet-enigma",
    "odyssey-mind", "philosophy-arena", "appreciation-game",
    "game-of-games", "drift"
}

@router.get("/sessions/{session_id}")
async def get_session_details(session_id: str):
    session = get_or_create_session(session_id)
    return sanitize_session_state(session, "")

@router.get("/sessions/by-code/{invite_code}")
async def get_session_by_code(invite_code: str):
    for session_id, session in game_sessions.items():
        if session["invite_code"] == invite_code.strip().upper():
            return sanitize_session_state(session, "")
    raise HTTPException(status_code=404, detail="Session with this invite code not found")

# --- LLM Integration Helper ---

def _build_lumi_kwargs(session: dict) -> dict:
    """Extract game-specific kwargs from session game_state for the prompt dispatcher."""
    gs = session.get("game_state") or {}
    slug = session.get("game_slug", "")
    if slug == "callout":
        return {
            "current_round": session.get("current_round", 1),
            "phase": gs.get("phase", "ROUND_1_PROMPT"),
            "scores": gs.get("scores", {}),
            "round_data": gs.get("round_data", {})
        }
    if slug == "threadweave":
        return {
            "mode": gs.get("mode", "loom"), 
            "texture": gs.get("texture", "hybrid"),
            "phase": gs.get("phase", "SETUP_MODE")
        }
    if slug == "uncharted-horizons":
        return {
            "mode": gs.get("mode", "solo"),
            "terrain": gs.get("terrain", ""),
            "depth_level": gs.get("depth_level", "surface"),
            "phase": gs.get("phase", "SETUP_CHECKIN")
        }
    if slug == "the-unsaid":
        return {
            "mode": gs.get("mode", "solo"),
            "terrain": gs.get("terrain", "hard_thing"),
            "depth_level": gs.get("depth_level", "surface"),
            "phase": gs.get("phase", "LOBBY"),
        }
    if slug == "turncoat":
        return {
            "mode": gs.get("mode", "classic"),
            "topic": gs.get("motion", "an open motion"),
            "assigned_positions": gs.get("assigned_positions", {}),
            "phase": gs.get("phase", "LOBBY"),
            "round_number": gs.get("round", 1),
        }
    if slug == "letters-long-table":
        return {
            "mode": gs.get("mode", "conversation"),
            "selected_ages": gs.get("selected_ages", []),
            "compass": gs.get("compass"),
            "voice_material": gs.get("intake_answers", []),
            "phase": gs.get("phase", "LOBBY"),
            "history": gs.get("history_snapshot", []),
        }
    if slug == "roleswap":
        return {
            "swap_mode": gs.get("swap_mode", "full"),
            "scenario_level": gs.get("scenario_level", 0),
            "assignments": gs.get("assignments", {})
        }
    if slug == "planet-enigma":
        return {
            "world": gs.get("world", "desert_island"),
            "mode": gs.get("mode", "solo"),
            "puzzle_index": gs.get("current_puzzle_index", 0),
            "vault": gs.get("vault", [])
        }
    if slug == "odyssey-mind":
        return {
            "realm": gs.get("realm", "synthesis"),
            "realm_type": gs.get("realm_type", "trial"),
            "difficulty_tier": gs.get("difficulty_tier", 1),
            "attributes": gs.get("attributes", {}),
            "abilities": gs.get("abilities", []),
            "character_level": gs.get("character_level", 1),
            "rank": gs.get("rank", "Wanderer")
        }
    if slug == "philosophy-arena":
        return {
            "tier": gs.get("tier", "agora"),
            "domain": gs.get("domain", "ethics"),
            "challenge_format": gs.get("challenge_format", "socratic_dialogue"),
            "philosophical_rank": gs.get("philosophical_rank", "Questioner"),
            "abilities": gs.get("abilities", []),
            "agora_vocabulary": gs.get("agora_vocabulary", []),
            "historical_witness_active": gs.get("historical_witness_active", False)
        }
    if slug == "appreciation-game":
        return {
            "opening_inventory": gs.get("opening_inventory", {})
        }
    if slug == "game-of-games":
        return {
            "mode": gs.get("mode", "discovery"),
            "scenario_index": gs.get("scenario_index", 0),
            "current_scenario": gs.get("current_scenario", {}),
            "choices": gs.get("choices", {}),
            "scores": gs.get("scores", {}),
            "decision_profile": gs.get("decision_profile", {})
        }
    if slug == "drift":
        return {
            "phase": gs.get("phase", "ROUND_1"),
            "players_state": gs.get("players_state", {}),
            "collective_answers": gs.get("collective_answers", {})
        }
    return {}


async def call_lumi_llm(session: dict, custom_instruction: str) -> dict:
    if not GROQ_API_KEY:
        # Fallback if no API key is present
        return get_fallback_lumi_response(session)

    players_list = [p["username"] for p in session["players"]]
    events = session.get("game_state", {}).get("session_events", []) if isinstance(session.get("game_state"), dict) else []
    extra_kwargs = _build_lumi_kwargs(session)
    system_prompt = get_lumi_system_prompt(session["game_slug"], session["mood"], players_list, events, **extra_kwargs)

    # Format the message history for Groq
    # Groq needs standard {"role": "system"/"user"/"assistant", "content": str}
    messages = [{"role": "system", "content": system_prompt}]

    for msg in session["messages"]:
        role = msg["role"]
        # Include sender prefix for clarity in history context
        sender = msg["sender"]
        content = f"[{sender}]: {msg['content']}" if sender != "Lumi" else msg["content"]
        messages.append({"role": role, "content": content})

    if not GROQ_API_KEY or GROQ_API_KEY.startswith("mock") or GROQ_API_KEY.startswith("your_groq"):
        return get_fallback_lumi_response(session)

    try:
        response = await groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            response_format={"type": "json_object"},
            max_tokens=1500,
            temperature=0.85
        )
        reply = response.choices[0].message.content
        if not reply:
            return get_fallback_lumi_response(session)

        # Parse JSON
        parsed = json.loads(reply)
        return parsed
    except Exception as e:
        logger.error(f"Error calling Groq for session {session['session_id']}: {e}")
        # Try a regex-based search for JSON if it returned wrapped text
        if "reply" in locals() and reply:
            try:
                match = re.search(r"\{.*\}", reply, re.DOTALL)
                if match:
                    return json.loads(match.group(0))
            except Exception:
                pass
        return get_fallback_lumi_response(session)

def get_fallback_lumi_response(session: dict) -> dict:
    slug = session.get("game_slug", "drift")

    if slug == "callout":
        return get_fallback_callout_response(session)

    players = [p["username"] for p in session["players"]]
    current_player = session.get("current_player_id") or (players[0] if players else "Player")

    try:
        current_idx = players.index(current_player)
        next_idx = (current_idx + 1) % len(players)
        next_player = players[next_idx]
    except Exception:
        next_player = players[0] if players else None

    round_val = session["current_round"]
    concluded = False
    drift_log = None

    if next_player == players[0] and len(players) > 1:
        round_val += 1
        if round_val > 5:
            concluded = True
            drift_log = f"A meaningful session with {', '.join(players)}."

    # Generic fallback works for all conversational new games
    return {
        "speech_text": f"Lumi is listening. Let's continue. {next_player}, your turn.",
        "next_player_id": next_player,
        "round": min(round_val, 5),
        "concluded": concluded,
        "drift_log": drift_log,
        "twist_offered": False,
        # New game fields (safe to include; frontend ignores unrecognised keys)
        "story_segment": None,
        "pressure_point": None,
        "pressure_point_player": None,
        "curveball_fired": False,
        "threadweave_reflection": None,
        "question": None,
        "terrain_badge_awarded": None,
        "horizon_map": None,
        "lumi_move": None,
        "release_prompt_sent": False,
        "unsaid_map": None,
        "curveball": None,
        "scores": None,
        "turncoat_bonus_awarded": None,
        "phase": "phase_1",
        "final_declarations": None,
        "scenario": None,
        "current_scenario_level": 0,
        "scoring_request": None,
        "scores_received": None,
        "perfect_swap_awarded": False,
        "curveball_used": False,
        "is_mirror_round": False,
        "swap_portraits": None,
    }


def _game_of_games_players(session: dict) -> list[str]:
    return [player["username"] for player in session.get("players", [])]


def _game_of_games_profile_template() -> dict:
    return {
        "cooperation_tendency": 0.5,
        "risk_tolerance": 0.5,
        "reciprocity": 0.5,
        "strategic_sophistication": 0.5,
        "consistency": 0.5,
        "archetype": "The Reciprocator",
        "scenarios_played": 0,
        "strategic_architect_unlocked": False,
    }


def _game_of_games_clean_profile(value: dict | None) -> dict | None:
    if not isinstance(value, dict):
        return None
    profile = _game_of_games_profile_template()
    for field in GAME_OF_GAMES_PROFILE_FIELDS:
        raw = value.get(field)
        if isinstance(raw, (int, float)):
            profile[field] = round(max(0, min(1, float(raw))), 2)
    raw_played = value.get("scenarios_played", value.get("_samples", 0))
    if isinstance(raw_played, (int, float)):
        profile["scenarios_played"] = max(0, int(raw_played))
        profile["_samples"] = max(0, int(raw_played))
    raw_samples = value.get("_samples")
    if isinstance(raw_samples, (int, float)):
        profile["_samples"] = max(profile.get("_samples", 0), int(raw_samples))
    if isinstance(value.get("archetype"), str) and value["archetype"].strip():
        profile["archetype"] = value["archetype"].strip()[:80]
    profile["strategic_architect_unlocked"] = bool(value.get("strategic_architect_unlocked")) or profile["archetype"] == "The Strategic Architect"
    return profile


def _game_of_games_public_scenario(scenario: dict) -> dict:
    return {
        "slug": scenario["slug"],
        "name": scenario["name"],
        "format": scenario["format"],
        "choices": scenario["choices"],
        "discovery_prompt": scenario["discovery_prompt"],
        "academy_prompt": scenario["academy_prompt"],
        "payoff_note": scenario["payoff_note"],
        "theory": scenario["theory"],
        "nash_equilibrium": scenario["nash_equilibrium"],
        "rounds": scenario.get("rounds", 1),
        "roles": scenario.get("roles", {}),
    }


def _game_of_games_choice_map(scenario: dict) -> dict[str, dict]:
    return {choice["key"]: choice for choice in scenario.get("choices", [])}


def _game_of_games_offer_value(choice: str) -> tuple[int, int]:
    if choice == "generous_offer":
        return (3, 7)
    if choice == "fair_offer":
        return (5, 5)
    if choice == "low_offer":
        return (8, 2)
    if choice == "generous_plan":
        return (4, 6)
    if choice == "minimal_plan":
        return (7, 3)
    if choice == "greedy_plan":
        return (9, 1)
    return (5, 5)


def _game_of_games_select_scenarios(pack: str, count: int, player_count: int) -> list[dict]:
    selected_pack = GAME_OF_GAMES_SCENARIO_PACKS.get(pack, GAME_OF_GAMES_SCENARIO_PACKS["foundations"])
    requested = [
        GAME_OF_GAMES_SCENARIOS_BY_SLUG[slug]
        for slug in selected_pack["scenario_slugs"]
        if slug in GAME_OF_GAMES_SCENARIOS_BY_SLUG
    ]
    playable = [
        scenario for scenario in requested
        if scenario["players"]["min"] <= player_count <= scenario["players"]["max"]
    ]
    for scenario in GAME_OF_GAMES_SCENARIOS:
        if len(playable) >= count:
            break
        if scenario in playable:
            continue
        if scenario["players"]["min"] <= player_count <= scenario["players"]["max"]:
            playable.append(scenario)
    return playable[: max(1, min(count, len(playable)))]


def _game_of_games_required_players(gs: dict, players: list[str]) -> list[str]:
    scenario = gs.get("current_scenario") or {}
    scenario_format = scenario.get("format")
    choices = gs.get("choices") or {}
    if not players:
        return []
    if scenario_format == "solo_decision":
        return players
    if scenario_format == "sequential_choice":
        if not choices:
            return [players[0]]
        return [players[1] if len(players) > 1 else players[0]]
    if scenario_format == "negotiation":
        if not choices:
            return [players[0]]
        crew = players[1:]
        return crew or [players[0]]
    return players


def _game_of_games_active_choices(gs: dict) -> list[dict]:
    scenario = gs.get("current_scenario") or {}
    choices = scenario.get("choices", [])
    scenario_format = scenario.get("format")
    submitted = gs.get("choices") or {}
    if scenario_format == "sequential_choice":
        if not submitted:
            return [choice for choice in choices if choice["key"].endswith("_offer") or choice["key"] in {"continue", "take"}]
        return [choice for choice in choices if choice["key"] in {"accept", "reject", "continue", "take"}]
    if scenario_format == "negotiation":
        if not submitted:
            return [choice for choice in choices if choice["key"].endswith("_plan")]
        return [choice for choice in choices if choice["key"] in {"accept", "reject", "counter"}]
    return choices


def _game_of_games_prepare_turn(gs: dict, players: list[str]) -> None:
    gs["required_players"] = _game_of_games_required_players(gs, players)
    gs["active_choices"] = _game_of_games_active_choices(gs)
    required = gs["required_players"]
    scenario_format = (gs.get("current_scenario") or {}).get("format")
    gs["timer_started_at"] = datetime.now(timezone.utc).isoformat()
    if scenario_format in {"sequential_choice", "negotiation"}:
        gs["active_role"] = "proposer" if not gs.get("choices") else "responder"
        gs["current_decision_label"] = "Proposal" if not gs.get("choices") else "Response"
    else:
        gs["active_role"] = "chooser"
        gs["current_decision_label"] = "Private choice"
    return None


def _game_of_games_intro_text(gs: dict) -> str:
    scenario = gs.get("current_scenario") or {}
    mode = gs.get("mode", "discovery")
    lead = scenario.get("discovery_prompt") if mode == "discovery" else scenario.get("academy_prompt")
    if mode == "academy":
        return (
            f"{scenario.get('name')} is on the table. {lead} "
            f"Equilibrium note: {scenario.get('nash_equilibrium')}. Choose your move."
        )
    return f"{lead} Choose before Lumi names the theory."


def _game_of_games_choice_label(scenario: dict, choice_key: str) -> str:
    choice = _game_of_games_choice_map(scenario).get(choice_key)
    return choice["label"] if choice else choice_key.replace("_", " ").title()


def _game_of_games_score_pd(choices: dict, players: list[str]) -> dict[str, int]:
    deltas = {}
    cooperate_count = list(choices.values()).count("cooperate")
    for player in players:
        choice = choices.get(player)
        if len(players) == 2:
            other = next((p for p in players if p != player), player)
            other_choice = choices.get(other)
            if choice == "cooperate" and other_choice == "cooperate":
                deltas[player] = 3
            elif choice == "defect" and other_choice == "cooperate":
                deltas[player] = 5
            elif choice == "cooperate" and other_choice == "defect":
                deltas[player] = 0
            else:
                deltas[player] = 1
        else:
            deltas[player] = 2 + cooperate_count if choice == "cooperate" else (3 if cooperate_count else 1)
    return deltas


def _game_of_games_evaluate(gs: dict, players: list[str]) -> dict:
    scenario = gs.get("current_scenario") or {}
    slug = scenario.get("slug")
    choices = gs.get("choices") or {}
    deltas = {player: 0 for player in players}
    outcome = "The room made its choices."
    optimal = "Compare your payoff with the equilibrium and the collective payoff."
    nash_observed = False

    if slug in {"prisoners-dilemma", "repeated-prisoners-dilemma"}:
        deltas = _game_of_games_score_pd(choices, players)
        coop_count = list(choices.values()).count("cooperate")
        nash_observed = coop_count == 0
        outcome = f"{coop_count} chose cooperation; {len(players) - coop_count} chose defection."
        optimal = "Mutual cooperation creates the best shared result; unilateral defection creates the strongest one-shot temptation."
    elif slug == "stag-hunt":
        stag_count = list(choices.values()).count("stag")
        threshold = len(players)
        for player in players:
            if choices.get(player) == "stag":
                deltas[player] = 4 if stag_count >= threshold else 0
            else:
                deltas[player] = 2
        nash_observed = stag_count in {0, len(players)}
        outcome = f"{stag_count} committed to the stag."
        optimal = "The best shared outcome needs everyone to trust the coordinated hunt."
    elif slug == "chicken":
        straight_count = list(choices.values()).count("straight")
        for player in players:
            choice = choices.get(player)
            if straight_count > 1:
                deltas[player] = -2 if choice == "straight" else 0
            elif straight_count == 1:
                deltas[player] = 4 if choice == "straight" else 1
            else:
                deltas[player] = 2
        nash_observed = straight_count == 1
        outcome = f"{straight_count} stayed straight."
        optimal = "Chicken rewards controlled asymmetry and punishes mutual escalation."
    elif slug == "tragedy-of-commons":
        exploit_count = list(choices.values()).count("exploit")
        for player in players:
            if exploit_count == 0:
                deltas[player] = 3
            elif exploit_count <= len(players) / 2:
                deltas[player] = 4 if choices.get(player) == "exploit" else 2
            else:
                deltas[player] = 1 if choices.get(player) == "exploit" else 0
        nash_observed = exploit_count > len(players) / 2
        outcome = f"{exploit_count} exploited the commons."
        optimal = "The commons survives when conservation becomes enforceable or expected."
    elif slug == "ultimatum-game":
        proposer = players[0]
        responder = players[1] if len(players) > 1 else players[0]
        offer = choices.get(proposer, "fair_offer")
        response = choices.get(responder, "accept")
        proposer_share, responder_share = _game_of_games_offer_value(offer)
        if response == "accept":
            deltas[proposer] = proposer_share
            deltas[responder] = responder_share
        nash_observed = offer == "low_offer" and response == "accept"
        outcome = f"{proposer} proposed {_game_of_games_choice_label(scenario, offer)}; {responder} chose {response}."
        optimal = "Fair offers often earn acceptance even when low offers look rational on paper."
    elif slug == "dictator-game":
        for player in players:
            choice = choices.get(player)
            deltas[player] = {"keep_all": 5, "split_evenly": 3, "give_more": 2}.get(choice, 3)
        nash_observed = all(choice == "keep_all" for choice in choices.values())
        outcome = "Each player made an unconstrained allocation."
        optimal = "The material optimum is selfish; the social signal is revealed by voluntary giving."
    elif slug == "public-goods-game":
        contributors = [player for player, choice in choices.items() if choice == "contribute"]
        shared_return = (len(contributors) * 4) // max(1, len(players))
        for player in players:
            deltas[player] = shared_return + (2 if choices.get(player) == "free_ride" else 0)
        nash_observed = len(contributors) == 0
        outcome = f"{len(contributors)} contributed to the public good."
        optimal = "Broad contribution maximizes the group, but free-riding exploits contributors."
    elif slug == "centipede-game":
        opener = players[0]
        closer = players[1] if len(players) > 1 else players[0]
        first = choices.get(opener)
        second = choices.get(closer)
        if first == "take":
            deltas[opener], deltas[closer] = 3, 1
        elif second == "take":
            deltas[opener], deltas[closer] = 2, 4
        else:
            deltas[opener], deltas[closer] = 4, 4
        nash_observed = first == "take"
        outcome = f"{opener} chose {first}; {closer} chose {second or 'continue'}."
        optimal = "Continuing grows the pot, but backward induction pressures players to stop early."
    elif slug == "battle-of-the-sexes":
        counts = {choice: list(choices.values()).count(choice) for choice in {"option_a", "option_b"}}
        majority = max(counts, key=counts.get)
        tie = counts["option_a"] == counts["option_b"]
        for player in players:
            deltas[player] = 2 if tie else (3 if choices.get(player) == majority else 0)
        nash_observed = not tie and max(counts.values()) == len(players)
        outcome = f"Option A drew {counts['option_a']}; Option B drew {counts['option_b']}."
        optimal = "Coordination matters more than winning your favorite plan."
    elif slug == "volunteers-dilemma":
        volunteers = [player for player, choice in choices.items() if choice == "volunteer"]
        for player in players:
            if not volunteers:
                deltas[player] = -1
            elif choices.get(player) == "volunteer":
                deltas[player] = 2
            else:
                deltas[player] = 4 if len(volunteers) == 1 else 3
        nash_observed = len(volunteers) == 1
        outcome = f"{len(volunteers)} volunteered."
        optimal = "One volunteer is enough; everyone waiting is the failure state."
    elif slug == "newcombs-problem":
        for player in players:
            deltas[player] = 5 if choices.get(player) == "one_box" else 1
        nash_observed = False
        outcome = "Players revealed whether they trusted the predictor or causal dominance."
        optimal = "There is no settled winner here; the result exposes decision-theory allegiance."
    elif slug == "el-farol-bar-problem":
        goers = [player for player, choice in choices.items() if choice == "go"]
        capacity = max(1, int(len(players) * 0.6))
        for player in players:
            if choices.get(player) == "go":
                deltas[player] = 4 if len(goers) <= capacity else 0
            else:
                deltas[player] = 2
        nash_observed = len(goers) == capacity
        outcome = f"{len(goers)} went to the bar; comfort capacity was {capacity}."
        optimal = "The strongest move depends on predicting the crowd, not the bar."
    elif slug == "pirate-game":
        captain = players[0]
        crew = players[1:] or [captain]
        plan = choices.get(captain, "minimal_plan")
        accepts = sum(1 for player in crew if choices.get(player) == "accept")
        rejections = len(crew) - accepts
        accepted = accepts >= max(1, rejections)
        captain_share, crew_share = _game_of_games_offer_value(plan)
        if accepted:
            deltas[captain] = captain_share
            for player in crew:
                deltas[player] = crew_share // max(1, len(crew))
        else:
            deltas = {player: 0 for player in players}
        nash_observed = plan == "minimal_plan" and accepted
        outcome = f"The captain proposed {_game_of_games_choice_label(scenario, plan)}. Accept votes: {accepts}; resistance: {rejections}."
        optimal = "A minimal winning coalition can beat a fair-looking but strategically wasteful split."
    elif slug == "schelling-point":
        counts = {}
        for choice in choices.values():
            counts[choice] = counts.get(choice, 0) + 1
        top = max(counts.values()) if counts else 0
        winners = [choice for choice, count in counts.items() if count == top]
        for player in players:
            deltas[player] = 4 if len(winners) == 1 and choices.get(player) == winners[0] else 1
        nash_observed = len(winners) == 1 and top == len(players)
        outcome = f"The focal cluster was {', '.join(winners) if winners else 'unclear'}."
        optimal = "The best answer is the one you expect everyone else to expect."

    return {
        "scenario": scenario.get("name"),
        "choices": choices.copy(),
        "scores_delta": deltas,
        "outcome": outcome,
        "optimal_alternative": optimal,
        "nash_equilibrium": scenario.get("nash_equilibrium"),
        "nash_observed": nash_observed,
        "theory": scenario.get("theory"),
    }


def _game_of_games_signal_for_choice(scenario_slug: str, choice: str, previous_choice: str | None = None) -> dict[str, float]:
    cooperative = {
        "cooperate", "stag", "conserve", "contribute", "generous_offer", "fair_offer",
        "split_evenly", "give_more", "volunteer", "accept", "generous_plan", "obvious",
    }
    risky = {
        "defect", "straight", "exploit", "low_offer", "keep_all", "take",
        "two_box", "go", "clever", "greedy_plan",
    }
    strategic = {
        "defect", "hare", "swerve", "low_offer", "accept", "free_ride", "take",
        "wait", "two_box", "stay_home", "minimal_plan", "obvious",
    }
    reciprocity = 0.65 if choice in {"accept", "cooperate", "contribute", "continue"} else 0.4
    if previous_choice:
        reciprocity = 0.8 if choice == previous_choice else 0.45
    if scenario_slug == "newcombs-problem":
        strategic_value = 0.65
    else:
        strategic_value = 0.75 if choice in strategic else 0.45
    return {
        "cooperation_tendency": 0.8 if choice in cooperative else 0.25,
        "risk_tolerance": 0.8 if choice in risky else 0.35,
        "reciprocity": reciprocity,
        "strategic_sophistication": strategic_value,
        "consistency": 0.75 if previous_choice == choice else (0.55 if previous_choice else 0.5),
    }


def _game_of_games_archetype(profile: dict) -> str:
    cooperation = profile.get("cooperation_tendency", 0.5)
    risk = profile.get("risk_tolerance", 0.5)
    reciprocity = profile.get("reciprocity", 0.5)
    sophistication = profile.get("strategic_sophistication", 0.5)
    consistency = profile.get("consistency", 0.5)
    if profile.get("scenarios_played", 0) >= 3 and sophistication >= 0.78 and consistency >= 0.7:
        return "The Strategic Architect"
    if sophistication >= 0.72:
        return "The Strategist"
    if reciprocity >= 0.7:
        return "The Reciprocator"
    if cooperation >= 0.7:
        return "The Cooperator"
    if cooperation <= 0.35 and risk >= 0.6:
        return "The Defector"
    if risk >= 0.72:
        return "The Risk-Seeker"
    if consistency >= 0.72:
        return "The Minimaxer"
    return "The Irrational Rational"


def _game_of_games_update_profiles(gs: dict, players: list[str]) -> None:
    scenario = gs.get("current_scenario") or {}
    choices = gs.get("choices") or {}
    profiles = gs.setdefault("decision_profile", {})
    last_choices = gs.setdefault("last_choices", {})
    for player in players:
        if player not in choices:
            continue
        profile = profiles.setdefault(player, _game_of_games_profile_template())
        samples = profile.setdefault("_samples", 0)
        signals = _game_of_games_signal_for_choice(scenario.get("slug", ""), choices[player], last_choices.get(player))
        next_samples = samples + 1
        for field, value in signals.items():
            profile[field] = round(((profile.get(field, 0.5) * samples) + value) / next_samples, 2)
        profile["_samples"] = next_samples
        profile["scenarios_played"] = profile.get("scenarios_played", 0) + 1
        profile["archetype"] = _game_of_games_archetype(profile)
        profile["strategic_architect_unlocked"] = profile["archetype"] == "The Strategic Architect"
        last_choices[player] = choices[player]


def _game_of_games_advance_to_next(session: dict) -> bool:
    gs = session.get("game_state") or {}
    players = _game_of_games_players(session)
    order = gs.get("scenario_order") or []
    next_index = gs.get("scenario_index", 0) + 1
    if next_index >= len(order):
        session["status"] = "COMPLETED"
        session["concluded"] = True
        session["current_player_id"] = None
        gs["phase"] = "COMPLETED"
        session["drift_log"] = json.dumps(gs.get("decision_profile", {}), default=str)
        return False

    gs["phase"] = "CHOOSING"
    gs["scenario_index"] = next_index
    gs["current_scenario"] = _game_of_games_public_scenario(GAME_OF_GAMES_SCENARIOS_BY_SLUG[order[next_index]])
    gs["choices"] = {}
    gs["revealed_choices"] = {}
    gs["payoff_result"] = None
    gs["round_tracker"] = []
    _game_of_games_prepare_turn(gs, players)
    session["current_player_id"] = gs["required_players"][0] if len(gs["required_players"]) == 1 else "ALL"
    gs["session_events"].append(f"Scenario {next_index + 1}: {gs['current_scenario']['name']} opened.")
    session["messages"].append({"role": "assistant", "sender": "Lumi", "content": _game_of_games_intro_text(gs)})
    return True


async def _start_game_of_games_session(session: dict, session_id: str) -> None:
    gs = session.get("game_state") or {}
    players = _game_of_games_players(session)
    count = int(gs.get("scenario_count") or GAME_OF_GAMES_DEFAULT_SCENARIO_COUNT)
    pack = gs.get("scenario_pack", "foundations")
    scenarios = _game_of_games_select_scenarios(pack, count, len(players))
    gs["phase"] = "CHOOSING"
    gs["scores"] = {player: 0 for player in players}
    seeds = gs.get("profile_seeds") or {}
    gs["decision_profile"] = {
        player: _game_of_games_clean_profile(seeds.get(player)) or _game_of_games_profile_template()
        for player in players
    }
    gs["scenario_index"] = 0
    gs["scenario_order"] = [scenario["slug"] for scenario in scenarios]
    gs["current_scenario"] = _game_of_games_public_scenario(scenarios[0])
    gs["choices"] = {}
    gs["revealed_choices"] = {}
    gs["payoff_result"] = None
    gs["round_tracker"] = []
    gs["scenario_history"] = []
    gs["timer_seconds"] = GAME_OF_GAMES_DEFAULT_TIMER_SECONDS
    gs["session_events"].append(
        f"The Game of Games started in {gs.get('mode', 'discovery')} mode with {GAME_OF_GAMES_SCENARIO_PACKS.get(pack, {}).get('label', 'Foundations')}."
    )
    _game_of_games_prepare_turn(gs, players)
    session["current_player_id"] = gs["required_players"][0] if len(gs["required_players"]) == 1 else "ALL"
    session["messages"].append({"role": "assistant", "sender": "Lumi", "content": _game_of_games_intro_text(gs)})
    await manager.broadcast(session_id, {"type": "game_state", "payload": session})


async def _handle_game_of_games_choice(session: dict, session_id: str, username: str, msg_data: dict, websocket: WebSocket) -> None:
    gs = session.get("game_state") or {}
    if gs.get("phase") != "CHOOSING":
        await websocket.send_json({"type": "error", "message": "Choices are not open right now."})
        return

    players = _game_of_games_players(session)
    required = gs.get("required_players") or _game_of_games_required_players(gs, players)
    if username not in required:
        await websocket.send_json({"type": "error", "message": "It is not your decision window."})
        return

    choice_key = msg_data.get("choice") or msg_data.get("text", "")
    choice_key = str(choice_key).strip()
    active_choice_keys = {choice["key"] for choice in gs.get("active_choices", [])}
    if choice_key not in active_choice_keys:
        await websocket.send_json({"type": "error", "message": "Choose one of the available strategic moves."})
        return

    if username in gs.get("choices", {}):
        await websocket.send_json({"type": "error", "message": "Your choice is already sealed."})
        return

    scenario = gs.get("current_scenario") or {}
    gs.setdefault("choices", {})[username] = choice_key
    gs["session_events"].append(f"{username} sealed a Game of Games choice.")
    session["messages"].append({"role": "user", "sender": username, "content": "Choice sealed."})

    submitted_required = all(player in gs["choices"] for player in required)
    scenario_format = scenario.get("format")
    if not submitted_required:
        await manager.broadcast(session_id, {"type": "game_state", "payload": session})
        return

    if scenario_format in {"sequential_choice", "negotiation"}:
        next_required = _game_of_games_required_players(gs, players)
        if any(player not in gs["choices"] for player in next_required):
            _game_of_games_prepare_turn(gs, players)
            session["current_player_id"] = gs["required_players"][0] if len(gs["required_players"]) == 1 else "ALL"
            first_actor = username
            first_choice = _game_of_games_choice_label(scenario, choice_key)
            session["messages"].append({
                "role": "assistant",
                "sender": "Lumi",
                "content": f"{first_actor}'s move is visible: {first_choice}. The response window is open.",
            })
            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
            return

    result = _game_of_games_evaluate(gs, players)
    for player, delta in result["scores_delta"].items():
        gs.setdefault("scores", {})[player] = gs.get("scores", {}).get(player, 0) + int(delta)
    _game_of_games_update_profiles(gs, players)

    if scenario_format == "multi_round":
        tracker = gs.setdefault("round_tracker", [])
        tracker.append(result)
        current_round = len(tracker)
        total_rounds = int(scenario.get("rounds", 5))
        if current_round < total_rounds:
            gs["choices"] = {}
            gs["revealed_choices"] = {}
            gs["payoff_result"] = result
            _game_of_games_prepare_turn(gs, players)
            session["current_player_id"] = "ALL"
            session["messages"].append({
                "role": "assistant",
                "sender": "Lumi",
                "content": f"Round {current_round} resolved: {result['outcome']} Round {current_round + 1} is open.",
            })
            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
            return

    gs["phase"] = "REVEAL"
    gs["revealed_choices"] = gs.get("choices", {}).copy()
    gs["payoff_result"] = result
    gs.setdefault("scenario_history", []).append(result)
    session["current_player_id"] = None
    session["messages"].append({
        "role": "assistant",
        "sender": "Lumi",
        "content": (
            f"Payoff reveal: {result['outcome']} {result['optimal_alternative']} "
            f"Theory: {result['theory']}"
        ),
    })
    await manager.broadcast(session_id, {"type": "game_state", "payload": session})


async def _advance_game_of_games(session: dict, session_id: str, username: str, websocket: WebSocket) -> None:
    if not session.get("players") or session["players"][0]["username"] != username:
        await websocket.send_json({"type": "error", "message": "Only the host can advance Game of Games."})
        return
    gs = session.get("game_state") or {}
    if gs.get("phase") not in {"REVEAL"}:
        await websocket.send_json({"type": "error", "message": "There is no completed reveal to advance."})
        return
    _game_of_games_advance_to_next(session)
    await manager.broadcast(session_id, {"type": "game_state", "payload": session})


def _unsaid_player_count_error(mode: str, player_count: int) -> Optional[str]:
    requirements = {
        "solo": (1, 1, "Solo requires exactly one player."),
        "face_to_face": (2, 2, "Face to Face requires exactly two players."),
        "group": (3, 6, "The Room requires three to six players."),
    }
    minimum, maximum, message = requirements.get(mode, requirements["solo"])
    return None if minimum <= player_count <= maximum else message


def _unsaid_opening(mode: str) -> str:
    if mode == "solo":
        return "What have you been carrying that you haven't put down yet?"
    return (
        "What's something you've wanted to say to someone in this room — or someone in your life — "
        "that you haven't said yet? You don't have to say what it is. Just notice that it's there."
    )


def _unsaid_release_invitation() -> str:
    return (
        "We can stop digging here. Choose the sentence that meets this moment. "
        "Your completion is private unless you explicitly choose to share it."
    )


def _unsaid_allowed_moves(game_state: dict) -> set[str]:
    moves = {"draw", "hold", "witness"}
    if game_state.get("depth_level") in {"current", "bedrock"}:
        moves.update({"dig", "redirect"})
    if game_state.get("mode") != "solo":
        moves.add("bridge")
    return moves


def _unsaid_map_fallback(player: str, release: dict) -> dict:
    text = release.get("text", "") if isinstance(release, dict) else ""
    return {
        "summary": "Something that had been carried was finally given words.",
        "specific_moment": "The Release",
        "shift": "From holding it alone to letting it be witnessed.",
        "quote": text[:240],
        "open_question": "What feels different now that this has been said?",
    }


def _valid_unsaid_map(value: object) -> bool:
    required = {"summary", "specific_moment", "shift", "quote", "open_question"}
    return isinstance(value, dict) and required.issubset(value.keys())


def _normalize_unsaid_map(value: object, fallback: dict, *, quote: Optional[str] = None, names: tuple[str, ...] = ()) -> dict:
    source = value if _valid_unsaid_map(value) else fallback
    normalized = {}
    for key in ("summary", "specific_moment", "shift", "quote", "open_question"):
        text = str(source.get(key) or fallback[key]).strip()[:1000]
        for name in names:
            text = re.sub(re.escape(name), "someone in the room", text, flags=re.IGNORECASE)
        normalized[key] = text
    if quote is not None:
        normalized["quote"] = quote.strip()[:240]
    return normalized


async def _unsaid_lumi_turn(session: dict, session_id: str, instruction: str, fallback: str) -> dict:
    await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
    response = await call_lumi_llm(session, instruction)
    await manager.broadcast(session_id, {"type": "host_typing", "payload": False})
    if not isinstance(response, dict):
        response = {}
    response["speech_text"] = str(response.get("speech_text") or fallback).strip()[:2000]
    return response


async def _start_unsaid_session(session: dict, session_id: str) -> None:
    gs = session["game_state"]
    players = [player["username"] for player in session["players"]]
    gs.update({
        "phase": "OPENING",
        "depth_level": "surface",
        "opening_answers": {},
        "turns_at_depth": 0,
        "depth_votes": {},
        "release_sentences": {},
        "individual_maps": {},
        "shared_map": None,
        "last_lumi_move": "hold",
        "paused": False,
        "paused_by": None,
        "stopped": False,
    })
    gs["session_events"] = ["The Unsaid session started."]
    session["status"] = "ACTIVE"
    session["current_round"] = 1
    session["current_player_id"] = players[0]
    opening = _unsaid_opening(gs.get("mode", "solo"))
    session["messages"].append({"role": "assistant", "sender": "Lumi", "content": opening})
    await manager.broadcast(session_id, {"type": "game_state", "payload": session})


async def _begin_unsaid_conversation(session: dict, session_id: str) -> None:
    gs = session["game_state"]
    players = [player["username"] for player in session["players"]]
    gs["phase"] = "CONVERSATION"
    gs["turns_at_depth"] = 0
    gs["depth_votes"] = {}
    session["current_player_id"] = players[0]
    terrain = gs.get("terrain", "hard_thing").replace("_", " ")
    depth = gs.get("depth_level", "surface")
    response = await _unsaid_lumi_turn(
        session,
        session_id,
        (
            f"Begin a {depth}-depth conversation in the {terrain} terrain. Address {players[0]}. "
            "Use one of the six Lumi moves and ask one spacious, specific question. "
            "Do not announce game mechanics or suggest going deeper."
        ),
        f"{players[0]}, what feels ready to be said first?",
    )
    move = response.get("lumi_move")
    gs["last_lumi_move"] = move if move in _unsaid_allowed_moves(gs) else "draw"
    session["messages"].append({"role": "assistant", "sender": "Lumi", "content": response["speech_text"]})
    await manager.broadcast(session_id, {"type": "game_state", "payload": session})


async def _complete_unsaid_release(session: dict, session_id: str) -> None:
    gs = session["game_state"]
    releases = gs["release_sentences"]
    players = [player["username"] for player in session["players"]]
    await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
    individual_responses = await asyncio.gather(*(
        call_lumi_llm(
            session,
            (
                f"Create one private individual Unsaid Map for {player}, using only this player's Release below. "
                "Return individual_maps with only that exact username. Include summary, specific_moment, shift, quote, "
                "and open_question. Stay precise; do not diagnose, prescribe, or introduce another person's private words. "
                f"Private Release: {releases[player]['starter']} {releases[player]['text']}"
            ),
        )
        for player in players
    ))
    shared_response = None
    if len(players) > 1:
        shared_response = await call_lumi_llm(
            session,
            (
                "Using only the public conversation history, create a non-attributed shared Unsaid Map. Do not use, infer, "
                "or quote any private Release sentence. Return shared_map with summary, specific_moment, shift, quote, "
                "and open_question. Do not name any player."
            ),
        )
    await manager.broadcast(session_id, {"type": "host_typing", "payload": False})

    individual_maps = {}
    for player, response in zip(players, individual_responses):
        generated = response.get("individual_maps") if isinstance(response, dict) else None
        candidate = generated.get(player) if isinstance(generated, dict) else None
        fallback = _unsaid_map_fallback(player, releases[player])
        individual_maps[player] = _normalize_unsaid_map(
            candidate,
            fallback,
            quote=releases[player]["text"],
        )
    gs["individual_maps"] = individual_maps

    if len(players) > 1:
        shared_candidate = shared_response.get("shared_map") if isinstance(shared_response, dict) else None
        shared_fallback = {
            "summary": "The room made space for words that had been held back.",
            "specific_moment": "The shared Release",
            "shift": "From private weight to mutual witness.",
            "quote": "What was shared remains held without attribution.",
            "open_question": "What kind of honesty does this room want to protect next?",
        }
        gs["shared_map"] = _normalize_unsaid_map(
            shared_candidate,
            shared_fallback,
            quote=shared_fallback["quote"],
            names=tuple(players),
        )

    for player in players:
        release = releases[player]
        if release.get("share"):
            session["messages"].append({
                "role": "user",
                "sender": player,
                "content": f"{release['starter']} {release['text']}",
            })

    gs["phase"] = "COMPLETED"
    session["status"] = "COMPLETED"
    session["concluded"] = True
    session["current_player_id"] = None
    session["messages"].append({
        "role": "assistant",
        "sender": "Lumi",
        "content": "What needed to be said has been witnessed. Nothing more is required of you tonight.",
    })
    await manager.broadcast(session_id, {"type": "game_state", "payload": session})


async def _handle_unsaid_action(
    session: dict,
    session_id: str,
    username: str,
    websocket: WebSocket,
    msg_type: str,
    msg_data: dict,
) -> None:
    gs = session.get("game_state") or {}
    players = [player["username"] for player in session["players"]]
    host = players[0] if players else None

    if username not in players:
        await websocket.send_json({"type": "error", "message": "You are not a participant in this room."})
        return

    if session["status"] != "ACTIVE":
        await websocket.send_json({"type": "error", "message": "The session is not active."})
        return

    if msg_type == "pause_game":
        if gs.get("paused"):
            return
        gs["paused"] = True
        gs["paused_by"] = username
        session["messages"].append({"role": "system", "sender": "System", "content": "The room is paused. Nothing needs to happen next."})
        await manager.broadcast(session_id, {"type": "game_state", "payload": session})
        return

    if msg_type == "resume_game":
        if not gs.get("paused"):
            return
        if username not in {host, gs.get("paused_by")}:
            await websocket.send_json({"type": "error", "message": "Only the person who paused or the host can resume."})
            return
        gs["paused"] = False
        gs["paused_by"] = None
        session["messages"].append({"role": "system", "sender": "System", "content": "The room has resumed gently."})
        await manager.broadcast(session_id, {"type": "game_state", "payload": session})
        return

    if msg_type == "stop_game":
        gs["phase"] = "STOPPED"
        gs["stopped"] = True
        gs["paused"] = False
        session["status"] = "COMPLETED"
        session["concluded"] = True
        session["current_player_id"] = None
        session["messages"].append({
            "role": "assistant",
            "sender": "Lumi",
            "content": "We are stopping here. You do not need to explain, resolve, or complete anything.",
        })
        await manager.broadcast(session_id, {"type": "game_state", "payload": session})
        return

    if gs.get("paused"):
        await websocket.send_json({"type": "error", "message": "The room is paused."})
        return

    if msg_type == "submit_depth_choice":
        if gs.get("phase") != "DEPTH_CHECK":
            await websocket.send_json({"type": "error", "message": "There is no depth check right now."})
            return
        choice = msg_data.get("choice")
        allowed = {"stay", "release"}
        if gs.get("depth_level") != "bedrock":
            allowed.add("deeper")
        if choice not in allowed:
            await websocket.send_json({"type": "error", "message": "Invalid depth choice."})
            return
        gs["depth_votes"][username] = choice
        if not all(player in gs["depth_votes"] for player in players):
            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
            return

        votes = list(gs["depth_votes"].values())
        if "release" in votes:
            gs["phase"] = "RELEASE"
            gs["depth_votes"] = {}
            session["current_player_id"] = None
            session["messages"].append({"role": "assistant", "sender": "Lumi", "content": _unsaid_release_invitation()})
            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
            return

        if votes and all(vote == "deeper" for vote in votes):
            current_index = UNSAID_DEPTHS.index(gs.get("depth_level", "surface"))
            if current_index < len(UNSAID_DEPTHS) - 1:
                gs["depth_level"] = UNSAID_DEPTHS[current_index + 1]
                session["current_round"] = current_index + 2
        await _begin_unsaid_conversation(session, session_id)
        return

    if msg_type == "submit_release_sentence":
        if gs.get("phase") != "RELEASE":
            await websocket.send_json({"type": "error", "message": "The Release is not active."})
            return
        starter = str(msg_data.get("starter", "")).strip()
        sentence = str(msg_data.get("text", "")).strip()
        if starter not in UNSAID_RELEASE_STARTERS:
            await websocket.send_json({"type": "error", "message": "Choose one of the four Release starters."})
            return
        if not sentence or len(sentence) > 2000:
            await websocket.send_json({"type": "error", "message": "Release text must be between 1 and 2000 characters."})
            return
        gs["release_sentences"][username] = {
            "starter": starter,
            "text": sentence,
            "share": bool(msg_data.get("share", False)),
        }
        gs["session_events"].append(f"{username} completed the private Release.")
        if all(player in gs["release_sentences"] for player in players):
            await _complete_unsaid_release(session, session_id)
        else:
            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
        return

    if msg_type not in {"submit_answer", "pass_turn"}:
        await websocket.send_json({"type": "error", "message": "Unsupported action for The Unsaid."})
        return
    if gs.get("phase") not in {"OPENING", "CONVERSATION"}:
        await websocket.send_json({"type": "error", "message": "The room is not accepting responses right now."})
        return
    if session.get("current_player_id") != username:
        await websocket.send_json({"type": "error", "message": "It is not your turn."})
        return

    is_pass = msg_type == "pass_turn"
    answer = str(msg_data.get("text", "")).strip()
    if not is_pass and (not answer or len(answer) > 4000):
        await websocket.send_json({"type": "error", "message": "Response must be between 1 and 4000 characters."})
        return
    session["messages"].append({
        "role": "system" if is_pass else "user",
        "sender": "System" if is_pass else username,
        "content": f"{username} passed without explanation." if is_pass else answer,
    })
    gs["session_events"].append(f"{username} {'passed' if is_pass else 'responded'}.")

    if gs["phase"] == "OPENING":
        gs["opening_answers"][username] = "[Passed]" if is_pass else answer
        remaining = [player for player in players if player not in gs["opening_answers"]]
        if remaining:
            session["current_player_id"] = remaining[0]
            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
        else:
            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
            await _begin_unsaid_conversation(session, session_id)
        return

    gs["turns_at_depth"] += 1
    next_index = (players.index(username) + 1) % len(players)
    next_player = players[next_index]
    gate_after_turn = gs["turns_at_depth"] >= len(players)
    if is_pass:
        response = {"speech_text": "We can leave that unsaid. No explanation is needed.", "lumi_move": "hold"}
    else:
        response = await _unsaid_lumi_turn(
            session,
            session_id,
            (
                f"Witness {username}'s response at {gs.get('depth_level', 'surface')} depth. "
                f"Make exactly one appropriate move. {'Do not ask another question; the server is opening a consent gate.' if gate_after_turn else f'Address {next_player} with one related, spacious question.'} "
                "Never diagnose, prescribe, demand disclosure, or decide the phase."
            ),
            "I hear what you have put into the room.",
        )
    move = response.get("lumi_move")
    gs["last_lumi_move"] = move if move in _unsaid_allowed_moves(gs) else "witness"
    session["messages"].append({"role": "assistant", "sender": "Lumi", "content": response["speech_text"]})
    if gate_after_turn:
        gs["phase"] = "DEPTH_CHECK"
        gs["depth_votes"] = {}
        session["current_player_id"] = None
        session["messages"].append({
            "role": "assistant",
            "sender": "Lumi",
            "content": "Would you like to stay here, move one layer deeper together, or begin the Release?",
        })
    else:
        session["current_player_id"] = next_player
    await manager.broadcast(session_id, {"type": "game_state", "payload": session})


def _letters_age_self(value: object) -> Optional[dict]:
    if isinstance(value, bool):
        return None
    try:
        age = int(value)
    except (TypeError, ValueError):
        return None
    if not 6 <= age <= 90:
        return None
    for anchor, minimum, maximum, label in LETTERS_ANCHORS:
        if minimum <= age <= maximum:
            return {"age": age, "anchor": anchor, "label": f"{label} · age {age}"}
    return None


def _letters_selected_ages(mode: str, value: object) -> Optional[list[dict]]:
    if not isinstance(value, list):
        return None
    ages = [_letters_age_self(item.get("age") if isinstance(item, dict) else item) for item in value]
    if any(item is None for item in ages):
        return None
    exact_ages = [item["age"] for item in ages]
    if len(exact_ages) != len(set(exact_ages)):
        return None
    limits = {"letter": (1, 2), "conversation": (1, 1), "council": (2, 6)}
    minimum, maximum = limits.get(mode, (0, 0))
    return ages if minimum <= len(ages) <= maximum else None


def _letters_history(value: object) -> list[dict]:
    if not isinstance(value, list):
        return []
    cleaned = []
    valid_anchors = {anchor for anchor, *_ in LETTERS_ANCHORS}
    for item in value[-12:]:
        if not isinstance(item, dict):
            continue
        entry_id = str(item.get("entry_id", "")).strip()[:80]
        if not entry_id:
            continue
        anchors = item.get("anchors") if isinstance(item.get("anchors"), list) else []
        cleaned.append({
            "entry_id": entry_id,
            "completed_at": str(item.get("completed_at", ""))[:40],
            "mode": str(item.get("mode", ""))[:24],
            "ages": [int(age) for age in item.get("ages", []) if isinstance(age, (int, float)) and 6 <= int(age) <= 90][:6],
            "anchors": [anchor for anchor in anchors if anchor in valid_anchors][:6],
            "compass": str(item.get("compass", ""))[:800],
            "summary": str(item.get("summary", ""))[:1200],
            "shift": str(item.get("shift", ""))[:800],
            "open_question": str(item.get("open_question", ""))[:800],
        })
    return cleaned


def _letters_return_id(response: dict, history: list[dict]) -> Optional[str]:
    proposed = response.get("return_entry_id")
    valid_ids = {entry["entry_id"] for entry in history}
    return proposed if proposed in valid_ids else None


async def _letters_lumi(session: dict, session_id: str, instruction: str, fallback: str) -> dict:
    await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
    response = await call_lumi_llm(session, instruction)
    await manager.broadcast(session_id, {"type": "host_typing", "payload": False})
    if not isinstance(response, dict):
        response = {}
    response["speech_text"] = str(response.get("speech_text") or fallback).strip()[:3000]
    return response


def _letters_add_message(session: dict, sender: str, content: str, role: str = "assistant") -> None:
    session["messages"].append({"role": role, "sender": sender, "content": content})


async def _start_letters_session(session: dict, session_id: str) -> None:
    gs = session["game_state"]
    gs.update({
        "phase": "COMPASS", "compass": None, "occasion": None,
        "history_snapshot": [], "return_match": None, "intake_question": None,
        "intake_answers": [], "intake_index": 0, "letter_sections": [],
            "letter_moves": [], "dialogue_turns": [], "council_turns": [],
            "interaction_count": 0,
        "table_log": None, "assembled_letter": None, "paused": False,
        "full_table_achieved": False, "newly_visited_anchors": [],
        "session_events": ["The Long Table was opened."],
    })
    session["status"] = "ACTIVE"
    session["current_round"] = 1
    session["current_player_id"] = session["players"][0]["username"]
    session["messages"] = []
    _letters_add_message(
        session,
        "Lumi",
        "The table is ready. What are you bringing tonight—a question, a decision, or something you are trying to understand?",
    )
    await manager.broadcast(session_id, {"type": "game_state", "payload": session})


async def _letters_begin_voice(session: dict, session_id: str) -> None:
    gs = session["game_state"]
    mode = gs["mode"]
    ages = gs["selected_ages"]
    gs["phase"] = "ENTERING_SELF" if mode == "conversation" else "SEATING"
    await manager.broadcast(session_id, {"type": "game_state", "payload": session})
    response = await _letters_lumi(
        session,
        session_id,
        (
            f"The five-question table setting is complete. Build only from this material: {gs['intake_answers']}. "
            f"{'Take one explicit breath and step into ' + ages[0]['label'] + '.' if mode == 'conversation' else 'Seat every selected age-self with one concise, distinct line.'} "
            "Do not claim recovered memory, certainty, diagnosis, prediction, or professional authority."
        ),
        "The chair is pulled out. Take a moment; the voice arriving here is imagined from what you chose to share.",
    )
    if mode == "conversation":
        voice = str(response.get("age_self_voice") or response["speech_text"]).strip()[:2400]
        gs["dialogue_turns"].append({"speaker": ages[0]["label"], "text": voice})
        gs["phase"] = "CONVERSATION"
        _letters_add_message(session, ages[0]["label"], voice)
    else:
        selected = {item["label"] for item in ages}
        raw_voices = response.get("council_voices") if isinstance(response.get("council_voices"), list) else []
        voices = []
        seen = set()
        for item in raw_voices:
            if not isinstance(item, dict) or item.get("age_self") not in selected or item.get("age_self") in seen:
                continue
            voices.append({"age_self": item["age_self"], "voice": str(item.get("voice", "")).strip()[:1600]})
            seen.add(item["age_self"])
        voices.extend(
            {"age_self": item["label"], "voice": "I am here. Ask what you came to ask."}
            for item in ages if item["label"] not in seen
        )
        gs["council_turns"].append({"prompt": None, "target_type": "seating", "voices": voices, "facilitator_note": response["speech_text"]})
        gs["phase"] = "COUNCIL"
        _letters_add_message(session, "The Council", "\n".join(f"{item['age_self']}: {item['voice']}" for item in voices))
    await manager.broadcast(session_id, {"type": "game_state", "payload": session})


def _letters_table_log(session: dict, response: dict) -> dict:
    gs = session["game_state"]
    source = response.get("table_log") if isinstance(response.get("table_log"), dict) else {}
    ages = gs["selected_ages"]
    current_anchors = (
        list(dict.fromkeys(item["anchor"] for item in ages))
        if gs.get("interaction_count", 0) > 0 else []
    )
    prior_anchors = {
        anchor for entry in gs["history_snapshot"] for anchor in entry.get("anchors", [])
    }
    new_anchors = [anchor for anchor in current_anchors if anchor not in prior_anchors]
    all_anchors = prior_anchors | set(current_anchors)
    gs["newly_visited_anchors"] = new_anchors
    gs["full_table_achieved"] = bool(gs["history_snapshot"]) and all_anchors == {anchor for anchor, *_ in LETTERS_ANCHORS}
    anchor_labels = {anchor: label for anchor, _, _, label in LETTERS_ANCHORS}
    return {
        "entry_id": uuid.uuid4().hex,
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "mode": gs["mode"],
        "ages": [item["age"] for item in ages],
        "anchors": current_anchors,
        "compass": gs.get("compass") or "Session closed before a compass was set.",
        "summary": str(source.get("summary") or response.get("speech_text") or "A conversation was held across time.").strip()[:2400],
        "shift": str(source.get("shift") or "Something was given enough room to be heard.").strip()[:1200],
        "open_question": str(source.get("open_question") or "What will look different when this question returns?").strip()[:1200],
        "lumi_noticed": str(source.get("lumi_noticed") or "The player stayed with the question rather than forcing a verdict.").strip()[:1200],
        "conflicts": [str(item)[:800] for item in source.get("conflicts", [])[:6]] if isinstance(source.get("conflicts"), list) else [],
        "record": {
            "letter": gs.get("assembled_letter") if gs["mode"] == "letter" else None,
            "dialogue": copy.deepcopy(gs.get("dialogue_turns", [])) if gs["mode"] == "conversation" else None,
            "council": copy.deepcopy(gs.get("council_turns", [])) if gs["mode"] == "council" else None,
        },
        "return_from": gs.get("return_match"),
        "dedication": (
            f"You met {', '.join(anchor_labels[anchor] for anchor in new_anchors)} at the table tonight."
            if new_anchors else None
        ),
        "full_table_achieved": gs["full_table_achieved"],
    }


async def _complete_letters_session(session: dict, session_id: str) -> None:
    gs = session["game_state"]
    gs["phase"] = "TABLE_LOG"
    if gs["mode"] == "letter":
        gs["assembled_letter"] = "\n\n".join(gs["letter_sections"])
    await manager.broadcast(session_id, {"type": "game_state", "payload": session})
    response = await _letters_lumi(
        session,
        session_id,
        (
            f"The player has chosen to close this {gs['mode']} session. Produce a concise structured table_log with "
            "summary, shift, open_question, lumi_noticed, and conflicts. Do not diagnose or deliver a verdict. "
            f"Compass: {gs['compass']}. Ages: {gs['selected_ages']}. "
            f"Letter: {gs.get('assembled_letter')}. Dialogue: {gs.get('dialogue_turns')}. Council: {gs.get('council_turns')}."
        ),
        "The chairs can be pushed back now. Nothing here needs to become a verdict tonight.",
    )
    gs["table_log"] = _letters_table_log(session, response)
    gs["phase"] = "COMPLETED"
    session["status"] = "COMPLETED"
    session["concluded"] = True
    session["current_player_id"] = None
    session["drift_log"] = gs["table_log"]["summary"]
    _letters_add_message(session, "Lumi", response["speech_text"])
    await manager.broadcast(session_id, {"type": "game_state", "payload": session})


async def _handle_letters_action(session: dict, session_id: str, username: str, websocket: WebSocket, msg_type: str, msg_data: dict) -> None:
    gs = session.get("game_state") or {}
    player = session.get("players", [{}])[0].get("username")
    if session.get("status") != "ACTIVE" or username != player:
        await websocket.send_json({"type": "error", "message": "The Long Table is not accepting this action."})
        return
    if msg_type == "pause_game":
        gs["paused"] = True
        await manager.broadcast(session_id, {"type": "game_state", "payload": session})
        return
    if msg_type == "resume_game":
        gs["paused"] = False
        await manager.broadcast(session_id, {"type": "game_state", "payload": session})
        return
    if gs.get("paused") and msg_type != "close_letters_session":
        await websocket.send_json({"type": "error", "message": "Resume the table before continuing."})
        return
    if msg_type == "submit_letters_compass":
        if gs.get("phase") != "COMPASS":
            await websocket.send_json({"type": "error", "message": "The session compass is already set."})
            return
        compass = str(msg_data.get("text", "")).strip()
        if not 1 <= len(compass) <= 1000:
            await websocket.send_json({"type": "error", "message": "The compass must be between 1 and 1000 characters."})
            return
        gs["compass"] = compass
        gs["history_snapshot"] = _letters_history(msg_data.get("history"))
        _letters_add_message(session, username, compass, "user")
        response = await _letters_lumi(
            session,
            session_id,
            (
                f"Receive this session compass: {compass}. Prior entries: {gs['history_snapshot']}. "
                "If and only if one prior entry genuinely matches, return its exact entry_id as return_entry_id. "
                + ("Invite the occasion for the letter." if gs["mode"] == "letter" else "Ask the first of five precise voice-building questions and return it as intake_question.")
            ),
            "Bring only what is real. We can begin there.",
        )
        gs["return_match"] = _letters_return_id(response, gs["history_snapshot"])
        if gs["mode"] == "letter":
            gs["phase"] = "OCCASION"
        else:
            gs["phase"] = "VOICE_INTAKE"
            gs["intake_question"] = str(response.get("intake_question") or "What would this version of you recognize immediately about the question you brought?").strip()[:800]
        _letters_add_message(session, "Lumi", response["speech_text"])
        await manager.broadcast(session_id, {"type": "game_state", "payload": session})
        return
    if msg_type == "submit_letters_occasion":
        occasion = str(msg_data.get("text", "")).strip()
        if gs.get("phase") != "OCCASION" or not 1 <= len(occasion) <= 1000:
            await websocket.send_json({"type": "error", "message": "Describe what made this letter necessary in 1 to 1000 characters."})
            return
        gs["occasion"] = occasion
        gs["phase"] = "LETTER_WRITING"
        _letters_add_message(session, username, occasion, "user")
        _letters_add_message(session, "Lumi", "Begin wherever the true letter begins. It does not need to sound finished.")
        await manager.broadcast(session_id, {"type": "game_state", "payload": session})
        return
    if msg_type == "submit_letters_intake":
        if gs.get("phase") != "VOICE_INTAKE":
            await websocket.send_json({"type": "error", "message": "Voice-building intake is not active."})
            return
        passed = bool(msg_data.get("passed"))
        answer = str(msg_data.get("text", "")).strip()
        if not passed and not 1 <= len(answer) <= 2000:
            await websocket.send_json({"type": "error", "message": "Answer the question or choose pass."})
            return
        gs["intake_answers"].append({"question": gs["intake_question"], "answer": None if passed else answer, "passed": passed})
        gs["intake_index"] = len(gs["intake_answers"])
        _letters_add_message(session, username, "[Passed]" if passed else answer, "user")
        if gs["intake_index"] >= LETTERS_INTAKE_COUNT:
            substantive = sum(bool(item.get("answer")) for item in gs["intake_answers"])
            if substantive < 2:
                gs["phase"] = "INTAKE_CONFIRM"
                _letters_add_message(session, "Lumi", "I can continue, but with less than two answers the voice may remain broad. Continue anyway?")
                await manager.broadcast(session_id, {"type": "game_state", "payload": session})
            else:
                await _letters_begin_voice(session, session_id)
            return
        response = await _letters_lumi(
            session,
            session_id,
            f"Using the compass and answers so far, ask adaptive voice-building question {gs['intake_index'] + 1} of five. Return intake_question. Do not pressure disclosure.",
            "We can keep this simple and specific.",
        )
        gs["intake_question"] = str(response.get("intake_question") or f"What would this age-self understand about you that others might miss?").strip()[:800]
        _letters_add_message(session, "Lumi", response["speech_text"])
        await manager.broadcast(session_id, {"type": "game_state", "payload": session})
        return
    if msg_type == "confirm_letters_sparse_intake":
        if gs.get("phase") != "INTAKE_CONFIRM":
            await websocket.send_json({"type": "error", "message": "No intake confirmation is pending."})
            return
        await _letters_begin_voice(session, session_id)
        return
    if msg_type == "pass_turn":
        if gs.get("phase") not in {"LETTER_WRITING", "CONVERSATION", "COUNCIL"}:
            await websocket.send_json({"type": "error", "message": "There is nothing to pass right now."})
            return
        _letters_add_message(session, "Lumi", "We can leave that unsaid. Nothing here requires an explanation.")
        await manager.broadcast(session_id, {"type": "game_state", "payload": session})
        return
    if msg_type == "close_letters_session":
        if gs.get("phase") not in {
            "COMPASS", "OCCASION", "VOICE_INTAKE", "INTAKE_CONFIRM",
            "LETTER_WRITING", "CONVERSATION", "COUNCIL",
        }:
            await websocket.send_json({"type": "error", "message": "The table cannot close from this phase."})
            return
        await _complete_letters_session(session, session_id)
        return
    if msg_type != "submit_answer" or gs.get("phase") not in {"LETTER_WRITING", "CONVERSATION", "COUNCIL"}:
        await websocket.send_json({"type": "error", "message": "This phase is not accepting a response."})
        return
    text = str(msg_data.get("text", "")).strip()
    if not 1 <= len(text) <= 6000:
        await websocket.send_json({"type": "error", "message": "Response must be between 1 and 6000 characters."})
        return
    _letters_add_message(session, username, text, "user")
    if gs["phase"] == "LETTER_WRITING":
        gs["letter_sections"].append(text)
        gs["interaction_count"] += 1
        response = await _letters_lumi(
            session,
            session_id,
            "Read the new letter section. Choose exactly one move: draw, hold, or unsent_line. Return letter_move and a concise facilitation response. Never rewrite the player's words.",
            "Let that line remain exactly as you wrote it. What wants to come next?",
        )
        move = response.get("letter_move") if response.get("letter_move") in {"draw", "hold", "unsent_line"} else "hold"
        gs["letter_moves"].append({"move": move, "response": response["speech_text"]})
        _letters_add_message(session, "Lumi", response["speech_text"])
    elif gs["phase"] == "CONVERSATION":
        age = gs["selected_ages"][0]
        response = await _letters_lumi(
            session,
            session_id,
            f"Respond as {age['label']} using only the supplied voice material. Stay concise, honest, and non-sentimental. The player said: {text}",
            "I hear you. I do not have a perfect answer, but I am still here at the table.",
        )
        voice = str(response.get("age_self_voice") or response["speech_text"]).strip()[:2400]
        gs["dialogue_turns"].append({"speaker": username, "text": text})
        gs["dialogue_turns"].append({"speaker": age["label"], "text": voice})
        gs["interaction_count"] += 1
        _letters_add_message(session, age["label"], voice)
    else:
        target_type = msg_data.get("target_type", "all")
        if target_type not in {"all", "specific", "vote"}:
            target_type = "all"
        labels = {item["label"] for item in gs["selected_ages"]}
        target_age = msg_data.get("target_age") if target_type == "specific" else None
        if target_type == "specific" and target_age not in labels:
            await websocket.send_json({"type": "error", "message": "Choose a self who is seated at this table."})
            session["messages"].pop()
            return
        response = await _letters_lumi(
            session,
            session_id,
            f"Council turn addressed to {target_type}{' (' + target_age + ')' if target_age else ''}: {text}. Return council_voices only for relevant seated selves and an optional facilitator_note. A vote is non-binding and must not become a verdict.",
            "The table is considering what you brought.",
        )
        raw = response.get("council_voices") if isinstance(response.get("council_voices"), list) else []
        voices = []
        seen = set()
        for item in raw:
            label = item.get("age_self") if isinstance(item, dict) else None
            if label not in labels or label in seen or (target_type == "specific" and label != target_age):
                continue
            voices.append({"age_self": label, "voice": str(item.get("voice", "")).strip()[:1600]})
            seen.add(label)
        if not voices:
            selected = [item for item in gs["selected_ages"] if target_type != "specific" or item["label"] == target_age]
            voices = [{"age_self": item["label"], "voice": "I would rather ask what this choice is protecting."} for item in selected]
        note = str(response.get("facilitator_note") or "").strip()[:1200] or None
        gs["council_turns"].append({"prompt": text, "target_type": target_type, "target_age": target_age, "voices": voices, "facilitator_note": note})
        gs["interaction_count"] += 1
        rendered = "\n".join(f"{item['age_self']}: {item['voice']}" for item in voices)
        _letters_add_message(session, "The Council", rendered + (f"\n\nLumi: {note}" if note else ""))
    await manager.broadcast(session_id, {"type": "game_state", "payload": session})


def _turncoat_dimensions(game_state: dict) -> tuple[str, ...]:
    return TURNCOAT_BASE_DIMENSIONS + (("delta",) if game_state.get("mode") == "full_circle" else ())


def _turncoat_scorecard(value: object, dimensions: tuple[str, ...]) -> dict:
    source = value if isinstance(value, dict) else {}
    result = {}
    for dimension in dimensions:
        try:
            score = float(source.get(dimension, 5))
        except (TypeError, ValueError):
            score = 5
        result[dimension] = max(1.0, min(10.0, round(score, 1)))
    return result


def _valid_turncoat_peer_card(value: object, dimensions: tuple[str, ...]) -> bool:
    if not isinstance(value, dict) or set(value) != set(dimensions):
        return False
    try:
        return all(1 <= float(value[dimension]) <= 10 for dimension in dimensions)
    except (TypeError, ValueError):
        return False


async def _turncoat_lumi(session: dict, session_id: str, instruction: str, fallback: str) -> dict:
    await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
    response = await call_lumi_llm(session, instruction)
    await manager.broadcast(session_id, {"type": "host_typing", "payload": False})
    if not isinstance(response, dict):
        response = {}
    response["speech_text"] = str(response.get("speech_text") or fallback).strip()[:2400]
    return response


async def _start_turncoat_session(session: dict, session_id: str) -> None:
    gs = session["game_state"]
    players = [player["username"] for player in session["players"]]
    gs.update({
        "phase": "SETUP",
        "setup_positions": {}, "motion": None, "motion_territory": None,
        "real_sides": {}, "assigned_positions": {}, "arguments": {},
        "lumi_scores": {}, "peer_scores": {}, "score_history": [],
        "totals": {player: 0.0 for player in players}, "round": 1,
        "turn_index": 0, "curveball": None, "turncoat_bonus_awarded": None,
        "turncoat_bonus_round": None,
        "final_declarations": None,
    })
    gs["session_events"] = ["Turncoat started."]
    session["status"] = "ACTIVE"
    session["current_round"] = 1
    session["current_player_id"] = None
    session["messages"].append({
        "role": "assistant", "sender": "Lumi",
        "content": "State one position you genuinely hold. Give me something worth arguing against.",
    })
    await manager.broadcast(session_id, {"type": "game_state", "payload": session})


async def _begin_turncoat_round(session: dict, session_id: str) -> None:
    gs = session["game_state"]
    players = [player["username"] for player in session["players"]]
    response = await _turncoat_lumi(
        session, session_id,
        (
            f"Create one concise, genuinely debatable shared motion for round {gs['round']} of {gs['total_rounds']}. "
            f"Territory preference: {gs['territory']}. Seed positions: {gs['setup_positions']}. "
            "Return motion and motion_territory. The motion must permit a clear agree/disagree stance and avoid personal attacks."
        ),
        "New round. Take your real position privately; then prepare to betray it.",
    )
    fallback_motions = (
        "A good life requires ambition more than contentment.",
        "Loyalty should outweigh impartial moral rules.",
        "Technology makes human relationships meaningfully better.",
        "Personal freedom matters more than collective stability.",
        "Knowing an uncomfortable truth is always better than a comforting illusion.",
    )
    motion = str(response.get("motion") or fallback_motions[(gs["round"] - 1) % len(fallback_motions)]).strip()[:500]
    gs.update({
        "phase": "STANCE_CHECK", "motion": motion,
        "motion_territory": str(response.get("motion_territory") or gs["territory"]).replace("_", " ").title(),
        "real_sides": {}, "assigned_positions": {}, "arguments": {},
        "lumi_scores": {}, "peer_scores": {}, "turn_index": 0, "curveball": None,
    })
    session["current_player_id"] = None
    session["messages"].append({"role": "assistant", "sender": "Lumi", "content": f"Round {gs['round']}: {motion}"})
    await manager.broadcast(session_id, {"type": "game_state", "payload": session})


async def _score_turncoat_round(session: dict, session_id: str) -> None:
    gs = session["game_state"]
    players = [player["username"] for player in session["players"]]
    dimensions = _turncoat_dimensions(gs)
    response = await _turncoat_lumi(
        session, session_id,
        (
            f"Score every player from 1 to 10 on {dimensions}, using the complete structured arguments: {gs['arguments']}. "
            "Return scores keyed by exact username. Delta measures evolution between opposite-side and actual-side arguments. "
            "You may return turncoat_bonus_awarded only if conviction was extraordinary; it may be awarded once per session."
        ),
        "Arguments are closed. Score one another with the same standards I used.",
    )
    proposed = response.get("scores") if isinstance(response.get("scores"), dict) else {}
    gs["lumi_scores"] = {player: _turncoat_scorecard(proposed.get(player), dimensions) for player in players}
    bonus = response.get("turncoat_bonus_awarded")
    if gs.get("turncoat_bonus_awarded") is None and bonus in players:
        gs["turncoat_bonus_awarded"] = bonus
        gs["turncoat_bonus_round"] = gs["round"]
    gs["phase"] = "PEER_SCORING"
    gs["peer_scores"] = {}
    session["current_player_id"] = None
    session["messages"].append({"role": "assistant", "sender": "Lumi", "content": response["speech_text"]})
    await manager.broadcast(session_id, {"type": "game_state", "payload": session})


def _reveal_turncoat_scores(session: dict) -> None:
    gs = session["game_state"]
    players = [player["username"] for player in session["players"]]
    dimensions = _turncoat_dimensions(gs)
    round_scores = {}
    for target in players:
        peer_cards = [gs["peer_scores"][scorer][target] for scorer in players if scorer != target]
        peer_average = {
            dimension: round(sum(card[dimension] for card in peer_cards) / len(peer_cards), 1)
            for dimension in dimensions
        }
        final = {
            dimension: round((gs["lumi_scores"][target][dimension] + peer_average[dimension]) / 2, 1)
            for dimension in dimensions
        }
        subtotal = round(sum(final.values()), 1)
        bonus = 5 if gs.get("turncoat_bonus_awarded") == target and gs.get("turncoat_bonus_round") == gs["round"] else 0
        gs["totals"][target] = round(gs["totals"].get(target, 0) + subtotal + bonus, 1)
        round_scores[target] = {
            "lumi": gs["lumi_scores"][target], "peer_average": peer_average,
            "final": final, "subtotal": subtotal, "bonus": bonus,
        }
    gs["score_history"].append({
        "round": gs["round"], "motion": gs["motion"], "scores": round_scores,
        "peer_scorecards": copy.deepcopy(gs["peer_scores"]),
    })
    gs["phase"] = "REVEAL"
    session["current_player_id"] = None


def _complete_turncoat(session: dict) -> None:
    gs = session["game_state"]
    players = [player["username"] for player in session["players"]]
    ordered = sorted(players, key=lambda player: gs["totals"].get(player, 0), reverse=True)
    top_total = gs["totals"].get(ordered[0], 0)
    winners = [player for player in ordered if gs["totals"].get(player, 0) == top_total]
    if len(winners) > 1:
        latest = gs["score_history"][-1]["scores"]
        best_closing = max(latest[player]["subtotal"] for player in winners)
        winners = [player for player in winners if latest[player]["subtotal"] == best_closing]
    if len(winners) > 1:
        adaptability = {
            player: sum(item["scores"][player]["final"]["adaptability"] for item in gs["score_history"])
            for player in winners
        }
        best_adaptability = max(adaptability.values())
        winners = [player for player in winners if adaptability[player] == best_adaptability]
    award = gs.get("turncoat_bonus_awarded") or max(
        players,
        key=lambda player: sum(item["scores"][player]["final"]["conviction"] for item in gs["score_history"]),
    )
    changed = None
    if gs.get("mode") == "full_circle":
        changed = max(
            players,
            key=lambda player: sum(item["scores"][player]["final"].get("delta", 0) for item in gs["score_history"]),
        )
    gs["final_declarations"] = {
        "winners": winners, "turncoat_award": award, "most_changed_mind": changed,
    }
    gs["phase"] = "COMPLETED"
    session["status"] = "COMPLETED"
    session["concluded"] = True
    session["current_player_id"] = None
    session["messages"].append({
        "role": "assistant", "sender": "Lumi",
        "content": f"The argument is closed. {' and '.join(winners)} {'share' if len(winners) > 1 else 'takes'} the win. Understanding the other side was the harder victory.",
    })


async def _advance_turncoat_stage(session: dict, session_id: str) -> None:
    gs = session["game_state"]
    players = [player["username"] for player in session["players"]]
    phase = gs["phase"]
    next_phase = {
        "OPENING": "REBUTTAL", "REBUTTAL": "CURVEBALL_RESPONSE",
        "CURVEBALL_RESPONSE": "CLOSING", "FULL_CIRCLE_OPENING": "FULL_CIRCLE_REBUTTAL",
    }.get(phase)
    if phase == "REBUTTAL":
        response = await _turncoat_lumi(
            session, session_id,
            f"Create the one curveball for this round's motion: {gs['motion']}. Return curveball and a sharp announcement.",
            "Curveball: assume the person most affected is someone you love. Does your argument survive?",
        )
        gs["curveball"] = str(response.get("curveball") or response["speech_text"]).strip()[:700]
        session["messages"].append({"role": "assistant", "sender": "Lumi", "content": f"Curveball: {gs['curveball']}"})
    elif phase == "CLOSING":
        next_phase = "FULL_CIRCLE_OPENING" if gs.get("mode") == "full_circle" else None
        if next_phase:
            session["messages"].append({"role": "assistant", "sender": "Lumi", "content": "Full Circle. Now argue what you actually believe—after everything you just argued against it."})
        else:
            await _score_turncoat_round(session, session_id)
            return
    elif phase == "FULL_CIRCLE_REBUTTAL":
        await _score_turncoat_round(session, session_id)
        return
    gs["phase"] = next_phase
    gs["turn_index"] = 0
    session["current_player_id"] = players[0]
    await manager.broadcast(session_id, {"type": "game_state", "payload": session})


async def _handle_turncoat_action(session: dict, session_id: str, username: str, websocket: WebSocket, msg_type: str, msg_data: dict) -> None:
    gs = session.get("game_state") or {}
    players = [player["username"] for player in session["players"]]
    if session.get("status") != "ACTIVE" or username not in players:
        await websocket.send_json({"type": "error", "message": "Turncoat is not accepting this action."})
        return
    if msg_type == "submit_turncoat_setup":
        if gs.get("phase") != "SETUP":
            await websocket.send_json({"type": "error", "message": "Setup is closed."})
            return
        position = str(msg_data.get("position", "")).strip()
        if not position or len(position) > 500:
            await websocket.send_json({"type": "error", "message": "Position must be between 1 and 500 characters."})
            return
        gs["setup_positions"][username] = position
        if all(player in gs["setup_positions"] for player in players):
            await _begin_turncoat_round(session, session_id)
        else:
            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
        return
    if msg_type == "submit_turncoat_stance":
        if gs.get("phase") != "STANCE_CHECK" or msg_data.get("side") not in {"agree", "disagree"}:
            await websocket.send_json({"type": "error", "message": "Invalid stance submission."})
            return
        gs["real_sides"][username] = msg_data["side"]
        if all(player in gs["real_sides"] for player in players):
            gs["assigned_positions"] = {
                player: "disagree" if gs["real_sides"][player] == "agree" else "agree" for player in players
            }
            gs["phase"] = "OPENING"
            gs["turn_index"] = 0
            session["current_player_id"] = players[0]
            assignments = "; ".join(f"{player}: {side}" for player, side in gs["assigned_positions"].items())
            session["messages"].append({"role": "assistant", "sender": "Lumi", "content": f"Coin flip complete. Assigned sides—{assignments}. {players[0]}, open the case."})
        await manager.broadcast(session_id, {"type": "game_state", "payload": session})
        return
    if msg_type == "submit_turncoat_peer_scores":
        if gs.get("phase") != "PEER_SCORING" or username in gs["peer_scores"]:
            await websocket.send_json({"type": "error", "message": "Peer scoring is not available."})
            return
        submitted = msg_data.get("scores")
        if not isinstance(submitted, dict) or set(submitted) != set(players) - {username}:
            await websocket.send_json({"type": "error", "message": "Score every opponent exactly once."})
            return
        dimensions = _turncoat_dimensions(gs)
        if not all(_valid_turncoat_peer_card(submitted[target], dimensions) for target in submitted):
            await websocket.send_json({"type": "error", "message": "Every score must include all dimensions from 1 to 10."})
            return
        gs["peer_scores"][username] = {target: _turncoat_scorecard(submitted[target], dimensions) for target in submitted}
        if all(player in gs["peer_scores"] for player in players):
            _reveal_turncoat_scores(session)
        await manager.broadcast(session_id, {"type": "game_state", "payload": session})
        return
    if msg_type == "next_phase":
        if gs.get("phase") != "REVEAL" or username != players[0]:
            await websocket.send_json({"type": "error", "message": "Only the host can advance after the reveal."})
            return
        if gs["round"] >= gs["total_rounds"]:
            _complete_turncoat(session)
            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
        else:
            gs["round"] += 1
            session["current_round"] = gs["round"]
            await _begin_turncoat_round(session, session_id)
        return
    if msg_type != "submit_answer" or gs.get("phase") not in {
        "OPENING", "REBUTTAL", "CURVEBALL_RESPONSE", "CLOSING", "FULL_CIRCLE_OPENING", "FULL_CIRCLE_REBUTTAL",
    }:
        await websocket.send_json({"type": "error", "message": "This phase is not accepting an argument."})
        return
    if session.get("current_player_id") != username:
        await websocket.send_json({"type": "error", "message": "It is not your turn."})
        return
    argument = str(msg_data.get("text", "")).strip()
    if not argument or len(argument) > 6000:
        await websocket.send_json({"type": "error", "message": "Argument must be between 1 and 6000 characters."})
        return
    phase = gs["phase"]
    gs["arguments"].setdefault(phase.lower(), {})[username] = argument
    session["messages"].append({"role": "user", "sender": username, "content": argument})
    index = players.index(username)
    if index < len(players) - 1:
        gs["turn_index"] = index + 1
        session["current_player_id"] = players[index + 1]
        await manager.broadcast(session_id, {"type": "game_state", "payload": session})
    else:
        await _advance_turncoat_stage(session, session_id)

CALLOUT_FALLBACK_PROMPTS = {
    1: [
        "What is your absolute biggest pet peeve?",
        "If you could buy any fictional vehicle, what would it be?",
        "What is the most useless talent you possess?"
    ],
    2: [
        "What is a secret dream you've never told this group?",
        "What is the weirdest thing you did when you were a kid?",
        "Which of your friends' traits do you secretly wish you had?"
    ],
    3: [
        "What is the first word that comes to mind when you think of comfort?",
        "What is the worst fashion choice you ever made?",
        "What is your go-to karaoke song?"
    ],
    4: [
        "What is the most embarrassing thing in your search history?",
        "If you were a superhero, what would your highly specific, low-stakes power be?",
        "What is something you pretend to like but secretly hate?"
    ],
    5: [
        "If this group was trapped on a deserted island, who would be eaten first?",
        "What is the most controversial opinion you hold?",
        "What is one thing about yourself that you hope never changes?"
    ]
}

def get_fallback_callout_response(session: dict) -> dict:
    round_val = session.get("current_round", 1)
    game_state = session.get("game_state")
    phase = game_state.get("phase", "PROMPT") if game_state else "PROMPT"
    players = [p["username"] for p in session.get("players", [])]
    
    import random
    prompts_list = CALLOUT_FALLBACK_PROMPTS.get(round_val, ["What is a fact about yourself?"])
    generated_prompt = random.choice(prompts_list)
    
    speech_text = f"Lumi here. Let's move to the next stage of Callout."
    custom_titles = None
    
    if phase in ("FINAL_PROMPT", "FINAL_GUESSING", "FINAL_REVEAL") and round_val == 5:
        custom_titles = {
            p: f"The Curious Player: for surviving Callout in {session.get('mood', 'Reflective')} mood." for p in players
        }
        speech_text = "The game of Callout has concluded. Here are your final titles!"
        
    return {
        "speech_text": speech_text,
        "generated_prompt": generated_prompt,
        "custom_titles": custom_titles
    }

async def call_lumi_and_broadcast(session: dict, session_id: str, instruction: str):
    await manager.broadcast(session_id, {
        "type": "host_typing",
        "payload": True
    })
    
    lumi_res = await call_lumi_llm(session, instruction)
    
    await manager.broadcast(session_id, {
        "type": "host_typing",
        "payload": False
    })
    
    speech = lumi_res.get("speech_text", "Moving to the next stage.")
    generated_prompt = lumi_res.get("generated_prompt")
    custom_titles = lumi_res.get("custom_titles")
    
    # Store prompt in round_data
    if "game_state" in session and session["game_state"]:
        if generated_prompt:
            session["game_state"]["round_data"]["prompt"] = generated_prompt
        if custom_titles:
            session["game_state"]["custom_titles"] = custom_titles
            titles_str = "\n".join(f"{player}: {title}" for player, title in custom_titles.items())
            session["drift_log"] = f"Game Completed! Custom Titles:\n{titles_str}"
            
    # Append Lumi speech message
    session["messages"].append({
        "role": "assistant",
        "sender": "Lumi",
        "content": speech
    })
    
    # If starting submitting phase, update phase
    if "game_state" in session and session["game_state"]:
        phase = session["game_state"]["phase"]
        if phase == "PROMPT":
            session["game_state"]["phase"] = "SUBMITTING"
        elif phase == "HOT_SEAT_PROMPT":
            session["game_state"]["phase"] = "HOT_SEAT_SUBMITTING"
        elif phase == "RAPID_PROMPT":
            session["game_state"]["phase"] = "RAPID_SUBMITTING"
        elif phase == "BLUFF_PROMPT":
            session["game_state"]["phase"] = "BLUFF_SUBMITTING_TARGET"
        elif phase == "FINAL_PROMPT":
            session["game_state"]["phase"] = "FINAL_SUBMITTING_TARGET"

    await manager.broadcast(session_id, {
        "type": "game_state",
        "payload": session
    })

async def reveal_and_score_guessing_round(session: dict, session_id: str):
    game_state = session["game_state"]
    round_data = game_state["round_data"]
    target = round_data["target_player"]
    correct = round_data["private_answer"]
    current_round = session["current_round"]
    
    def is_match(a, b):
        if not a or not b:
            return False
        return a.strip().lower() == b.strip().lower()
        
    scores = game_state["scores"]
    guesses = round_data["guesses"]
    
    reveal_results = []
    correct_guessers = []
    
    first_correct_guesser = None
    if current_round == 3:
        correct_timestamps = []
        for g, text in guesses.items():
            if is_match(text, correct):
                correct_timestamps.append((g, round_data["timestamps"].get(g, 9999999999.0)))
        if correct_timestamps:
            correct_timestamps.sort(key=lambda x: x[1])
            first_correct_guesser = correct_timestamps[0][0]
            
    any_correct = False
    for g, text in guesses.items():
        matched = is_match(text, correct)
        if matched:
            any_correct = True
            correct_guessers.append(g)
            if current_round == 5:
                points = 5
            elif current_round == 3:
                if g == first_correct_guesser:
                    points = 4
                else:
                    points = 0
            else:
                points = 2
            if points > 0:
                scores[g] = scores.get(g, 0) + points
                reveal_results.append(f"{g} guessed correctly: '{text}' (+{points} pts)")
            else:
                reveal_results.append(f"{g} guessed correctly: '{text}' (but was not first)")
        else:
            reveal_results.append(f"{g} guessed incorrectly: '{text}'")
            
    if current_round == 2 and not any_correct:
        points = 1
        scores[target] = scores.get(target, 0) + points
        reveal_results.append(f"Nobody guessed correctly! Hot seat player {target} gets +{points} pt for being unknowable.")
        
    event_str = f"Round {current_round} Reveal: The correct answer was '{correct}'."
    game_state["session_events"].append(event_str)
    for res in reveal_results:
        game_state["session_events"].append(res)
        
    game_state["phase"] = "REVEAL"
    
    instruction = (
        f"We are revealing the answers for Round {current_round}. "
        f"The target player {target}'s correct answer was '{correct}'. "
        f"Guesses submitted: {guesses}. "
        f"Correct guessers: {correct_guessers}. "
        f"Write a sharp, dry, observational remark about these responses. Maximum 2 sentences."
    )
    
    await call_lumi_and_broadcast(session, session_id, instruction)

async def reveal_and_score_bluff_round(session: dict, session_id: str):
    game_state = session["game_state"]
    round_data = game_state["round_data"]
    target = round_data["target_player"]
    scores = game_state["scores"]
    votes = round_data["votes"]  # {voter_name: chosen_option_dict}
    
    reveal_results = []
    
    # Count votes for each player name
    vote_counts = {}  # {player_name: count}
    for voter, option in votes.items():
        voted_p = option["text"]
        vote_counts[voted_p] = vote_counts.get(voted_p, 0) + 1
        
    if not vote_counts:
        # Fallback if no votes
        game_state["phase"] = "REVEAL"
        await manager.broadcast(session_id, {"type": "game_state", "payload": session})
        return
        
    # Find max votes
    max_votes = max(vote_counts.values())
    most_voted_players = [p for p, count in vote_counts.items() if count == max_votes]
    
    # Award +2 to the most voted player(s)
    for p in most_voted_players:
        scores[p] = scores.get(p, 0) + 2
        reveal_results.append(f"{p} got the most votes ({max_votes}) for the description (+2 pts)")
        
    # Award +3 to everyone who voted for the winning player(s)
    majority_voters = []
    for voter, option in votes.items():
        if option["text"] in most_voted_players:
            majority_voters.append(voter)
            scores[voter] = scores.get(voter, 0) + 3
            reveal_results.append(f"{voter} voted with the majority for {option['text']} (+3 pts)")
            
    event_str = f"Round 4 Reveal: Most voted player(s): {', '.join(most_voted_players)}."
    game_state["session_events"].append(event_str)
    for res in reveal_results:
        game_state["session_events"].append(res)
        
    game_state["phase"] = "REVEAL"
    
    votes_summary = {voter: option["text"] for voter, option in votes.items()}
    instruction = (
        f"We are revealing the Bluff Votes results. "
        f"Statement description was about {target}. "
        f"Votes cast by players: {votes_summary}. "
        f"Most voted player(s): {most_voted_players} with {max_votes} votes. "
        f"Majority voters: {majority_voters}. "
        f"Write a sharp, dry, observation about this vote and why they voted this way. Maximum 2 sentences."
    )
    
    await call_lumi_and_broadcast(session, session_id, instruction)

async def run_callout_transition(session: dict, session_id: str):
    game_state = session["game_state"]
    current_round = session["current_round"]
    players = [p["username"] for p in session["players"]]
    round_data = game_state["round_data"]
    turn_idx = game_state.get("turn_index", 0)

    if current_round == 1:
        # Round 1 has only 1 collective question. When done, move to Round 2 Hot Seat
        session["current_round"] = 2
        game_state["turn_index"] = 0
        target = players[0]
        session["current_player_id"] = target
        game_state["phase"] = "HOT_SEAT_PROMPT"
        round_data["target_player"] = target
        round_data["guesses"] = {}
        round_data["private_answer"] = None
        
        instruction = (
            f"Round 2 is Hot Seat. Each player takes the hot seat once. "
            f"The first Hot Seat player is {target}. Introduce Round 2 (+2 pts for guessers, +1 pt to hot seat if nobody guesses) "
            f"and pose a specific, revealing question for {target} to answer privately. Put the question in 'generated_prompt'."
        )
        await call_lumi_and_broadcast(session, session_id, instruction)

    elif current_round == 2:
        # Rotate through all players for Hot Seat
        next_turn_idx = turn_idx + 1
        if next_turn_idx < len(players):
            game_state["turn_index"] = next_turn_idx
            target = players[next_turn_idx]
            session["current_player_id"] = target
            game_state["phase"] = "HOT_SEAT_PROMPT"
            round_data["target_player"] = target
            round_data["guesses"] = {}
            round_data["private_answer"] = None
            
            instruction = (
                f"Next Hot Seat player is {target}. Pose a tailored, specific question "
                f"for {target} to answer privately. Put the question in 'generated_prompt'."
            )
            await call_lumi_and_broadcast(session, session_id, instruction)
        else:
            # Transition to Round 3 Rapid Callout
            session["current_round"] = 3
            game_state["turn_index"] = 0
            target = players[0]
            session["current_player_id"] = target
            game_state["phase"] = "RAPID_PROMPT"
            round_data["target_player"] = target
            round_data["guesses"] = {}
            round_data["private_answer"] = None
            round_data["timestamps"] = {}
            
            instruction = (
                f"Round 3 is Rapid Callout (Speed Round). Introduce Round 3 (+4 pts, speed is everything, first correct answer gets the points). "
                f"The target player is {target}. Pose a highly specific question about {target} for them to answer privately. "
                f"Put the question in 'generated_prompt'."
            )
            await call_lumi_and_broadcast(session, session_id, instruction)

    elif current_round == 3:
        # Run 4 rapid sub-rounds total
        next_turn_idx = turn_idx + 1
        if next_turn_idx < 4:
            game_state["turn_index"] = next_turn_idx
            target = players[next_turn_idx % len(players)]
            session["current_player_id"] = target
            game_state["phase"] = "RAPID_PROMPT"
            round_data["target_player"] = target
            round_data["guesses"] = {}
            round_data["private_answer"] = None
            round_data["timestamps"] = {}
            
            instruction = (
                f"Next Rapid Callout question. Target player is {target}. Pose a specific question "
                f"about {target} for them to answer privately. Put the question in 'generated_prompt'."
            )
            await call_lumi_and_broadcast(session, session_id, instruction)
        else:
            # Transition to Round 4 Bluff Votes
            session["current_round"] = 4
            game_state["turn_index"] = 0
            target = players[0]
            session["current_player_id"] = target
            game_state["phase"] = "BLUFF_PROMPT"
            round_data["target_player"] = target
            round_data["private_answer"] = None
            round_data["votes"] = {}
            
            # Options for voting are simply player names
            choices = [{"text": p, "creator": p, "is_correct": False} for p in players]
            round_data["bluff_options"] = choices
            
            instruction = (
                f"Round 4 is The Bluff (Majority vote). Introduce Round 4 (+3 pts to majority voters, +2 pts if you get the most votes). "
                f"The first statement description is about {target}. Pose a 'most likely to' statement about {target}. "
                f"Put the statement prompt in 'generated_prompt'. Players will vote on who fits it best."
            )
            await call_lumi_and_broadcast(session, session_id, instruction)

    elif current_round == 4:
        # Run 3 bluff sub-rounds total
        next_turn_idx = turn_idx + 1
        if next_turn_idx < 3:
            game_state["turn_index"] = next_turn_idx
            target = players[next_turn_idx % len(players)]
            session["current_player_id"] = target
            game_state["phase"] = "BLUFF_PROMPT"
            round_data["target_player"] = target
            round_data["private_answer"] = None
            round_data["votes"] = {}
            
            choices = [{"text": p, "creator": p, "is_correct": False} for p in players]
            round_data["bluff_options"] = choices
            
            instruction = (
                f"Next Bluff statement. Target player is {target}. Pose a 'most likely to' statement "
                f"about {target}. Put the statement prompt in 'generated_prompt'. Players will vote on who fits it best."
            )
            await call_lumi_and_broadcast(session, session_id, instruction)
        else:
            # Transition to Round 5 Final Callout
            session["current_round"] = 5
            game_state["turn_index"] = 0
            # Pick target player with the lowest score for maximum drama, or first player if tie
            scores = game_state["scores"]
            sorted_players = sorted(players, key=lambda p: scores.get(p, 0))
            target = sorted_players[0] if sorted_players else players[0]
            
            session["current_player_id"] = target
            game_state["phase"] = "FINAL_PROMPT"
            round_data["target_player"] = target
            round_data["guesses"] = {}
            round_data["private_answer"] = None
            
            instruction = (
                f"Round 5 is the High-Stakes Final Round (+5 pts, winner takes all). The target player is {target}. "
                f"Introduce the final round and pose a deep, personal, revealing question for {target} to answer privately. "
                f"Put the question in 'generated_prompt'."
            )
            await call_lumi_and_broadcast(session, session_id, instruction)

    elif current_round == 5:
        # Game over! Calculate final scores, crown winner, and award titles
        session["concluded"] = True
        session["status"] = "COMPLETED"
        game_state["phase"] = "COMPLETED"
        
        # Format standings for summary
        standings_list = sorted(players, key=lambda p: game_state["scores"].get(p, 0), reverse=True)
        standings_str = ", ".join(f"{p}: {game_state['scores'].get(p, 0)} pts" for p in standings_list)
        
        instruction = (
            f"The game of Callout is over! Final scores are: {standings_str}.\n"
            f"Crown the winner with dramatic flair. Award a custom, witty, session-specific title "
            f"to every single player based on the session log. Titles: "
            f"e.g. 'Ruthlessly Accurate', 'Most Predictable', 'Biggest Wildcard', 'The Dark Horse', etc. "
            f"Include the titles inside 'custom_titles' dict in your JSON response."
        )
        
        await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
        lumi_res = await call_lumi_llm(session, instruction)
        await manager.broadcast(session_id, {"type": "host_typing", "payload": False})

        speech = lumi_res.get("speech_text", "The game is concluded.")
        session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
        
        titles = lumi_res.get("custom_titles") or {}
        titles_str = "\n".join(f"- {p}: {t}" for p, t in titles.items())
        session["drift_log"] = f"Game Completed! Custom Titles:\n{titles_str}"
        
        await manager.broadcast(session_id, {"type": "game_state", "payload": session})

# --- WebSocket Route ---

@router.websocket("/ws/{session_id}")
async def game_websocket(
    websocket: WebSocket,
    session_id: str,
    username: str,
    participant_token: Optional[str] = None,
):
    session = get_or_create_session(session_id)

    # Check if session is already active or concluded
    if session["status"] == "COMPLETED":
        await websocket.accept()
        await websocket.send_json({"type": "error", "message": "Game session already completed"})
        await websocket.close()
        return

    username = username.strip()
    if not username:
        await websocket.accept()
        await websocket.send_json({"type": "error", "message": "Invalid username"})
        await websocket.close()
        return

    requested_protocol = websocket.headers.get("sec-websocket-protocol", "")
    selected_protocol = requested_protocol.split(",")[0].strip() if requested_protocol else None
    protocol_token = (
        selected_protocol.removeprefix("elinity.")
        if selected_protocol and selected_protocol.startswith("elinity.")
        else None
    )
    provided_token = (participant_token or protocol_token or "").strip() or None

    async def cleanup_disconnected_connection(reason: str, *, warning: bool = False):
        manager.disconnect(session_id, username, websocket)
        removed = remove_disconnected_lobby_player(session_id, session, username)
        suffix = " and removed from lobby" if removed else ""
        if warning:
            logger.warning(f"WebSocket runtime disconnect for {username} in session {session_id}: {reason}{suffix}")
        else:
            logger.info(f"User {username} disconnected from session {session_id}{suffix}")
        await manager.broadcast(session_id, {
            "type": "game_state",
            "payload": session
        })

    # Check if player exists in lobby
    player_exists = any(p["username"] == username for p in session["players"])
    tokens = game_participant_tokens.setdefault(session_id, {})
    expected_token = tokens.get(username)
    if expected_token and provided_token != expected_token:
        await websocket.accept(subprotocol=selected_protocol)
        await websocket.send_json({"type": "error", "message": "This display name belongs to another participant."})
        await websocket.close()
        return

    # Accept the authenticated connection and add new lobby participants.
    await manager.connect(session_id, username, websocket, selected_protocol)

    if not player_exists and session["status"] != "LOBBY":
        await websocket.send_json({"type": "error", "message": "This game is already in progress."})
        manager.disconnect(session_id, username, websocket)
        await websocket.close()
        return
    if not player_exists and session["status"] == "LOBBY":
        if session.get("game_slug") == "letters-long-table" and session["players"]:
            await websocket.send_json({"type": "error", "message": "The Letters at the Long Table is a private solo experience."})
            manager.disconnect(session_id, username, websocket)
            await websocket.close()
            return
        if session.get("game_slug") in {"the-unsaid", "turncoat"} and len(session["players"]) >= 6:
            await websocket.send_json({"type": "error", "message": "This game supports at most six players."})
            manager.disconnect(session_id, username, websocket)
            await websocket.close()
            return
        # First player is host
        session["players"].append({"username": username, "ready": False})
        expected_token = uuid.uuid4().hex
        tokens[username] = expected_token
        logger.info(f"User {username} joined lobby {session_id}")

    try:
        if expected_token:
            await websocket.send_json({"type": "participant_token", "payload": expected_token})

        # Broadcast updated room state
        await manager.broadcast(session_id, {
            "type": "game_state",
            "payload": session
        })
    except WebSocketDisconnect:
        await cleanup_disconnected_connection("initial send failed")
        return
    except RuntimeError as e:
        message = str(e)
        if "WebSocket" not in message and "close message" not in message and "disconnect message" not in message:
            raise
        await cleanup_disconnected_connection(message, warning=True)
        return

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")
            msg_data = data.get("data", {})

            if session.get("game_slug") == "the-unsaid" and msg_type in {
                "submit_answer", "pass_turn", "submit_depth_choice", "submit_release_sentence",
                "pause_game", "resume_game", "stop_game",
            }:
                await _handle_unsaid_action(session, session_id, username, websocket, msg_type, msg_data)
                continue
            if session.get("game_slug") == "turncoat" and msg_type in {
                "submit_turncoat_setup", "submit_turncoat_stance", "submit_answer", "pass_turn",
                "submit_turncoat_peer_scores", "next_phase",
            }:
                await _handle_turncoat_action(session, session_id, username, websocket, msg_type, msg_data)
                continue
            if session.get("game_slug") == "letters-long-table" and msg_type in {
                "submit_letters_compass", "submit_letters_occasion", "submit_letters_intake",
                "confirm_letters_sparse_intake", "submit_answer", "pass_turn",
                "close_letters_session", "pause_game", "resume_game",
            }:
                await _handle_letters_action(session, session_id, username, websocket, msg_type, msg_data)
                continue
            if session.get("game_slug") == "game-of-games" and msg_type == "seed_game_of_games_profile":
                if session["status"] != "LOBBY":
                    await websocket.send_json({"type": "error", "message": "Decision Profile can only be seeded before the game starts."})
                    continue
                cleaned = _game_of_games_clean_profile(msg_data.get("profile"))
                if cleaned:
                    session.setdefault("game_state", {}).setdefault("profile_seeds", {})[username] = cleaned
                await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                continue

            if msg_type == "toggle_ready":
                is_ready = msg_data.get("is_ready", False)
                for p in session["players"]:
                    if p["username"] == username:
                        p["ready"] = is_ready
                await manager.broadcast(session_id, {
                    "type": "game_state",
                    "payload": session
                })

            elif msg_type == "update_mood":
                mood = msg_data.get("mood", "Reflective")
                if mood in ["Playful", "Reflective", "Wild", "Tender"]:
                    if session["players"] and session["players"][0]["username"] == username:
                        session["mood"] = mood
                        await manager.broadcast(session_id, {
                            "type": "game_state",
                            "payload": session
                        })
                    else:
                        await websocket.send_json({"type": "error", "message": "Only the room host can change the mood"})

            elif msg_type == "update_game_config":
                # Host can update game-specific configuration before starting
                if session["status"] != "LOBBY":
                    await websocket.send_json({"type": "error", "message": "Cannot update config after game starts"})
                    continue
                if not session["players"] or session["players"][0]["username"] != username:
                    await websocket.send_json({"type": "error", "message": "Only the room host can update config"})
                    continue

                gs = session.get("game_state") or {}
                slug = session["game_slug"]

                if slug == "threadweave":
                    if "mode" in msg_data and msg_data["mode"] in ("loom", "spindle"):
                        gs["mode"] = msg_data["mode"]
                    if "texture" in msg_data:
                        gs["texture"] = msg_data["texture"]
                elif slug == "uncharted-horizons":
                    if "mode" in msg_data and msg_data["mode"] in ("solo", "shared"):
                        gs["mode"] = msg_data["mode"]
                    if "terrain" in msg_data:
                        gs["terrain"] = msg_data["terrain"]
                elif slug == "the-unsaid":
                    if "mode" in msg_data and msg_data["mode"] in ("solo", "face_to_face", "group"):
                        gs["mode"] = msg_data["mode"]
                    if "terrain" in msg_data and msg_data["terrain"] in UNSAID_TERRAINS:
                        gs["terrain"] = msg_data["terrain"]
                    for player in session["players"]:
                        player["ready"] = False
                elif slug == "turncoat":
                    if "mode" in msg_data and msg_data["mode"] in TURNCOAT_MODES:
                        gs["mode"] = msg_data["mode"]
                    if msg_data.get("territory") in TURNCOAT_TERRITORIES:
                        gs["territory"] = msg_data["territory"]
                    if msg_data.get("total_rounds") in (3, 5, "3", "5"):
                        gs["total_rounds"] = int(msg_data["total_rounds"])
                    for player in session["players"]:
                        player["ready"] = False
                elif slug == "letters-long-table":
                    requested_mode = msg_data.get("mode", gs.get("mode", "conversation"))
                    mode = requested_mode if requested_mode in LETTERS_MODES else gs.get("mode", "conversation")
                    selected = _letters_selected_ages(mode, msg_data.get("selected_ages", gs.get("selected_ages")))
                    if "selected_ages" in msg_data and selected is None:
                        await websocket.send_json({"type": "error", "message": "Choose distinct ages from 6 to 90 within this mode's table limit."})
                        continue
                    if selected is None:
                        defaults = {
                            "letter": [16], "conversation": [80], "council": [14, 55, 80],
                        }
                        selected = _letters_selected_ages(mode, defaults[mode])
                    gs["mode"] = mode
                    gs["selected_ages"] = selected
                    for player in session["players"]:
                        player["ready"] = False
                elif slug == "roleswap":
                    if "swap_mode" in msg_data and msg_data["swap_mode"] in ("pure", "deep", "full"):
                        gs["swap_mode"] = msg_data["swap_mode"]
                elif slug == "planet-enigma":
                    valid_worlds = {
                        "desert_island", "haunted_mansion", "space_station",
                        "pirate_ship", "ancient_temple", "underground_lab", "the_void"
                    }
                    if "world" in msg_data and msg_data["world"] in valid_worlds:
                        gs["world"] = msg_data["world"]
                    if "mode" in msg_data and msg_data["mode"] in ("solo", "multiplayer"):
                        gs["mode"] = msg_data["mode"]
                elif slug == "odyssey-mind":
                    if "realm" in msg_data:
                        gs["realm"] = msg_data["realm"]
                    if "realm_type" in msg_data:
                        gs["realm_type"] = msg_data["realm_type"]
                    if "difficulty_tier" in msg_data:
                        gs["difficulty_tier"] = int(msg_data["difficulty_tier"])
                elif slug == "philosophy-arena":
                    if "tier" in msg_data and msg_data["tier"] in ("agora", "academy"):
                        gs["tier"] = msg_data["tier"]
                    if "domain" in msg_data:
                        gs["domain"] = msg_data["domain"]
                    if "challenge_format" in msg_data:
                        gs["challenge_format"] = msg_data["challenge_format"]
                elif slug == "game-of-games":
                    if "mode" in msg_data and msg_data["mode"] in ("discovery", "academy"):
                        gs["mode"] = msg_data["mode"]
                    if "scenario_pack" in msg_data and msg_data["scenario_pack"] in GAME_OF_GAMES_PACKS:
                        gs["scenario_pack"] = msg_data["scenario_pack"]
                    if msg_data.get("scenario_count") in (3, 5, "3", "5"):
                        gs["scenario_count"] = int(msg_data["scenario_count"])
                    for player in session["players"]:
                        player["ready"] = False
                await manager.broadcast(session_id, {
                    "type": "game_state",
                    "payload": session
                })

            elif msg_type == "start_game":
                # Start game transition
                if session["status"] != "LOBBY":
                    await websocket.send_json({"type": "error", "message": "This game has already started."})
                    continue
                all_ready = all(p["ready"] for p in session["players"])
                min_players = 3 if session["game_slug"] == "callout" else 1
                if len(session["players"]) < min_players:
                    await websocket.send_json({"type": "error", "message": f"At least {min_players} player is required to start"})
                    continue

                if not all_ready:
                    if session["game_slug"] == "the-unsaid":
                        await websocket.send_json({"type": "error", "message": "Everyone must be ready before The Unsaid begins."})
                        continue

                if session["game_slug"] == "the-unsaid":
                    if not session["players"] or session["players"][0]["username"] != username:
                        await websocket.send_json({"type": "error", "message": "Only the room host can begin The Unsaid."})
                        continue
                    count_error = _unsaid_player_count_error(
                        (session.get("game_state") or {}).get("mode", "solo"),
                        len(session["players"]),
                    )
                    if count_error:
                        await websocket.send_json({"type": "error", "message": count_error})
                        continue
                if session["game_slug"] == "turncoat":
                    if not session["players"] or session["players"][0]["username"] != username:
                        await websocket.send_json({"type": "error", "message": "Only the host can begin Turncoat."})
                        continue
                    if not 2 <= len(session["players"]) <= 6:
                        await websocket.send_json({"type": "error", "message": "Turncoat requires two to six players."})
                        continue
                    if not all_ready:
                        await websocket.send_json({"type": "error", "message": "Everyone must be ready before Turncoat begins."})
                        continue
                if session["game_slug"] == "letters-long-table":
                    if len(session["players"]) != 1 or session["players"][0]["username"] != username:
                        await websocket.send_json({"type": "error", "message": "The Long Table requires exactly one player."})
                        continue
                    if not all_ready:
                        await websocket.send_json({"type": "error", "message": "Mark yourself ready before opening the table."})
                        continue
                    if _letters_selected_ages(
                        (session.get("game_state") or {}).get("mode", "conversation"),
                        (session.get("game_state") or {}).get("selected_ages"),
                    ) is None:
                        await websocket.send_json({"type": "error", "message": "Choose valid age-selves before opening the table."})
                        continue
                if session["game_slug"] == "game-of-games":
                    if not session["players"] or session["players"][0]["username"] != username:
                        await websocket.send_json({"type": "error", "message": "Only the host can begin The Game of Games."})
                        continue
                    if not 1 <= len(session["players"]) <= 6:
                        await websocket.send_json({"type": "error", "message": "The Game of Games supports one to six players."})
                        continue
                    if not all_ready:
                        await websocket.send_json({"type": "error", "message": "Everyone must be ready before The Game of Games begins."})
                        continue

                session["status"] = "ACTIVE"
                session["current_round"] = 1
                first_player = session["players"][0]["username"]
                session["current_player_id"] = first_player
                gs = session.get("game_state") or {}
                slug = session["game_slug"]

                if slug == "the-unsaid":
                    await _start_unsaid_session(session, session_id)

                elif slug == "callout":
                    gs["phase"] = "ROUND_1_PROMPT"
                    gs["scores"] = {p["username"]: 0 for p in session["players"]}
                    gs["vetos_used"] = {p["username"]: False for p in session["players"]}
                    gs["round_data"]["target_player"] = "ALL"
                    gs["session_events"].append("The game of Callout has started!")

                    await manager.broadcast(session_id, {
                        "type": "game_state",
                        "payload": session
                    })

                    instruction = (
                        f"The competitive game 'Callout' starts now. The players are {[p['username'] for p in session['players']]}. "
                        f"Welcome the group to Callout. Deliver a punchy, fun, one-sentence introduction. "
                        f"Explain the game in exactly three sentences: what it is, how scoring works, and what they're playing for (custom titles at the end). "
                        f"Then, pose a single warm-up question for ALL players in 'generated_prompt' (e.g. 'What is your comfort food?')."
                    )
                    await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                    lumi_res = await call_lumi_llm(session, instruction)
                    await manager.broadcast(session_id, {"type": "host_typing", "payload": False})

                    speech = lumi_res.get("speech_text", "Welcome to Callout. Let's begin Round 1.")
                    if lumi_res.get("generated_prompt"):
                        gs["round_data"]["prompt"] = lumi_res["generated_prompt"]
                        gs["session_events"].append(f"Round 1 Prompt: '{lumi_res['generated_prompt']}' posed.")

                    session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                    await manager.broadcast(session_id, {"type": "game_state", "payload": session})

                elif slug == "roleswap":
                    # Auto-generate player assignments: each player plays the next player in rotation
                    players_list = [p["username"] for p in session["players"]]
                    assignments = {}
                    for i, p in enumerate(players_list):
                        assignments[p] = players_list[(i + 1) % len(players_list)]
                    gs["assignments"] = assignments
                    gs["phase"] = "ACTIVE"
                    gs["session_events"].append("Roleswap has started! Assignments are being announced.")

                    await manager.broadcast(session_id, {
                        "type": "game_state",
                        "payload": session
                    })

                    assignments_text = ", ".join(f"{p} plays {target}" for p, target in assignments.items())
                    instruction = (
                        f"Roleswap starts now. Players: {players_list}. Assignments: {assignments_text}. "
                        f"Announce the assignments conversationally and introduce the first scenario (Level 0: Surface). "
                        f"The first portraying player is {first_player} who will play {assignments[first_player]}."
                    )

                    await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                    lumi_res = await call_lumi_llm(session, instruction)
                    await manager.broadcast(session_id, {"type": "host_typing", "payload": False})

                    speech = lumi_res.get("speech_text", f"Welcome to Roleswap! {first_player}, you'll begin by becoming {assignments.get(first_player, 'someone')}.")
                    session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                    await manager.broadcast(session_id, {"type": "game_state", "payload": session})

                elif slug == "turncoat":
                    await _start_turncoat_session(session, session_id)

                elif slug == "letters-long-table":
                    await _start_letters_session(session, session_id)

                elif slug == "planet-enigma":
                    # Initialize scores for all players, set phase, generate first puzzle
                    gs["phase"] = "ACTIVE"
                    gs["scores"] = {p["username"]: 0 for p in session["players"]}
                    gs["current_puzzle_index"] = 0
                    gs["current_answers"] = {}
                    gs["hints_used"] = {}
                    world = gs.get("world", "desert_island")
                    mode = gs.get("mode", "solo")
                    gs["session_events"].append(f"Planet Enigma started. World: {world}. Mode: {mode}.")

                    await manager.broadcast(session_id, {
                        "type": "game_state",
                        "payload": session
                    })

                    players_list = [p["username"] for p in session["players"]]
                    instruction = (
                        f"Planet Enigma begins now. World: {world}. Mode: {mode}. Players: {players_list}. "
                        f"Step fully into your persona for this world immediately. Deliver the world's opening narrative "
                        f"in your character's voice, then pose the first puzzle. The puzzle must be fully formed: "
                        f"include puzzle_text, puzzle_answer (server-side only), puzzle_category, and all three hints "
                        f"in your response. Do NOT reveal the answer yet — just pose the puzzle."
                    )

                    await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                    lumi_res = await call_lumi_llm(session, instruction)
                    await manager.broadcast(session_id, {"type": "host_typing", "payload": False})

                    speech = lumi_res.get("speech_text", f"Welcome to {world}. Your first challenge awaits.")

                    # Store the puzzle server-side (answer hidden from broadcast)
                    if lumi_res.get("puzzle_text"):
                        puzzle_answer = lumi_res.get("puzzle_answer", "")
                        gs["current_puzzle"] = {
                            "text": lumi_res["puzzle_text"],
                            "answer": puzzle_answer,
                            "category": lumi_res.get("puzzle_category", "classic_riddles"),
                            "hint_1": None,  # hints generated on demand
                            "hint_2": None,
                            "hint_3": None
                        }
                        if lumi_res["puzzle_text"] not in gs["vault"]:
                            gs["vault"].append(lumi_res["puzzle_text"])
                        gs["session_events"].append(f"Puzzle 1 posed: '{lumi_res['puzzle_text'][:100]}'")

                    session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                    await manager.broadcast(session_id, {"type": "game_state", "payload": session})

                elif slug == "odyssey-mind":
                    gs["phase"] = "ACTIVE"
                    gs["scores"] = {p["username"]: 0 for p in session["players"]}
                    realm = gs.get("realm", "synthesis")
                    realm_type = gs.get("realm_type", "trial")
                    gs["session_events"].append(f"The Odyssey of Mind starts in {realm} ({realm_type}).")

                    await manager.broadcast(session_id, {
                        "type": "game_state",
                        "payload": session
                    })

                    players_list = [p["username"] for p in session["players"]]
                    instruction = (
                        f"The Odyssey of Mind begins now. Realm: {realm}. Challenge Format: {realm_type}. "
                        f"Players: {players_list}. Introduce the realm and its atmosphere in your voice as Lumi, "
                        f"then present the first challenge to {first_player}."
                    )

                    await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                    lumi_res = await call_lumi_llm(session, instruction)
                    await manager.broadcast(session_id, {"type": "host_typing", "payload": False})

                    speech = lumi_res.get("speech_text", f"Welcome to the realm of {realm}. {first_player}, your trial begins.")
                    session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                    await manager.broadcast(session_id, {"type": "game_state", "payload": session})

                elif slug == "philosophy-arena":
                    gs["phase"] = "ACTIVE"
                    gs["scores"] = {p["username"]: 0 for p in session["players"]}
                    tier = gs.get("tier", "agora")
                    domain = gs.get("domain", "ethics")
                    fmt = gs.get("challenge_format", "socratic_dialogue")
                    gs["session_events"].append(f"The Philosophy Arena starts in {domain} [{tier} tier].")

                    await manager.broadcast(session_id, {
                        "type": "game_state",
                        "payload": session
                    })

                    players_list = [p["username"] for p in session["players"]]
                    instruction = (
                        f"The Philosophy Arena begins now. Tier: {tier}. Domain: {domain}. Format: {fmt}. "
                        f"Players: {players_list}. Introduce the arena's philosophical topic/motion and challenge, "
                        f"and ask {first_player} to state or defend their initial position."
                    )

                    await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                    lumi_res = await call_lumi_llm(session, instruction)
                    await manager.broadcast(session_id, {"type": "host_typing", "payload": False})

                    speech = lumi_res.get("speech_text", f"The Philosophy Arena is open. {first_player}, defend your position.")
                    session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                    await manager.broadcast(session_id, {"type": "game_state", "payload": session})

                elif slug == "appreciation-game":
                    gs["phase"] = "OPENING_INVENTORY"
                    gs["session_events"].append("The Appreciation Game starts. Waiting for Opening Inventories.")
                    
                    # Direct Lumi instruction to introduce the game and ask for private hopes
                    instruction = (
                        f"The Appreciation Game starts now. Players: {players_list}. "
                        f"Introduce the game's relational premise and prompt all players to privately submit "
                        f"their Opening Inventory — what they secretly hope has been noticed or appreciated by the room."
                    )

                    await manager.broadcast(session_id, {
                        "type": "game_state",
                        "payload": session
                    })

                    await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                    lumi_res = await call_lumi_llm(session, instruction)
                    await manager.broadcast(session_id, {"type": "host_typing", "payload": False})

                    speech = lumi_res.get("speech_text", "Welcome to The Appreciation Game. Please submit your opening hopes privately.")
                    session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                    await manager.broadcast(session_id, {"type": "game_state", "payload": session})

                elif slug == "game-of-games":
                    await _start_game_of_games_session(session, session_id)


                elif slug == "threadweave":
                    gs["phase"] = "SETUP_MODE"
                    gs["story_segments"] = []
                    gs["pressure_point_used"] = False
                    gs["curveball_used"] = False
                    
                    if "session_events" in gs:
                        gs["session_events"].append("Threadweave session has started.")

                    await manager.broadcast(session_id, {
                        "type": "game_state",
                        "payload": session
                    })

                    players_list = [p["username"] for p in session["players"]]
                    instruction = (
                        f"The game Threadweave starts now. The players are {players_list}. "
                        f"Welcome the group with one evocative sentence setting a storytelling mood. "
                        f"Ask each player their name, then ask if they want Loom mode (Lumi facilitates) or Spindle mode (Lumi co-creates)."
                    )

                    await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                    lumi_res = await call_lumi_llm(session, instruction)
                    await manager.broadcast(session_id, {"type": "host_typing", "payload": False})

                    speech = lumi_res.get("speech_text", "Welcome to Threadweave. What mode shall we play tonight: Loom or Spindle?")
                    session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                    await manager.broadcast(session_id, {"type": "game_state", "payload": session})

                elif slug == "uncharted-horizons":
                    gs["phase"] = "SETUP_CHECKIN"
                    gs["terrain_badges"] = gs.get("terrain_badges", {})
                    gs["terrain"] = ""
                    gs["depth_level"] = "surface"
                    
                    if "session_events" in gs:
                        gs["session_events"].append("Uncharted Horizons session has started.")

                    await manager.broadcast(session_id, {
                        "type": "game_state",
                        "payload": session
                    })

                    players_list = [p["username"] for p in session["players"]]
                    is_solo = len(players_list) == 1
                    
                    if is_solo:
                        instruction = (
                            f"The game Uncharted Horizons starts now. Player: {players_list[0]}. "
                            f"Welcome the player with one quiet, warm sentence setting a reflective tone. "
                            f"Ask their name and one sentence: where are you today?"
                        )
                    else:
                        instruction = (
                            f"The game Uncharted Horizons starts now. Players: {players_list}. "
                            f"Welcome the group with one quiet, warm sentence setting a reflective tone. "
                            f"Ask each player's name and their opening compass reading — where they are and what they're hoping to find in this session."
                        )

                    await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                    lumi_res = await call_lumi_llm(session, instruction)
                    await manager.broadcast(session_id, {"type": "host_typing", "payload": False})

                    speech = lumi_res.get("speech_text", "Welcome to Uncharted Horizons. Let's begin our check-in.")
                    session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                    await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                else:
                    # Generic start for conversational games without a dedicated state machine
                    gs["phase"] = "ACTIVE"
                    if "session_events" in gs:
                        gs["session_events"].append(f"{slug} session has started!")

                    await manager.broadcast(session_id, {
                        "type": "game_state",
                        "payload": session
                    })

                    players_list = [p["username"] for p in session["players"]]
                    instruction = (
                        f"The game '{slug}' starts now. The players are {players_list}. "
                        f"Introduce the game and its premise in your voice as Lumi. "
                        f"Then begin the session by addressing {first_player} first."
                    )

                    await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                    lumi_res = await call_lumi_llm(session, instruction)
                    await manager.broadcast(session_id, {"type": "host_typing", "payload": False})

                    speech = lumi_res.get("speech_text", f"Welcome. Let's begin. {first_player}, let's start with you.")
                    session["current_player_id"] = lumi_res.get("next_player_id") or first_player
                    session["current_round"] = lumi_res.get("round") or 1

                    # Handle Threadweave-specific opening
                    if slug == "threadweave":
                        story_seg = lumi_res.get("story_segment")
                        if story_seg:
                            gs["story_segments"].append({"author": "Lumi", "text": story_seg})

                    session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                    await manager.broadcast(session_id, {"type": "game_state", "payload": session})

            elif msg_type in ("submit_answer", "pass_turn"):
                if session["status"] != "ACTIVE":
                    await websocket.send_json({"type": "error", "message": "Game is not active"})
                    continue

                slug = session["game_slug"]
                gs = session.get("game_state") or {}

                # Callout has its own tight turn-locking — enforce it
                # Callout handler
                if slug == "callout":
                    if msg_type == "pass_turn":
                        await websocket.send_json({"type": "error", "message": "Passing is not allowed in Callout"})
                        continue
                    
                    answer_text = msg_data.get("text", "").strip()
                    if not answer_text:
                        await websocket.send_json({"type": "error", "message": "Response cannot be empty"})
                        continue

                    phase = gs.get("phase", "ROUND_1_PROMPT")
                    players_list = [p["username"] for p in session["players"]]

                    if phase == "ROUND_1_PROMPT":
                        # Collect simultaneous warm-up answers
                        gs["round_data"]["opener_answers"][username] = answer_text
                        gs["session_events"].append(f"{username} answered: '{answer_text}'")

                        all_answered = all(p in gs["round_data"]["opener_answers"] for p in players_list)
                        if all_answered:
                            # Award 1 pt each
                            for p in players_list:
                                gs["scores"][p] = gs["scores"].get(p, 0) + 1

                            gs["phase"] = "REVEAL"
                            session["messages"].append({"role": "user", "sender": "Group", "content": "All warm-up answers submitted."})

                            await manager.broadcast(session_id, {"type": "host_typing", "payload": True})

                            answers_summary = "\n".join(f"  - {p}: '{ans}'" for p, ans in gs["round_data"]["opener_answers"].items())
                            instruction = (
                                f"All players have submitted their Round 1 warm-up answers for the prompt '{gs['round_data']['prompt']}'.\n"
                                f"Answers:\n{answers_summary}\n\n"
                                f"Provide a quick, witty, dry observational reaction to each. "
                                f"Maximum 4 sentences total."
                            )
                            lumi_res = await call_lumi_llm(session, instruction)
                            await manager.broadcast(session_id, {"type": "host_typing", "payload": False})

                            speech = lumi_res.get("speech_text", "Round 1 warm-up completed.")
                            session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        else:
                            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        continue

                    elif phase in ("HOT_SEAT_PROMPT", "RAPID_PROMPT", "FINAL_PROMPT"):
                        # Target player submitting their private answer
                        target = gs["round_data"].get("target_player")
                        if username != target:
                            await websocket.send_json({"type": "error", "message": f"Only the target player {target} can submit the private answer"})
                            continue

                        gs["round_data"]["private_answer"] = answer_text
                        gs["round_data"]["correct_answer"] = answer_text
                        gs["session_events"].append(f"{username} submitted their private answer.")

                        current_round = session["current_round"]
                        if current_round == 2:
                            gs["phase"] = "HOT_SEAT_GUESSING"
                        elif current_round == 3:
                            gs["phase"] = "RAPID_GUESSING"
                        elif current_round == 5:
                            gs["phase"] = "FINAL_GUESSING"

                        await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                        instruction = (
                            f"The target player {username} has submitted their private answer to the question: '{gs['round_data']['prompt']}'.\n"
                            f"Confirm receipt with a short, dry, suspenseful prompt inviting all OTHER players to submit their guesses now."
                        )
                        lumi_res = await call_lumi_llm(session, instruction)
                        await manager.broadcast(session_id, {"type": "host_typing", "payload": False})

                        speech = lumi_res.get("speech_text", f"{username} has locked in their answer. Everyone else, submit your guesses!")
                        session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                        await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        continue

                    else:
                        await websocket.send_json({"type": "error", "message": "Please submit your guess/vote using the designated input buttons."})
                        continue

                # Drift handler
                if slug == "drift":
                    if msg_type == "pass_turn":
                        await websocket.send_json({"type": "error", "message": "Passing is not allowed in Drift"})
                        continue

                    answer_text = msg_data.get("text", "").strip()
                    if not answer_text:
                        await websocket.send_json({"type": "error", "message": "Response cannot be empty"})
                        continue
                        
                    phase = gs.get("phase", "SETUP_FEELINGS")
                    players_list = [p["username"] for p in session["players"]]
                    
                    if phase == "SETUP_FEELINGS":
                        # Collect feelings simultaneously
                        if "players_state" not in gs:
                            gs["players_state"] = {}
                        if username not in gs["players_state"]:
                            gs["players_state"][username] = {}
                        gs["players_state"][username]["feeling"] = answer_text
                        
                        all_submitted = all(p in gs["players_state"] and "feeling" in gs["players_state"][p] for p in players_list)
                        
                        if all_submitted:
                            gs["phase"] = "SETUP_MOOD"
                            session["messages"].append({"role": "user", "sender": "Group", "content": "All players shared their feelings."})
                            
                            await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                            
                            feelings_summary = "\n".join(f"  - {p}: '{gs['players_state'][p]['feeling']}'" for p in players_list)
                            instruction = (
                                f"All players have shared how they are feeling right now:\n{feelings_summary}\n\n"
                                f"Acknowledge their feelings with warmth and empathy (max 3 sentences). "
                                f"Then ask the group to vote for the mood they want for this session: Playful, Reflective, Wild, or Tender."
                            )
                            lumi_res = await call_lumi_llm(session, instruction)
                            await manager.broadcast(session_id, {"type": "host_typing", "payload": False})
                            
                            speech = lumi_res.get("speech_text", "Thank you for sharing. What mood should we drift into tonight?")
                            session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        else:
                            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        continue

                    elif phase == "SETUP_MOOD":
                        # Collect mood votes simultaneously
                        if "mood_votes" not in gs:
                            gs["mood_votes"] = {}
                        gs["mood_votes"][username] = answer_text
                        
                        all_voted = all(p in gs["mood_votes"] for p in players_list)
                        if all_voted:
                            # Calculate winning mood
                            votes = list(gs["mood_votes"].values())
                            from collections import Counter
                            vote_counts = Counter(votes)
                            most_common = vote_counts.most_common()
                            winning_mood = most_common[0][0]
                            
                            session["mood"] = winning_mood
                            session["current_round"] = 1
                            gs["phase"] = "ROUND_1"
                            # Set first player
                            first_player = players_list[0]
                            session["current_player_id"] = first_player
                            
                            session["messages"].append({"role": "user", "sender": "Group", "content": f"The voted mood is {winning_mood}."})
                            
                            await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                            instruction = (
                                f"The group has chosen the {winning_mood} mood.\n"
                                f"Introduce the first round 'The Spark' (1 sensory question per player, keep it light) in exactly one sentence. "
                                f"Then ask the very first Spark question to the active player {first_player}."
                            )
                            lumi_res = await call_lumi_llm(session, instruction)
                            await manager.broadcast(session_id, {"type": "host_typing", "payload": False})
                            
                            speech = lumi_res.get("speech_text", f"The {winning_mood} mood it is. Let's start The Spark. {first_player}, here is your question.")
                            session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        else:
                            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        continue

                    elif phase == "ROUND_4":
                        # The Collective - simultaneous answers
                        if "collective_answers" not in gs:
                            gs["collective_answers"] = {}
                        gs["collective_answers"][username] = answer_text
                        
                        all_answered = all(p in gs["collective_answers"] for p in players_list)
                        if all_answered:
                            session["messages"].append({"role": "user", "sender": "Group", "content": "All collective answers submitted."})
                            
                            await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                            
                            answers_summary = "\n".join(f"  - {p}: '{ans}'" for p, ans in gs["collective_answers"].items())
                            closer_player = players_list[0]
                            
                            instruction = (
                                f"All players have submitted their Round 4 Collective answers.\n"
                                f"Answers:\n{answers_summary}\n\n"
                                f"Reveal their answers together, comment on any unexpected connections or alignments. "
                                f"Then officially transition to Round 5 'The Closer', and ask the final big question directly to {closer_player}."
                            )
                            lumi_res = await call_lumi_llm(session, instruction)
                            await manager.broadcast(session_id, {"type": "host_typing", "payload": False})
                            
                            speech = lumi_res.get("speech_text", f"Fascinating. Now onto Round 5. {closer_player}, here is the final question.")
                            session["current_round"] = 5
                            gs["phase"] = "ROUND_5"
                            session["current_player_id"] = closer_player
                            gs["collective_answers"] = {} # clear for neatness
                            
                            session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        else:
                            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        continue

                    else:
                        # Sequential rounds (1, 2, 3, 5)
                        if session.get("current_player_id") != username:
                            await websocket.send_json({"type": "error", "message": "It is not your turn"})
                            continue
                            
                        session["messages"].append({"role": "user", "sender": username, "content": answer_text})
                        await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        
                        await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                        
                        instruction = (
                            f"Player {username} answered: '{answer_text}'.\n"
                            f"Respond to their answer naturally (don't over-validate, just vibe). "
                            f"Then, check if there are more players to ask in Round {session.get('current_round', 1)}. "
                            f"If yes, direct the next question to the next player. "
                            f"If everyone has answered for this round, transition smoothly to the next round. "
                            f"Make sure to output the correct 'next_player_id' and 'round' number in the JSON structure. "
                            f"If this was Round 5 and everyone has answered, output 'concluded': true and provide the 'drift_log'."
                        )
                        lumi_res = await call_lumi_llm(session, instruction)
                        await manager.broadcast(session_id, {"type": "host_typing", "payload": False})
                        
                        game_data = lumi_res.get("game_specific_data", {})
                        
                        next_player_id = game_data.get("next_player_id")
                        new_round = game_data.get("round", session.get("current_round", 1))
                        
                        if game_data.get("twist_offered"):
                            gs["twist_offered"] = True
                            
                        if next_player_id:
                            session["current_player_id"] = next_player_id
                            
                        if new_round:
                            session["current_round"] = new_round
                            if new_round == 4:
                                gs["phase"] = "ROUND_4"
                            else:
                                gs["phase"] = f"ROUND_{new_round}"
                                
                        if game_data.get("concluded"):
                            session["concluded"] = True
                            session["status"] = "COMPLETED"
                            gs["phase"] = "COMPLETED"
                            session["drift_log"] = game_data.get("drift_log")
                            
                        speech = lumi_res.get("speech_text", "Got it.")
                        session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                        await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        continue

                # Threadweave handler
                if slug == "threadweave":
                    if msg_type == "pass_turn":
                        phase = gs.get("phase", "SETUP_MODE")
                        if phase in ("SETUP_MODE", "SETUP_TEXTURE"):
                            await websocket.send_json({"type": "error", "message": "Passing is not allowed during setup"})
                            continue
                    
                    answer_text = msg_data.get("text", "").strip()
                    if msg_type != "pass_turn" and not answer_text:
                        await websocket.send_json({"type": "error", "message": "Response cannot be empty"})
                        continue

                    phase = gs.get("phase", "SETUP_MODE")
                    players_list = [p["username"] for p in session["players"]]

                    if phase == "SETUP_MODE":
                        if "mode_votes" not in gs:
                            gs["mode_votes"] = {}
                        gs["mode_votes"][username] = answer_text
                        
                        all_voted = all(p in gs["mode_votes"] for p in players_list)
                        if all_voted:
                            votes = [v.lower() for v in gs["mode_votes"].values()]
                            spindle_count = sum(1 for v in votes if "spindle" in v)
                            loom_count = sum(1 for v in votes if "loom" in v)
                            
                            chosen_mode = "spindle" if spindle_count >= loom_count else "loom"
                            gs["mode"] = chosen_mode
                            gs["phase"] = "SETUP_TEXTURE"
                            
                            session["messages"].append({"role": "user", "sender": "Group", "content": f"Mode chosen: {chosen_mode.capitalize()}"})
                            
                            await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                            instruction = (
                                f"The group has chosen {chosen_mode.capitalize()} mode.\n"
                                f"Now ask them: 'What kind of story are you in the mood for tonight?' "
                                f"Offer the palette: Warm and human / Weird and wonderful / Dark and gritty / Sci-fi and speculative / Thriller and tense / Hybrid."
                            )
                            lumi_res = await call_lumi_llm(session, instruction)
                            await manager.broadcast(session_id, {"type": "host_typing", "payload": False})
                            
                            speech = lumi_res.get("speech_text", f"{chosen_mode.capitalize()} mode it is. What kind of story are we telling tonight?")
                            session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        else:
                            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        continue

                    elif phase == "SETUP_TEXTURE":
                        if "texture_votes" not in gs:
                            gs["texture_votes"] = {}
                        gs["texture_votes"][username] = answer_text
                        
                        all_voted = all(p in gs["texture_votes"] for p in players_list)
                        if all_voted:
                            chosen_texture = " / ".join(gs["texture_votes"].values())
                            gs["texture"] = chosen_texture
                            gs["phase"] = "STORYTELLING"
                            
                            first_player = players_list[0]
                            session["current_player_id"] = first_player
                            
                            session["messages"].append({"role": "user", "sender": "Group", "content": f"Texture chosen: {chosen_texture}"})
                            
                            await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                            instruction = (
                                f"The group has chosen their texture: {chosen_texture}.\n"
                                f"Write 'The Seed' — one single opening line that captures this mood perfectly. "
                                f"Then hand over the story to {first_player} to continue."
                            )
                            lumi_res = await call_lumi_llm(session, instruction)
                            await manager.broadcast(session_id, {"type": "host_typing", "payload": False})
                            
                            game_data = lumi_res.get("game_specific_data", {})
                            seed = game_data.get("story_segment")
                            if seed:
                                gs["story_segments"].append({"author": "Lumi", "text": seed})
                                
                            speech = lumi_res.get("speech_text", "Let the story begin.")
                            session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        else:
                            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        continue

                    elif phase == "STORYTELLING":
                        if session.get("current_player_id") != username:
                            await websocket.send_json({"type": "error", "message": "It is not your turn"})
                            continue
                            
                        user_message = "[Passed]" if msg_type == "pass_turn" else answer_text
                        session["messages"].append({"role": "user", "sender": username, "content": user_message})
                        
                        if msg_type != "pass_turn" and "redirect" not in answer_text.lower():
                            gs["story_segments"].append({"author": username, "text": answer_text})
                            gs["session_events"].append(f"{username} added: '{answer_text[:80]}...'")
                        elif "redirect" in answer_text.lower():
                            gs["session_events"].append(f"{username} called for a redirect.")
                            
                        await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        
                        await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                        
                        instruction = (
                            f"Player {username} added to the story: '{user_message}'.\n"
                            f"Evaluate if you should take a turn (if Spindle mode), use a Pressure Point, or a Curveball. "
                            f"If not, gently acknowledge and pass to the next player. "
                            f"Remember to set 'next_player_id'. If concluding, set 'concluded': true and provide 'threadweave_reflection'."
                        )
                        lumi_res = await call_lumi_llm(session, instruction)
                        await manager.broadcast(session_id, {"type": "host_typing", "payload": False})
                        
                        game_data = lumi_res.get("game_specific_data", {})
                        
                        lumi_segment = game_data.get("story_segment")
                        if lumi_segment:
                            gs["story_segments"].append({"author": "Lumi", "text": lumi_segment})
                            
                        if game_data.get("curveball_fired"):
                            gs["curveball_used"] = True
                            
                        if game_data.get("pressure_point"):
                            gs["pressure_point_used"] = True
                            
                        next_player_id = game_data.get("next_player_id")
                        if next_player_id:
                            session["current_player_id"] = next_player_id
                            
                        if game_data.get("concluded"):
                            session["concluded"] = True
                            session["status"] = "COMPLETED"
                            gs["phase"] = "COMPLETED"
                            
                            reflection = game_data.get("threadweave_reflection")
                            if reflection:
                                gs["story_segments"].append({"author": "Lumi", "text": f"[Threadweave Reflection]\n{reflection}"})
                            session["drift_log"] = reflection
                            
                        speech = lumi_res.get("speech_text", "The story deepens.")
                        session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                        await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        continue

                # Uncharted Horizons handler
                if slug == "uncharted-horizons":
                    phase = gs.get("phase", "SETUP_CHECKIN")
                    is_pass = msg_type == "pass_turn"
                    answer_text = "[Passed]" if is_pass else msg_data.get("text", "").strip()
                    
                    if not is_pass and not answer_text:
                        await websocket.send_json({"type": "error", "message": "Response cannot be empty"})
                        continue
                        
                    players_list = [p["username"] for p in session["players"]]
                    is_solo = len(players_list) == 1
                    
                    if phase == "SETUP_CHECKIN":
                        if is_pass:
                            await websocket.send_json({"type": "error", "message": "You must check in."})
                            continue
                            
                        if "checkins" not in gs:
                            gs["checkins"] = {}
                        gs["checkins"][username] = answer_text
                        
                        all_checked_in = all(p in gs["checkins"] for p in players_list)
                        if all_checked_in:
                            gs["phase"] = "SETUP_TERRAIN"
                            session["messages"].append({"role": "user", "sender": "Group", "content": "Check-ins completed."})
                            
                            await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                            instruction = (
                                f"All players have checked in.\n"
                                f"Now ask them which Terrain they want to explore: Dream, Bucket List, Motivation, Legacy, Creation, or Frontier. "
                                f"Feel free to propose one based on what they just shared."
                            )
                            lumi_res = await call_lumi_llm(session, instruction)
                            await manager.broadcast(session_id, {"type": "host_typing", "payload": False})
                            
                            speech = lumi_res.get("speech_text", "Which terrain shall we explore today?")
                            session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        else:
                            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        continue
                        
                    elif phase == "SETUP_TERRAIN":
                        if is_pass:
                            await websocket.send_json({"type": "error", "message": "You must choose a terrain."})
                            continue
                            
                        if "terrain_votes" not in gs:
                            gs["terrain_votes"] = {}
                        gs["terrain_votes"][username] = answer_text
                        
                        all_voted = all(p in gs["terrain_votes"] for p in players_list)
                        if all_voted:
                            chosen_terrain = " / ".join(gs["terrain_votes"].values())
                            gs["terrain"] = chosen_terrain
                            gs["phase"] = "JOURNEY"
                            
                            session["messages"].append({"role": "user", "sender": "Group", "content": f"Terrain chosen: {chosen_terrain}"})
                            
                            await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                            instruction = (
                                f"The group has chosen their terrain: {chosen_terrain}.\n"
                                f"Use 'The Question' move to open the journey. Address {players_list[0]} if multiplayer."
                            )
                            lumi_res = await call_lumi_llm(session, instruction)
                            await manager.broadcast(session_id, {"type": "host_typing", "payload": False})
                            
                            speech = lumi_res.get("speech_text", "Let us begin our journey.")
                            
                            next_player_id = lumi_res.get("next_player_id")
                            if next_player_id:
                                session["current_player_id"] = next_player_id
                                
                            session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        else:
                            await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        continue
                        
                    elif phase == "JOURNEY":
                        if session.get("current_player_id") and session.get("current_player_id") != username:
                            await websocket.send_json({"type": "error", "message": "It is not your turn"})
                            continue
                            
                        user_message = "[Passed / Not Today]" if is_pass else answer_text
                        session["messages"].append({"role": "user", "sender": username, "content": user_message})
                        
                        if not is_pass:
                            gs["session_events"].append(f"{username} shared: '{answer_text[:100]}'")
                        else:
                            gs["session_events"].append(f"{username} passed.")
                            
                        await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                        
                        instruction = (
                            f"Player {username} shared: '{user_message}'.\n"
                            f"Evaluate which of The Seven Moves to use next (The Question, The Dig, The Mirror, The Challenge, The Invitation, The Connection, The Pause).\n"
                            f"If they passed, acknowledge quietly and move on.\n"
                            f"Remember to set 'next_player_id'. If it is time to map the horizon, set 'concluded': true and provide the 'horizon_map'."
                        )
                        lumi_res = await call_lumi_llm(session, instruction)
                        await manager.broadcast(session_id, {"type": "host_typing", "payload": False})
                        
                        badge_player = lumi_res.get("terrain_badge_awarded")
                        if badge_player:
                            terrain = gs.get("terrain", "unknown")
                            gs["terrain_badges"][badge_player] = gs["terrain_badges"].get(badge_player, []) + [terrain]
                            
                        next_player_id = lumi_res.get("next_player_id")
                        if next_player_id:
                            session["current_player_id"] = next_player_id
                            
                        if lumi_res.get("concluded"):
                            session["concluded"] = True
                            session["status"] = "COMPLETED"
                            gs["phase"] = "COMPLETED"
                            session["current_player_id"] = None
                            
                            hmap = lumi_res.get("horizon_map")
                            if hmap:
                                session["drift_log"] = hmap
                                
                        speech = lumi_res.get("speech_text", "I hear you.")
                        session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                        await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                        continue

                if slug == "game-of-games":
                    if msg_type == "pass_turn":
                        await websocket.send_json({"type": "error", "message": "Passing is not allowed in Game of Games"})
                        continue
                    await _handle_game_of_games_choice(session, session_id, username, msg_data, websocket)
                    continue


                # Roleswap: only the active portraying player submits answers; scoring is separate
                if slug == "roleswap" and session["current_player_id"] != username:
                    await websocket.send_json({"type": "error", "message": "It is not your turn to portray"})
                    continue

                # For all other games, turn-lock is enforced unless game is solo
                if slug != "uncharted-horizons" and slug not in NEW_GAME_SLUGS:
                    if session["current_player_id"] != username:
                        await websocket.send_json({"type": "error", "message": "It is not your turn"})
                        continue

                # ---- Generic conversational turn handler ----
                is_pass = (msg_type == "pass_turn")
                answer_text = "[Passed]" if is_pass else msg_data.get("text", "").strip()

                if not is_pass and not answer_text:
                    await websocket.send_json({"type": "error", "message": "Response cannot be empty"})
                    continue

                session["messages"].append({"role": "user", "sender": username, "content": answer_text})

                # Game-specific state updates on answer
                if slug == "uncharted-horizons" and not is_pass:
                    gs["session_events"].append(f"{username} shared: '{answer_text[:100]}'")

                elif slug == "roleswap" and not is_pass:
                    target_player = gs["assignments"].get(username, "unknown")
                    gs["session_events"].append(f"{username} portrayed {target_player}: '{answer_text[:100]}'")
                elif slug == "odyssey-mind" and not is_pass:
                    gs["session_events"].append(f"{username} answered: '{answer_text[:100]}'")
                elif slug == "philosophy-arena" and not is_pass:
                    gs["session_events"].append(f"{username} argued: '{answer_text[:100]}'")
                elif slug == "appreciation-game" and not is_pass:
                    gs["session_events"].append(f"{username} shared appreciation: '{answer_text[:100]}'")

                await manager.broadcast(session_id, {"type": "game_state", "payload": session})

                # Build LLM instruction
                players = [p["username"] for p in session["players"]]
                current_idx = players.index(username) if username in players else 0
                fallback_next_player = players[(current_idx + 1) % len(players)]
                fallback_round = session["current_round"]
                if current_idx == len(players) - 1:
                    fallback_round += 1

                if is_pass:
                    instruction = f"Player '{username}' passed. Acknowledge gracefully and move to the next player."
                if slug == "uncharted-horizons":
                    instruction = (
                        f"'{username}' shared: '{answer_text}'. "
                        f"Acknowledge it genuinely (not with hollow praise — be specific). "
                        f"Then ask a deeper follow-up question, or move to the next player if ready."
                    )
                elif slug == "roleswap":
                    target_player = gs["assignments"].get(username, "someone")
                    instruction = (
                        f"'{username}' portrayed '{target_player}' with: '{answer_text}'. "
                        f"Give a brief Lumi observation about the portrayal. "
                        f"Then ask '{target_player}' to score the portrayal on Instinct, Voice, and Depth (0-10 each). "
                        f"Set scoring_request to '{target_player}'."
                    )
                    gs["pending_score_from"] = target_player
                elif slug == "odyssey-mind":
                    realm = gs.get("realm", "synthesis")
                    realm_type = gs.get("realm_type", "trial")
                    instruction = (
                        f"'{username}' answered: '{answer_text}'. "
                        f"Evaluate their response/solution in character. Update scores, unified mind attributes, ranks, or levels accordingly. "
                        f"Then present the next challenge or story beat in realm '{realm}' of format '{realm_type}' to the next player: {fallback_next_player}."
                    )
                elif slug == "philosophy-arena":
                    tier = gs.get("tier", "agora")
                    domain = gs.get("domain", "ethics")
                    fmt = gs.get("challenge_format", "socratic_dialogue")
                    instruction = (
                        f"'{username}' argued/responded: '{answer_text}'. "
                        f"Examine and evaluate their argument under {tier} tier rules. Expose fallacies, challenge premises. "
                        f"Introduce relevant Agora vocabulary if tier is agora. Summon historical philosopher in first person if unlocked. "
                        f"Then pose the next objection or prompt to the next player: {fallback_next_player}."
                    )
                elif slug == "appreciation-game":
                    instruction = (
                        f"'{username}' submitted this appreciation: '{answer_text}'. "
                        f"Check if it is generic/vague (e.g. 'you are nice'). If so, set 'generic_intercepted' to true "
                        f"and instruct them to rewrite it with highly specific observations. "
                        f"If specific, accept it and prompt the next player: {fallback_next_player} or advance to next round."
                    )
                else:
                    instruction = (
                        f"Player '{username}' answered: '{answer_text}'. "
                        f"Respond and prompt the next player."
                    )

                await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                lumi_res = await call_lumi_llm(session, instruction)
                await manager.broadcast(session_id, {"type": "host_typing", "payload": False})

                speech = lumi_res.get("speech_text", f"Thank you. {fallback_next_player}, your turn.")
                next_p = lumi_res.get("next_player_id") or fallback_next_player
                if next_p not in players:
                    next_p = fallback_next_player

                concluded = lumi_res.get("concluded", False)
                round_val = lumi_res.get("round") or fallback_round

                if round_val > 5 or concluded:
                    concluded = True
                    round_val = 5

                session["current_player_id"] = None if concluded else next_p
                session["current_round"] = round_val
                session["concluded"] = concluded
                session["twist_offered"] = lumi_res.get("twist_offered", False)

                # Game-specific outcome storage
                if slug == "uncharted-horizons":
                    badge_player = lumi_res.get("terrain_badge_awarded")
                    if badge_player:
                        terrain = gs.get("terrain", "unknown")
                        gs["terrain_badges"][badge_player] = gs["terrain_badges"].get(badge_player, []) + [terrain]
                    if concluded and lumi_res.get("horizon_map"):
                        session["drift_log"] = lumi_res["horizon_map"]

                elif slug == "roleswap":
                    sc_level = lumi_res.get("current_scenario_level")
                    if sc_level is not None:
                        gs["scenario_level"] = sc_level
                    if lumi_res.get("curveball_used"):
                        gs["curveball_used"] = True
                    if lumi_res.get("is_mirror_round"):
                        gs["is_mirror_round"] = True
                    if lumi_res.get("perfect_swap_awarded"):
                        gs["perfect_swap_awarded"] = True
                    if concluded and lumi_res.get("swap_portraits"):
                        session["drift_log"] = str(lumi_res["swap_portraits"])

                elif slug == "odyssey-mind":
                    scores_delta = lumi_res.get("scores_delta") or {}
                    for player_name, delta in scores_delta.items():
                        if player_name in gs["scores"]:
                            gs["scores"][player_name] = max(0, gs["scores"][player_name] + int(delta))
                    attr_delta = lumi_res.get("attributes_delta") or {}
                    for attr, val in attr_delta.items():
                        if attr in gs["attributes"]:
                            gs["attributes"][attr] += int(val)
                    new_abilities = lumi_res.get("abilities_unlocked")
                    if new_abilities:
                        for ab in new_abilities:
                            if ab not in gs["abilities"]:
                                gs["abilities"].append(ab)
                    new_rank = lumi_res.get("rank_update")
                    if new_rank:
                        gs["rank"] = new_rank
                    if concluded and lumi_res.get("expedition_log_entry"):
                        gs["expedition_log"].append(lumi_res["expedition_log_entry"])
                        session["drift_log"] = lumi_res["expedition_log_entry"]

                elif slug == "philosophy-arena":
                    scores_delta = lumi_res.get("scores_delta") or {}
                    for player_name, delta in scores_delta.items():
                        if player_name in gs["scores"]:
                            gs["scores"][player_name] = max(0, gs["scores"][player_name] + int(delta))
                    vocab_added = lumi_res.get("agora_vocab_added")
                    if vocab_added:
                        for vc in vocab_added:
                            if vc not in gs["agora_vocabulary"]:
                                gs["agora_vocabulary"].append(vc)
                    new_rank = lumi_res.get("philosophical_rank")
                    if new_rank:
                        gs["philosophical_rank"] = new_rank
                    witness_active = lumi_res.get("historical_witness_active")
                    if witness_active is not None:
                        gs["historical_witness_active"] = witness_active
                    new_abilities = lumi_res.get("abilities_unlocked")
                    if new_abilities:
                        for ab in new_abilities:
                            if ab not in gs["abilities"]:
                                gs["abilities"].append(ab)
                    if concluded:
                        session["drift_log"] = f"Philosophy Arena completed. Domain: {gs.get('domain')}. Rank: {gs.get('philosophical_rank')}"

                elif slug == "appreciation-game":
                    intercepted = lumi_res.get("generic_intercepted", False)
                    if intercepted:
                        # Vague praise was rejected, remove last user message so they can re-try
                        if session["messages"] and session["messages"][-1]["role"] == "user":
                            session["messages"].pop()
                    hopes_eval = lumi_res.get("hope_met_evaluation")
                    if hopes_eval:
                        for player_name, h_data in hopes_eval.items():
                            if h_data.get("met"):
                                gs["hopes_met_count"] += 1
                        if gs["hopes_met_count"] >= 4:
                            gs["seen_marker_awarded"] = True
                    if concluded and lumi_res.get("appreciation_portraits"):
                        session["drift_log"] = str(lumi_res["appreciation_portraits"])

                elif concluded:
                    session["drift_log"] = lumi_res.get("drift_log") or f"Session of {slug} completed."

                if concluded:
                    session["status"] = "COMPLETED"

                session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                await manager.broadcast(session_id, {"type": "game_state", "payload": session})

            elif msg_type == "submit_peer_score":
                # Turncoat: players score each other's arguments
                if session["status"] != "ACTIVE" or session["game_slug"] != "turncoat":
                    await websocket.send_json({"type": "error", "message": "Cannot submit peer score now"})
                    continue

                gs = session.get("game_state") or {}
                scored_player = msg_data.get("scored_player", "")
                peer_scores = msg_data.get("scores", {})

                if scored_player and peer_scores:
                    if scored_player not in gs["peer_scores"]:
                        gs["peer_scores"][scored_player] = {}
                    gs["peer_scores"][scored_player][username] = peer_scores
                    gs["session_events"].append(f"{username} peer-scored {scored_player}: {peer_scores}")

                await manager.broadcast(session_id, {"type": "game_state", "payload": session})

            elif msg_type == "submit_portrayal_score":
                # Roleswap: the target player scores the portrayer
                if session["status"] != "ACTIVE" or session["game_slug"] != "roleswap":
                    await websocket.send_json({"type": "error", "message": "Cannot submit portrayal score now"})
                    continue

                gs = session.get("game_state") or {}
                expected_scorer = gs.get("pending_score_from")
                if username != expected_scorer:
                    await websocket.send_json({"type": "error", "message": "It is not your turn to score"})
                    continue

                scores_in = msg_data.get("scores", {})
                portrayer = None
                for p, target in gs["assignments"].items():
                    if target == username:
                        portrayer = p
                        break

                if portrayer and scores_in:
                    gs["scores"][portrayer] = scores_in
                    gs["session_events"].append(f"{username} scored {portrayer}'s portrayal: {scores_in}")

                    instinct = scores_in.get("instinct", 0)
                    voice = scores_in.get("voice", 0)
                    depth = scores_in.get("depth", 0)
                    if instinct >= 9.5 and voice >= 9.5 and depth >= 9.5 and not gs["perfect_swap_awarded"]:
                        gs["perfect_swap_awarded"] = True
                        gs["session_events"].append(f"PERFECT SWAP awarded to {portrayer}!")

                gs["pending_score_from"] = None

                # Move to next scenario level or next portrayer
                players = [p["username"] for p in session["players"]]
                current_idx = players.index(session["current_player_id"]) if session["current_player_id"] in players else 0
                next_portrayer = players[(current_idx + 1) % len(players)]
                session["current_player_id"] = next_portrayer

                await manager.broadcast(session_id, {"type": "game_state", "payload": session})

                next_target = gs["assignments"].get(next_portrayer, "someone")
                instruction = (
                    f"{username} scored {portrayer if portrayer else 'the portrayer'}. "
                    f"Briefly acknowledge the scores. Then introduce the next portrayal: "
                    f"{next_portrayer} now plays {next_target}. Introduce the next scenario at level {gs.get('scenario_level', 0)}."
                )

                await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                lumi_res = await call_lumi_llm(session, instruction)
                await manager.broadcast(session_id, {"type": "host_typing", "payload": False})

                speech = lumi_res.get("speech_text", f"Next up: {next_portrayer} becomes {next_target}.")
                new_level = lumi_res.get("current_scenario_level")
                if new_level is not None:
                    gs["scenario_level"] = new_level
                if lumi_res.get("is_mirror_round"):
                    gs["is_mirror_round"] = True

                concluded = lumi_res.get("concluded", False)
                if concluded:
                    session["concluded"] = True
                    session["status"] = "COMPLETED"
                    if lumi_res.get("swap_portraits"):
                        session["drift_log"] = str(lumi_res["swap_portraits"])

                session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                await manager.broadcast(session_id, {"type": "game_state", "payload": session})

            elif msg_type == "submit_opening_inventory":
                if session["game_slug"] != "appreciation-game":
                    await websocket.send_json({"type": "error", "message": "Invalid game for opening inventory"})
                    continue

                gs = session.get("game_state") or {}
                if gs.get("phase") != "OPENING_INVENTORY":
                    await websocket.send_json({"type": "error", "message": "Opening inventory phase is not active"})
                    continue

                hope_text = msg_data.get("text", "").strip()
                if not hope_text:
                    await websocket.send_json({"type": "error", "message": "Hope text cannot be empty"})
                    continue

                gs["opening_inventory"][username] = hope_text
                gs["session_events"].append(f"{username} submitted their Opening Inventory hope.")

                players_list = [p["username"] for p in session["players"]]
                all_submitted = all(p in gs["opening_inventory"] for p in players_list)

                if all_submitted:
                    gs["phase"] = "ACTIVE"
                    session["status"] = "ACTIVE"
                    session["current_round"] = 2  # Rounds: 2 (The Specific), 3 (The Witnessed), 4 (The Return), 5 (The Resolution)
                    first_player = players_list[0]
                    session["current_player_id"] = first_player

                    await manager.broadcast(session_id, {"type": "game_state", "payload": session})

                    # Prompt Lumi to introduce Round 2 (The Specific) and address the first player
                    instruction = (
                        f"All players have submitted their private hopes. Transition to Round 2 (The Specific). "
                        f"Acknowledge the transition, introduce the premise of Round 2 (directed specific appreciation), "
                        f"and prompt {first_player} to share a specific appreciation for someone else in the room."
                    )

                    await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                    lumi_res = await call_lumi_llm(session, instruction)
                    await manager.broadcast(session_id, {"type": "host_typing", "payload": False})

                    speech = lumi_res.get("speech_text", f"All hopes recorded. Let's move to Round 2. {first_player}, who do you appreciate specifically?")
                    session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                    await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                else:
                    # Still waiting for other players
                    await manager.broadcast(session_id, {"type": "game_state", "payload": session})


            elif msg_type == "use_veto":
                if session["status"] != "ACTIVE" or session["game_slug"] != "callout":
                    await websocket.send_json({"type": "error", "message": "Cannot use veto now"})
                    continue
                
                vetos = session["game_state"]["vetos_used"]
                if vetos.get(username):
                    await websocket.send_json({"type": "error", "message": "You have already used your veto"})
                    continue
                
                vetos[username] = True
                session["game_state"]["session_events"].append(f"{username} used their Veto.")
                
                current_round = session["current_round"]
                target = session["game_state"]["round_data"]["target_player"] or username
                
                instruction = (
                    f"Player {username} used their veto. Make a quick, witty, slightly dry remark acknowledging this veto, "
                    f"and immediately generate a NEW prompt/question for {target} for Round {current_round}. "
                    f"Put the new question in 'generated_prompt'."
                )
                await call_lumi_and_broadcast(session, session_id, instruction)

            elif msg_type == "submit_private_answer":
                if session["status"] != "ACTIVE" or session["game_slug"] != "callout":
                    await websocket.send_json({"type": "error", "message": "Cannot submit private answer now"})
                    continue
                
                target = session["game_state"]["round_data"]["target_player"]
                if username != target:
                    await websocket.send_json({"type": "error", "message": "Only the target player can submit the private answer"})
                    continue
                
                answer_text = msg_data.get("text", "").strip()
                if not answer_text:
                    await websocket.send_json({"type": "error", "message": "Answer cannot be empty"})
                    continue
                
                session["game_state"]["round_data"]["private_answer"] = answer_text
                session["game_state"]["round_data"]["correct_answer"] = answer_text
                
                current_round = session["current_round"]
                if current_round == 2:
                    session["game_state"]["phase"] = "HOT_SEAT_GUESSING"
                elif current_round == 3:
                    session["game_state"]["phase"] = "RAPID_SUBMITTING"
                elif current_round == 4:
                    session["game_state"]["phase"] = "BLUFF_SUBMITTING_FAKE"
                elif current_round == 5:
                    session["game_state"]["phase"] = "FINAL_GUESSING"
                    
                session["game_state"]["session_events"].append(f"{target} submitted their private answer.")
                
                await manager.broadcast(session_id, {
                    "type": "game_state",
                    "payload": session
                })

            elif msg_type == "submit_guess":
                if session["status"] != "ACTIVE" or session["game_slug"] != "callout":
                    await websocket.send_json({"type": "error", "message": "Cannot submit guess now"})
                    continue
                
                phase = session["game_state"]["phase"]
                target = session["game_state"]["round_data"]["target_player"]
                
                if username == target:
                    await websocket.send_json({"type": "error", "message": "Target player cannot guess"})
                    continue
                
                guess_text = msg_data.get("text", "").strip()
                if not guess_text:
                    await websocket.send_json({"type": "error", "message": "Guess cannot be empty"})
                    continue
                
                session["game_state"]["round_data"]["guesses"][username] = guess_text
                import time
                session["game_state"]["round_data"]["timestamps"][username] = time.time()
                
                players = [p["username"] for p in session["players"]]
                guessers = [p for p in players if p != target]
                
                if all(g in session["game_state"]["round_data"]["guesses"] for g in guessers):
                    await reveal_and_score_guessing_round(session, session_id)
                else:
                    await manager.broadcast(session_id, {
                        "type": "game_state",
                        "payload": session
                    })

            elif msg_type == "submit_bluff":
                if session["status"] != "ACTIVE" or session["game_slug"] != "callout":
                    await websocket.send_json({"type": "error", "message": "Cannot submit bluff now"})
                    continue
                
                target = session["game_state"]["round_data"]["target_player"]
                if username == target:
                    await websocket.send_json({"type": "error", "message": "Target player cannot submit a bluff"})
                    continue
                
                bluff_text = msg_data.get("text", "").strip()
                if not bluff_text:
                    await websocket.send_json({"type": "error", "message": "Bluff cannot be empty"})
                    continue
                
                session["game_state"]["round_data"]["bluffs"][username] = bluff_text
                
                players = [p["username"] for p in session["players"]]
                bluffers = [p for p in players if p != target]
                
                if all(b in session["game_state"]["round_data"]["bluffs"] for b in bluffers):
                    import random
                    choices = []
                    choices.append({
                        "text": session["game_state"]["round_data"]["private_answer"],
                        "creator": target,
                        "is_correct": True
                    })
                    for creator, text in session["game_state"]["round_data"]["bluffs"].items():
                        choices.append({
                            "text": text,
                            "creator": creator,
                            "is_correct": False
                        })
                    random.shuffle(choices)
                    session["game_state"]["round_data"]["bluff_options"] = choices
                    session["game_state"]["phase"] = "BLUFF_VOTING"
                    session["game_state"]["session_events"].append("All bluffs submitted. Shuffling options and starting Bluff voting.")
                    
                await manager.broadcast(session_id, {
                    "type": "game_state",
                    "payload": session
                })

            elif msg_type == "submit_vote":
                if session["status"] != "ACTIVE" or session["game_slug"] != "callout":
                    await websocket.send_json({"type": "error", "message": "Cannot submit vote now"})
                    continue
                
                target = session["game_state"]["round_data"]["target_player"]
                if username == target:
                    await websocket.send_json({"type": "error", "message": "Target player cannot vote"})
                    continue
                
                option_idx = msg_data.get("option_index")
                if option_idx is None:
                    await websocket.send_json({"type": "error", "message": "Option index is required"})
                    continue
                
                options = session["game_state"]["round_data"]["bluff_options"]
                if option_idx < 0 or option_idx >= len(options):
                    await websocket.send_json({"type": "error", "message": "Invalid option index"})
                    continue
                
                chosen_option = options[option_idx]
                session["game_state"]["round_data"]["votes"][username] = chosen_option
                
                players = [p["username"] for p in session["players"]]
                voters = [p for p in players if p != target]
                
                if all(v in session["game_state"]["round_data"]["votes"] for v in voters):
                    await reveal_and_score_bluff_round(session, session_id)
                else:
                    await manager.broadcast(session_id, {
                        "type": "game_state",
                        "payload": session
                    })

            elif msg_type == "next_phase":
                if session["status"] == "ACTIVE" and session["game_slug"] == "game-of-games":
                    await _advance_game_of_games(session, session_id, username, websocket)
                    continue
                if session["status"] != "ACTIVE" or session["game_slug"] != "callout":
                    await websocket.send_json({"type": "error", "message": "Cannot advance phase now"})
                    continue
                await run_callout_transition(session, session_id)

            # ---------------------------------------------------------------
            # PLANET ENIGMA handlers
            # ---------------------------------------------------------------

            elif msg_type == "submit_puzzle_answer":
                if session["status"] != "ACTIVE" or session["game_slug"] != "planet-enigma":
                    await websocket.send_json({"type": "error", "message": "Cannot submit puzzle answer now"})
                    continue

                gs = session["game_state"]
                current_puzzle = gs.get("current_puzzle")
                if not current_puzzle:
                    await websocket.send_json({"type": "error", "message": "No active puzzle"})
                    continue

                answer_text = msg_data.get("answer", "").strip()
                if not answer_text:
                    await websocket.send_json({"type": "error", "message": "Answer cannot be empty"})
                    continue

                # Record this player's answer
                gs["current_answers"][username] = answer_text
                gs["session_events"].append(f"{username} answered: '{answer_text[:60]}'")

                puzzle_idx = gs["current_puzzle_index"]
                players_list = [p["username"] for p in session["players"]]
                mode = gs.get("mode", "solo")

                # In solo mode, evaluate immediately; in multiplayer wait for all players
                all_answered = all(p in gs["current_answers"] for p in players_list)
                if mode == "solo" or all_answered:
                    await manager.broadcast(session_id, {"type": "host_typing", "payload": True})

                    # Build answers summary for Lumi
                    answers_summary = "\n".join(
                        f"  - {player}: '{ans}'" for player, ans in gs["current_answers"].items()
                    )
                    correct_answer = current_puzzle.get("answer", "")
                    hints_used_this_puzzle = gs["hints_used"].get(str(puzzle_idx), {})
                    hints_summary = ", ".join(
                        f"{p} used {n} hint(s)" for p, n in hints_used_this_puzzle.items()
                    ) if hints_used_this_puzzle else "no hints used"

                    instruction = (
                        f"Players have submitted their answers to the current puzzle.\n"
                        f"Puzzle: '{current_puzzle['text']}'\n"
                        f"Correct answer: '{correct_answer}'\n"
                        f"Player answers:\n{answers_summary}\n"
                        f"Hints used: {hints_summary}\n\n"
                        f"Evaluate each answer strictly. Award +10 pts for correct. "
                        f"{'In multiplayer: the first correct answer also gets +5 speed bonus.' if mode == 'multiplayer' else ''} "
                        f"Then reveal the correct answer and EXPLAIN the reasoning — why this answer is correct, "
                        f"and why the most common wrong approaches fail. Stay in character throughout. "
                        f"Include scores_delta in your response as {{player: points_change}}."
                    )

                    lumi_res = await call_lumi_llm(session, instruction)
                    await manager.broadcast(session_id, {"type": "host_typing", "payload": False})

                    # Apply score deltas from Lumi
                    scores_delta = lumi_res.get("scores_delta") or {}
                    speed_bonus_player = lumi_res.get("speed_bonus_awarded")
                    for player, delta in scores_delta.items():
                        if player in gs["scores"]:
                            gs["scores"][player] = max(0, gs["scores"][player] + int(delta))

                    if speed_bonus_player and speed_bonus_player in gs["scores"]:
                        gs["scores"][speed_bonus_player] = gs["scores"][speed_bonus_player] + 5
                        gs["session_events"].append(f"Speed bonus awarded to {speed_bonus_player}!")

                    # Check world completion
                    world_completed = lumi_res.get("world_completed", False)
                    if world_completed:
                        gs["world_completed"] = True
                        session["status"] = "COMPLETED"
                        session["concluded"] = True
                        gs["phase"] = "COMPLETED"

                    # Log the reveal
                    correct_answer_shown = lumi_res.get("correct_answer", correct_answer)
                    gs["session_events"].append(f"Puzzle {puzzle_idx + 1} revealed. Answer: '{correct_answer_shown}'")
                    gs["current_answers"] = {}  # Reset for next puzzle

                    speech = lumi_res.get("speech_text", "Let's see how you did...")
                    session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                    await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                else:
                    # Waiting for more players in multiplayer
                    answered_count = len(gs["current_answers"])
                    total = len(players_list)
                    await manager.broadcast(session_id, {
                        "type": "game_state",
                        "payload": session,
                        "meta": {"waiting_for_answers": total - answered_count}
                    })

            elif msg_type == "request_hint":
                if session["status"] != "ACTIVE" or session["game_slug"] != "planet-enigma":
                    await websocket.send_json({"type": "error", "message": "Cannot request hint now"})
                    continue

                gs = session["game_state"]
                current_puzzle = gs.get("current_puzzle")
                if not current_puzzle:
                    await websocket.send_json({"type": "error", "message": "No active puzzle"})
                    continue

                puzzle_idx = str(gs["current_puzzle_index"])
                if puzzle_idx not in gs["hints_used"]:
                    gs["hints_used"][puzzle_idx] = {}
                if username not in gs["hints_used"][puzzle_idx]:
                    gs["hints_used"][puzzle_idx][username] = 0

                current_hint_count = gs["hints_used"][puzzle_idx][username]
                if current_hint_count >= 3:
                    await websocket.send_json({"type": "error", "message": "No more hints available for this puzzle"})
                    continue

                hint_number = current_hint_count + 1
                hint_costs = [3, 5, 8]
                cost = hint_costs[current_hint_count]

                # Deduct points immediately
                gs["scores"][username] = max(0, gs["scores"].get(username, 0) - cost)
                gs["hints_used"][puzzle_idx][username] = hint_number
                gs["session_events"].append(f"{username} requested Hint {hint_number} (-{cost} pts)")

                await manager.broadcast(session_id, {"type": "host_typing", "payload": True})
                instruction = (
                    f"{username} has requested Hint {hint_number} for the puzzle: '{current_puzzle['text']}'. "
                    f"Correct answer (known only to you): '{current_puzzle['answer']}'. "
                    f"Deliver Hint {hint_number} in character. "
                    f"Hint 1 = narrow the space (remove one category of wrong answer). "
                    f"Hint 2 = remove the main obstacle to solving. "
                    f"Hint 3 = nearly give it away without quite saying the answer directly. "
                    f"Set hint_text and hint_number in your response. "
                    f"Inform {username} that Hint {hint_number} cost them {cost} points."
                )

                lumi_res = await call_lumi_llm(session, instruction)
                await manager.broadcast(session_id, {"type": "host_typing", "payload": False})

                # Cache the hint text
                hint_key = f"hint_{hint_number}"
                if current_puzzle.get(hint_key) is None:
                    current_puzzle[hint_key] = lumi_res.get("hint_text", "")

                speech = lumi_res.get("speech_text", f"Hint {hint_number}: {lumi_res.get('hint_text', '')}")
                session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                await manager.broadcast(session_id, {"type": "game_state", "payload": session})

            elif msg_type == "next_puzzle":
                # Host or auto-advance after reveal — generates next puzzle
                if session["status"] != "ACTIVE" or session["game_slug"] != "planet-enigma":
                    await websocket.send_json({"type": "error", "message": "Cannot advance puzzle now"})
                    continue

                # Only host can advance
                if not session["players"] or session["players"][0]["username"] != username:
                    await websocket.send_json({"type": "error", "message": "Only the host can advance to the next puzzle"})
                    continue

                gs = session["game_state"]
                gs["current_puzzle_index"] += 1
                gs["current_answers"] = {}
                gs["current_puzzle"] = None
                puzzle_idx = gs["current_puzzle_index"]
                world = gs.get("world", "desert_island")
                mode = gs.get("mode", "solo")
                gs["session_events"].append(f"Advancing to Puzzle {puzzle_idx + 1}.")

                await manager.broadcast(session_id, {"type": "game_state", "payload": session})
                await manager.broadcast(session_id, {"type": "host_typing", "payload": True})

                instruction = (
                    f"Time for puzzle number {puzzle_idx + 1} in {world}. Players: {[p['username'] for p in session['players']]}. "
                    f"Stay in character as your persona for this world. "
                    f"Pose the next puzzle. Avoid any puzzle already in the vault. "
                    f"Include puzzle_text, puzzle_answer, puzzle_category in your response. "
                    f"Do NOT reveal the answer — just pose the puzzle."
                )

                lumi_res = await call_lumi_llm(session, instruction)
                await manager.broadcast(session_id, {"type": "host_typing", "payload": False})

                speech = lumi_res.get("speech_text", f"Puzzle {puzzle_idx + 1}...")
                if lumi_res.get("puzzle_text"):
                    gs["current_puzzle"] = {
                        "text": lumi_res["puzzle_text"],
                        "answer": lumi_res.get("puzzle_answer", ""),
                        "category": lumi_res.get("puzzle_category", "classic_riddles"),
                        "hint_1": None,
                        "hint_2": None,
                        "hint_3": None
                    }
                    if lumi_res["puzzle_text"] not in gs["vault"]:
                        gs["vault"].append(lumi_res["puzzle_text"])
                    gs["session_events"].append(f"Puzzle {puzzle_idx + 1} posed: '{lumi_res['puzzle_text'][:100]}'")

                session["messages"].append({"role": "assistant", "sender": "Lumi", "content": speech})
                await manager.broadcast(session_id, {"type": "game_state", "payload": session})

    except WebSocketDisconnect:
        await cleanup_disconnected_connection("receive loop disconnected")
    except RuntimeError as e:
        message = str(e)
        if "WebSocket" not in message and "close message" not in message and "disconnect message" not in message:
            raise
        await cleanup_disconnected_connection(message, warning=True)
