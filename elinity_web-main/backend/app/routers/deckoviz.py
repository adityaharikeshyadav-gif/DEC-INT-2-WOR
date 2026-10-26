import json
import os
import re
import sqlite3
import time
from collections import Counter
from pathlib import Path
from typing import List, Optional

import yaml
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

router = APIRouter(tags=["deckoviz"])

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
STATIC_DIR = BASE_DIR / "static"
if not STATIC_DIR.exists():
    STATIC_DIR = BASE_DIR / "elinity_web-main" / "static"
QUIZZES_DIR = BASE_DIR / "quizzes"
if not QUIZZES_DIR.exists():
    QUIZZES_DIR = BASE_DIR / "elinity_web-main" / "quizzes"

DB_PATH = BASE_DIR / "quizzes.db"
if not DB_PATH.exists():
    DB_PATH = BASE_DIR / "elinity_web-main" / "quizzes.db"

db = sqlite3.connect(str(DB_PATH), check_same_thread=False)
db.row_factory = sqlite3.Row
db.execute("create table if not exists results(id integer primary key, visitor text, quiz text, answers text, result text, signals text, ts real)")
db.execute("create table if not exists leads(visitor text, email text, ts real)")
db.commit()

LOGO_PATHS = [
    STATIC_DIR / "logo.jpeg",
    BASE_DIR / "elinity_web-main" / "public" / "logo.jpeg",
    BASE_DIR / "public" / "logo.jpeg",
    BASE_DIR / "WhatsApp Image 2026-10-27 at 01.28.01.jpeg",
]


def load_deckoviz_quizzes():
    out = {}
    if QUIZZES_DIR.exists():
        for p in sorted(QUIZZES_DIR.glob("*.md")):
            content = p.read_text(encoding="utf-8")
            if "---" in content:
                parts = content.split("---", 2)
                if len(parts) >= 3:
                    _, fm, body = parts
                    m = yaml.safe_load(fm) or {}
                    m["body"] = body.strip()
                    out[m.get("id", p.stem)] = m
    return out


def get_profile(visitor: str):
    rows = db.execute("select quiz, signals from results where visitor=? order by ts desc", (visitor,)).fetchall()
    c = Counter(s for r in rows for s in json.loads(r["signals"]))
    return {"quizzes_taken": [r["quiz"] for r in rows], "top_signals": [s for s, _ in c.most_common(8)]}


DEMO_QUESTIONS = [
    {
        "quip": "",
        "question": {
            "text": "What catches your eye first when walking into a room?",
            "options": [
                "Warm afternoon light on raw wood floorboards",
                "A bold concrete arch with clean geometry",
                "A dreamlike surreal painting with fluid shapes",
                "A delicate handcrafted woodblock print of ocean waves"
            ]
        }
    },
    {
        "quip": "A sharp eye for presence and atmosphere.",
        "question": {
            "text": "Which landscape would you linger in for hours?",
            "options": [
                "A breezy cliffside meadow with wild poppies",
                "An austere minimalist desert pavilion",
                "A foggy harbor with shifting pastel reflections",
                "A neon-lit rain-soaked retro Tokyo alleyway"
            ]
        }
    },
    {
        "quip": "There is a quiet poetic pulse to that choice.",
        "question": {
            "text": "Pick the texture that speaks most to your hands:",
            "options": [
                "Thick oil paint with tactile palette knife ridges",
                "Polished grey limestone and brushed steel",
                "Raw rough-hewn paper with deckled edges",
                "Woven hemp and distressed vintage earthenware"
            ]
        }
    },
    {
        "quip": "Tactile honesty always reveals true taste.",
        "question": {
            "text": "Choose your ideal morning retreat:",
            "options": [
                "Coffee by a sunlit window with slow ambient music",
                "An uncluttered Scandinavian studio with clean lines",
                "An eccentric library piled with antique art prints",
                "A terrace overlooking misty mountain ridges"
            ]
        }
    }
]

DEMO_RESULTS = [
    {
        "title": "Luminous Impressionist & Organic Minimalist",
        "tagline": "Drawn to shifting light, honest textures, and poetic stillness.",
        "body": "Your aesthetic instincts lean toward warmth, atmosphere, and lived-in grace rather than rigid perfection. You notice how light moves across a room throughout the day, and you're naturally drawn to art that captures feeling and moment over cold photorealism.",
        "tags": ["Warm Light", "Impressionism", "Organic Textures", "Poetic Mood"],
        "picks": [
            {"name": "Claude Monet's The Artist's Garden at Vétheuil", "why": "Dappled golden sunlight and loose, vibrant brushwork."},
            {"name": "Hasui Kawase's Rain at Maekawa", "why": "Masterful atmospheric mood with timeless tranquil balance."}
        ],
        "palette": ["#C29B7F", "#5D7A88", "#E6DFC8", "#82937A", "#2B3A42"]
    }
]


class Step(BaseModel):
    quiz_id: str
    visitor_id: str
    answers: List[dict] = []


class Lead(BaseModel):
    visitor_id: str
    email: str


@router.get("/logo.jpeg")
def get_logo():
    for p in LOGO_PATHS:
        if p.exists():
            return FileResponse(p, media_type="image/jpeg")
    return JSONResponse(status_code=404, content={"error": "Logo not found"})


@router.get("/api/quizzes")
def list_quizzes():
    return [{k: q.get(k) for k in ("id", "title", "emoji", "blurb")} for q in load_deckoviz_quizzes().values()]


@router.get("/api/profile/{visitor}")
def visitor_profile(visitor: str):
    return get_profile(visitor)


@router.post("/api/next")
def next_step(s: Step):
    q = load_deckoviz_quizzes().get(s.quiz_id) or {"title": "Taste Calibration", "min": 3, "max": 6}
    n = len(s.answers)
    lo = q.get("min", 3)

    if n < min(lo, len(DEMO_QUESTIONS)):
        step_data = DEMO_QUESTIONS[n]
        d = {"done": False, "quip": step_data["quip"], "question": step_data["question"]}
    else:
        res = DEMO_RESULTS[0]
        d = {
            "done": True,
            "signals": ["impressionism", "warm natural light", "tactile textures", "quiet contemplation", "plein air"],
            "result": res
        }

    if d.get("done"):
        db.execute("insert into results(visitor, quiz, answers, result, signals, ts) values(?,?,?,?,?,?)",
                   (s.visitor_id, s.quiz_id, json.dumps(s.answers), json.dumps(d["result"]), json.dumps(d.get("signals", [])), time.time()))
        db.commit()
        d["profile"] = get_profile(s.visitor_id)
    return d


@router.post("/api/lead")
def save_lead(l: Lead):
    db.execute("insert into leads values(?,?,?)", (l.visitor_id, l.email.strip(), time.time()))
    db.commit()
    return {"ok": True}
