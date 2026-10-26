import uuid
import json
import re
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..data.personas_data import PERSONAS_CATALOG, PERSONAS_BY_ID
from ..data.journeys_data import JOURNEYS_CATALOG, JOURNEYS_BY_ID
from ..prompts import build_persona_system_prompt, build_reflection_prompt
from ..ai import get_ai_response

router = APIRouter(prefix="/conversations", tags=["conversations"])

# In-memory stores
sessions: dict[str, dict] = {}
saved_insights: list[dict] = []


class PersonaListItem(BaseModel):
    id: str
    name: str
    dates: str
    portrait: str
    bio: str
    topics: list[str]
    category: str
    opening_prompt: Optional[str] = None


class JourneyListItem(BaseModel):
    id: str
    title: str
    description: str
    recommended_persona: str
    theme: str


class StartSessionRequest(BaseModel):
    persona_id: str
    journey_id: Optional[str] = None
    mode: str = "text"  # "text" or "voice"


class StartSessionResponse(BaseModel):
    session_id: str
    greeting: str
    persona_name: str
    persona_portrait: str


class ChatRequest(BaseModel):
    session_id: str
    message: str


class ReflectionData(BaseModel):
    summary: str
    insight: str


class ChatResponse(BaseModel):
    response: str
    session_concluded: bool
    reflection: Optional[ReflectionData] = None


class SaveInsightRequest(BaseModel):
    session_id: str
    persona_id: str
    persona_name: str
    persona_portrait: str
    journey_title: Optional[str] = None
    summary: str
    insight: str


class SavedInsightResponse(BaseModel):
    insight_id: str
    status: str


# --- Endpoints ---

@router.get("/personas", response_model=list[PersonaListItem])
async def list_personas():
    return [PersonaListItem(**p) for p in PERSONAS_CATALOG]


@router.get("/journeys", response_model=list[JourneyListItem])
async def list_journeys():
    return [JourneyListItem(**j) for j in JOURNEYS_CATALOG]


@router.get("/personas/{persona_id}", response_model=PersonaListItem)
async def get_persona(persona_id: str):
    persona = PERSONAS_BY_ID.get(persona_id)
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")
    return PersonaListItem(**persona)


@router.post("/session/start", response_model=StartSessionResponse)
async def start_conversation_session(req: StartSessionRequest):
    persona = PERSONAS_BY_ID.get(req.persona_id)
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")

    journey = JOURNEYS_BY_ID.get(req.journey_id) if req.journey_id else None
    journey_title = journey["title"] if journey else None

    # Build system prompt for this persona & mode & journey
    system_prompt = build_persona_system_prompt(persona, req.mode, journey_title)

    # Call AI to generate first greeting
    greeting = await get_ai_response(system_prompt, [])

    session_id = str(uuid.uuid4())
    sessions[session_id] = {
        "id": session_id,
        "persona_id": req.persona_id,
        "persona_name": persona["name"],
        "persona_portrait": persona["portrait"],
        "journey_title": journey_title,
        "mode": req.mode,
        "system_prompt": system_prompt,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "assistant", "content": greeting}
        ],
        "user_message_count": 0,
        "concluded": False,
        "reflection": None
    }

    return StartSessionResponse(
        session_id=session_id,
        greeting=greeting,
        persona_name=persona["name"],
        persona_portrait=persona["portrait"]
    )


async def process_chat_message(session_id: str, message: str) -> ChatResponse:
    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session["concluded"]:
        raise HTTPException(status_code=400, detail="Session has already concluded")

    user_msg = message.strip()
    session["messages"].append({"role": "user", "content": user_msg})
    session["user_message_count"] += 1

    # Detect if user is asking to conclude the session
    # Use word-boundary matching to avoid false positives like "I can't stop thinking about..."
    conclude_triggers = [
        r"\bend session\b", r"\bgoodbye\b", r"\bconclude\b", r"\bwrap up\b",
        r"\bthat's all\b", r"\bbye bye\b", r"\bi'm done\b", r"\bend chat\b",
        r"\blet's stop here\b", r"\blet's end\b"
    ]
    user_lower = user_msg.lower()
    user_wants_to_end = any(re.search(trigger, user_lower) for trigger in conclude_triggers)
    
    # Force conclusion after 8 user messages or if user triggers it
    should_conclude = user_wants_to_end or session["user_message_count"] >= 8

    if should_conclude:
        # Wrap up persona prompt context
        session["concluded"] = True
        conclude_prompt = (
            "\n[SYSTEM INSTRUCTION: This conversation is ending. Acknowledge this with a brief, "
            "warm parting message in character, sharing one final thought. Do not ask any more questions.]"
        )
        session["messages"].append({"role": "system", "content": conclude_prompt})

    # Call AI for response
    reply = await get_ai_response(session["system_prompt"], session["messages"])
    session["messages"].append({"role": "assistant", "content": reply})

    reflection = None
    if should_conclude:
        # Generate the structured reflection card data
        try:
            # We filter system prompts from history when summarizing
            chat_history_only = [m for m in session["messages"] if m["role"] in ("user", "assistant")]
            summary_prompt = build_reflection_prompt(session["persona_name"], chat_history_only)
            # Use get_ai_response with general identity to generate the JSON
            summary_json_str = await get_ai_response(summary_prompt, [])
            
            # Clean JSON from markdown block markers if any
            cleaned_json = re.sub(r"```json\s*|```", "", summary_json_str).strip()
            data = json.loads(cleaned_json)
            reflection = ReflectionData(
                summary=data.get("summary", "You shared a thoughtful moment exploring self-reflection."),
                insight=data.get("insight", "Self-knowledge is the beginning of wisdom.")
            )
            session["reflection"] = reflection.dict()
        except Exception as e:
            # Fallback if AI fails to output valid JSON
            print(f"Error generating reflection: {e}")
            reflection = ReflectionData(
                summary="You shared a thoughtful moment exploring self-reflection.",
                insight="Self-knowledge is the beginning of wisdom."
            )
            session["reflection"] = reflection.dict()

    return ChatResponse(
        response=reply,
        session_concluded=session["concluded"],
        reflection=reflection
    )


@router.post("/chat", response_model=ChatResponse)
async def conversation_chat(req: ChatRequest):
    return await process_chat_message(req.session_id, req.message)


@router.post("/save-insight", response_model=SavedInsightResponse)
async def save_insight(req: SaveInsightRequest):
    insight_id = str(uuid.uuid4())
    saved_insights.append({
        "id": insight_id,
        "session_id": req.session_id,
        "persona_id": req.persona_id,
        "persona_name": req.persona_name,
        "persona_portrait": req.persona_portrait,
        "journey_title": req.journey_title,
        "summary": req.summary,
        "insight": req.insight,
        "created_at": datetime.now().strftime("%b %d, %Y")
    })
    return SavedInsightResponse(insight_id=insight_id, status="saved")


@router.get("/history")
async def get_history():
    # Return finished or in-progress sessions in a clean listing format
    history_list = []
    for s_id, s in sessions.items():
        history_list.append({
            "session_id": s_id,
            "persona_id": s["persona_id"],
            "persona_name": s["persona_name"],
            "persona_portrait": s["persona_portrait"],
            "journey_title": s["journey_title"],
            "mode": s["mode"],
            "concluded": s["concluded"],
            "reflection": s["reflection"],
            "message_count": len(s["messages"]) // 2
        })
    return history_list


@router.get("/insights")
async def get_saved_insights():
    return saved_insights


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session
