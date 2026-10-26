import uuid
from typing import Optional

# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException
# pyrefly: ignore [missing-import]
from pydantic import BaseModel

from ..data.trips_data import TRIPS_CATALOG, TRIPS_BY_ID
from ..prompts import build_trip_insight_prompt
from ..ai import get_ai_response

router = APIRouter(prefix="/trips", tags=["trips"])


class LumiInsightRequest(BaseModel):
    user_context: Optional[str] = ""

class LumiInsightResponse(BaseModel):
    insight: str
    trip_id: str

class BookingRequest(BaseModel):
    trip_id: str
    trip_title: str
    price: int
    user_email: Optional[str] = None
    user_name: Optional[str] = None

class BookingResponse(BaseModel):
    booking_id: str
    status: str
    trip_id: str
    message: str


@router.get("")
async def list_trips(
    vibe: Optional[str] = None,
    region: Optional[str] = None,
    max_duration: Optional[int] = None,
    max_price: Optional[int] = None,
    difficulty: Optional[str] = None,
    recommended_only: bool = False,
    q: Optional[str] = None,
):
    trips = list(TRIPS_CATALOG)

    if vibe:
        trips = [t for t in trips if t["vibe"] == vibe]
    if region:
        trips = [t for t in trips if t["region"] == region]
    if max_duration is not None:
        trips = [t for t in trips if t["duration"] <= max_duration]
    if max_price is not None:
        trips = [t for t in trips if t["price"] <= max_price]
    if difficulty:
        trips = [t for t in trips if t["difficulty"] == difficulty]
    if recommended_only:
        trips = [t for t in trips if t.get("isRecommended")]
    if q:
        q_lower = q.lower()
        trips = [
            t for t in trips
            if q_lower in t["title"].lower() or q_lower in t["destination"].lower()
        ]

    return trips


@router.post("/book", response_model=BookingResponse)
async def book_trip(req: BookingRequest):
    trip = TRIPS_BY_ID.get(req.trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail=f"Trip '{req.trip_id}' not found")

    spots_left = trip["groupSize"]["max"] - trip["groupSize"]["current"]
    if spots_left <= 0:
        raise HTTPException(status_code=409, detail="This trip is fully booked")

    return BookingResponse(
        booking_id=str(uuid.uuid4()),
        status="pending",
        trip_id=req.trip_id,
        message=f"Booking received for {req.trip_title}. Lumi will be in touch shortly.",
    )


@router.get("/{trip_id}")
async def get_trip(trip_id: str):
    trip = TRIPS_BY_ID.get(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail=f"Trip '{trip_id}' not found")
    return trip


@router.post("/{trip_id}/lumi-insight", response_model=LumiInsightResponse)
async def trip_lumi_insight(trip_id: str, req: LumiInsightRequest):
    trip = TRIPS_BY_ID.get(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail=f"Trip '{trip_id}' not found")

    prompt = build_trip_insight_prompt(trip, req.user_context or "")
    insight = await get_ai_response(prompt, [])
    return LumiInsightResponse(insight=insight, trip_id=trip_id)
