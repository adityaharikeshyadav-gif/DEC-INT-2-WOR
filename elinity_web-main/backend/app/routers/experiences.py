import uuid
from typing import Optional

# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException
# pyrefly: ignore [missing-import]
from pydantic import BaseModel

from ..data.experiences_data import EXPERIENCES_CATALOG, EXPERIENCES_BY_ID
from ..prompts import build_experience_insight_prompt
from ..ai import get_ai_response

router = APIRouter(prefix="/experiences", tags=["experiences"])


class LumiInsightRequest(BaseModel):
    user_context: Optional[str] = ""

class LumiInsightResponse(BaseModel):
    insight: str
    experience_id: str

class BookingRequest(BaseModel):
    experience_id: str
    experience_title: str
    price: int
    user_email: Optional[str] = None
    user_name: Optional[str] = None

class BookingResponse(BaseModel):
    booking_id: str
    status: str
    experience_id: str
    message: str


@router.get("")
async def list_experiences(
    category: Optional[str] = None,
    city: Optional[str] = None,
    max_price: Optional[int] = None,
    recommended_only: bool = False,
    q: Optional[str] = None,
):
    experiences = list(EXPERIENCES_CATALOG)

    if category:
        experiences = [e for e in experiences if e["category"] == category]
    if city:
        experiences = [e for e in experiences if e["city"] == city]
    if max_price is not None:
        experiences = [e for e in experiences if e["price"] <= max_price]
    if recommended_only:
        experiences = [e for e in experiences if e.get("isRecommended")]
    if q:
        q_lower = q.lower()
        experiences = [
            e for e in experiences
            if q_lower in e["title"].lower() or q_lower in e["tagline"].lower() or q_lower in e["venue"].lower()
        ]

    return experiences


@router.get("/{experience_id}")
async def get_experience(experience_id: str):
    experience = EXPERIENCES_BY_ID.get(experience_id)
    if not experience:
        raise HTTPException(status_code=404, detail=f"Experience '{experience_id}' not found")
    return experience


@router.post("/book", response_model=BookingResponse)
async def book_experience(req: BookingRequest):
    experience = EXPERIENCES_BY_ID.get(req.experience_id)
    if not experience:
        raise HTTPException(status_code=404, detail=f"Experience '{req.experience_id}' not found")

    spots_left = experience["capacity"] - experience["filled"]
    if spots_left <= 0:
        raise HTTPException(status_code=409, detail="This experience is fully booked")

    return BookingResponse(
        booking_id=str(uuid.uuid4()),
        status="pending",
        experience_id=req.experience_id,
        message=f"Booking received for {req.experience_title}. Lumi will be in touch shortly.",
    )


@router.post("/{experience_id}/lumi-insight", response_model=LumiInsightResponse)
async def experience_lumi_insight(experience_id: str, req: LumiInsightRequest):
    experience = EXPERIENCES_BY_ID.get(experience_id)
    if not experience:
        raise HTTPException(status_code=404, detail=f"Experience '{experience_id}' not found")

    prompt = build_experience_insight_prompt(experience, req.user_context or "")
    insight = await get_ai_response(prompt, [])
    return LumiInsightResponse(insight=insight, experience_id=experience_id)
