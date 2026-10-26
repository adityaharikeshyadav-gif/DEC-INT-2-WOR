import uuid
from typing import Optional

# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException
# pyrefly: ignore [missing-import]
from pydantic import BaseModel

from ..data.quiz_data import QUIZ_CATALOG, QUIZ_BY_ID
from ..prompts import build_welcome_prompt, build_quiz_prompt, LUMI_GENERAL_IDENTITY
from ..ai import get_ai_response

router = APIRouter(tags=["quizzes"])

sessions: dict[str, dict] = {}


class QuizListItem(BaseModel):
    id: int
    title: str
    short: str
    category: str
    tone: str
    sensitive: bool

class StartSessionRequest(BaseModel):
    quiz_id: Optional[int] = None
    mode: str = "solo"
    participants: Optional[list[str]] = None

class StartSessionResponse(BaseModel):
    session_id: str
    greeting: str

class ChatRequest(BaseModel):
    session_id: str
    message: str

class ChatResponse(BaseModel):
    response: str
    quiz_active: bool
    quiz_id: Optional[int] = None

class GeneralChatMessage(BaseModel):
    sender: str
    text: str

class GeneralChatRequest(BaseModel):
    message: str
    history: Optional[list[GeneralChatMessage]] = None

class GeneralChatResponse(BaseModel):
    response: str


@router.post("/chat/general", response_model=GeneralChatResponse)
async def general_chat(req: GeneralChatRequest):
    history = []
    if req.history:
        for msg in req.history:
            role = "user" if msg.sender == "user" else "assistant"
            history.append({"role": role, "content": msg.text})

    reply = await get_ai_response(LUMI_GENERAL_IDENTITY, history + [{"role": "user", "content": req.message}])
    return GeneralChatResponse(response=reply)



@router.get("/quizzes", response_model=list[QuizListItem])
async def list_quizzes():
    return [
        QuizListItem(
            id=q["id"],
            title=q["title"],
            short=q["short"],
            category=q["category"],
            tone=q["tone"],
            sensitive=q.get("sensitive", False),
        )
        for q in QUIZ_CATALOG
    ]


@router.post("/session/start", response_model=StartSessionResponse)
async def start_session(req: StartSessionRequest):
    session_id = str(uuid.uuid4())

    if req.quiz_id and req.quiz_id in QUIZ_BY_ID:
        system_prompt = build_quiz_prompt(req.quiz_id, req.mode, req.participants)
        quiz_id = req.quiz_id
    else:
        system_prompt = build_welcome_prompt()
        quiz_id = None

    greeting = await get_ai_response(system_prompt, [])

    sessions[session_id] = {
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "assistant", "content": greeting},
        ],
        "quiz_id": quiz_id,
        "mode": req.mode,
        "participants": req.participants or [],
        "system_prompt": system_prompt,
    }

    return StartSessionResponse(session_id=session_id, greeting=greeting)


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    session = sessions.get(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    session["messages"].append({"role": "user", "content": req.message})

    if session["quiz_id"] is None:
        selected_id = _detect_quiz_selection(req.message)
        if selected_id:
            system_prompt = build_quiz_prompt(
                selected_id, session["mode"], session["participants"]
            )
            session["quiz_id"] = selected_id
            session["system_prompt"] = system_prompt
            session["messages"][0] = {"role": "system", "content": system_prompt}

    reply = await get_ai_response(session["system_prompt"], session["messages"])
    session["messages"].append({"role": "assistant", "content": reply})

    if len(session["messages"]) > 42:
        session["messages"] = [session["messages"][0]] + session["messages"][-40:]

    return ChatResponse(
        response=reply,
        quiz_active=session["quiz_id"] is not None,
        quiz_id=session["quiz_id"],
    )


@router.post("/session/switch-quiz")
async def switch_quiz(
    session_id: str,
    quiz_id: int,
    mode: str = "solo",
    participants: Optional[list[str]] = None,
):
    session = sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    system_prompt = build_quiz_prompt(quiz_id, mode, participants)
    greeting = await get_ai_response(system_prompt, [])

    session["messages"] = [
        {"role": "system", "content": system_prompt},
        {"role": "assistant", "content": greeting},
    ]
    session["quiz_id"] = quiz_id
    session["mode"] = mode
    session["participants"] = participants or []
    session["system_prompt"] = system_prompt

    return {"greeting": greeting, "quiz_id": quiz_id}


def _detect_quiz_selection(message: str) -> Optional[int]:
    msg = message.strip().lower()

    for q in QUIZ_CATALOG:
        if msg == str(q["id"]):
            return q["id"]

    for q in QUIZ_CATALOG:
        if q["title"].lower() in msg:
            return q["id"]

    for q in QUIZ_CATALOG:
        title_words = q["title"].lower().split()
        if len(title_words) >= 2 and all(w in msg for w in title_words[:3]):
            return q["id"]

    return None
