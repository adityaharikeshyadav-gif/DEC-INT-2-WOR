"""Deckoviz Quizzes: adaptive MCQ top-of-funnel. Run: uvicorn main:app --reload (open http://localhost:8000)"""
import json, os, re, sqlite3, time
from collections import Counter
from pathlib import Path

import yaml
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

HERE = Path(__file__).parent
MODEL = os.getenv("VIZZY_MODEL", "claude-sonnet-5-5")
db = sqlite3.connect(os.getenv("VIZZY_DB", "quizzes.db"), check_same_thread=False)
db.row_factory = sqlite3.Row
db.execute("create table if not exists results(id integer primary key, visitor text, quiz text, answers text, result text, signals text, ts real)")
db.execute("create table if not exists leads(visitor text, email text, ts real)")
db.commit()

# Initialize AI client if ANTHROPIC_API_KEY is available
ai = None
try:
    from anthropic import Anthropic
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    if anthropic_key:
        ai = Anthropic(api_key=anthropic_key)
        print("Anthropic Claude client initialized successfully.")
    else:
        print("Notice: ANTHROPIC_API_KEY is not set. Running in interactive demo mode.")
except ImportError:
    print("Notice: anthropic package is not installed. Running in interactive demo mode.")

import sys
elinity_path = str(HERE / "elinity_web-main")
if elinity_path not in sys.path:
    sys.path.insert(0, elinity_path)

try:
    from backend.app.routers import (
        trips as elinity_trips,
        quizzes as elinity_quizzes,
        experiences as elinity_experiences,
        conversations as elinity_conversations,
        voice as elinity_voice,
        games as elinity_games,
    )
    routers_loaded = True
except Exception as e:
    print(f"Warning: Could not load some elinity routers: {e}")
    routers_loaded = False

app = FastAPI(title="Deckoviz Quizzes & Atelier AI", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

if routers_loaded:
    app.include_router(elinity_quizzes.router)
    app.include_router(elinity_conversations.router)
    app.include_router(elinity_experiences.router)
    app.include_router(elinity_trips.router)
    app.include_router(elinity_voice.router)
    app.include_router(elinity_games.router)


CORE = """You are Vizzy, the playful, warm, tasteful curator inside Deckoviz. You run a multiple choice quiz that feels like a delightful chat about discovering yourself, never a questionnaire.

Each turn you see the answers so far and return ONLY one JSON object, either
{"done": false, "quip": "a short, witty, warm reaction to their last answer (empty for the first question)", "question": {"text": "...", "options": ["...", "...", "...", "..."]}}
or, once you have enough signal,
{"done": true, "signals": ["short lowercase preference tags, 8 to 14, e.g. warm light, quiet maximalism, slow mornings"], "result": {"title": "a delightful, specific result name", "tagline": "one line", "body": "3 to 4 warm sentences that make them feel seen", "tags": ["3 to 5 words"], "picks": [{"name": "specific pick", "why": "one line"}], "palette": ["#hex", "#hex", "#hex", "#hex", "#hex"]}}

Rules: 4 vivid, mutually exclusive options of under 9 words each, each revealing a different taste. Questions are concrete and sensory (scenes, choices, would you rather), never abstract. Generate questions fresh from the quiz brief and adapt to earlier answers. Skip the obvious picks and famous defaults. Plain, human, idiomatic voice. No em dashes, no emojis, no markdown."""


def parse(raw):
    try:
        s = re.sub(r"^```(?:json)?|```$", "", raw.strip(), flags=re.M).strip()
        return json.loads(s[s.index("{"): s.rindex("}") + 1])
    except Exception:
        return None


def quizzes():
    out = {}
    for p in sorted((HERE / "quizzes").glob("*.md")):
        content = p.read_text(encoding="utf-8")
        _, fm, body = content.split("---", 2)
        m = yaml.safe_load(fm)
        m["body"] = body.strip()
        out[m["id"]] = m
    return out


def profile(visitor):
    rows = db.execute("select quiz, signals from results where visitor=? order by ts desc", (visitor,)).fetchall()
    c = Counter(s for r in rows for s in json.loads(r["signals"]))
    return {"quizzes_taken": [r["quiz"] for r in rows], "top_signals": [s for s, _ in c.most_common(8)]}


@app.get("/api/quizzes")
def list_quizzes():
    return [{k: q.get(k) for k in ("id", "title", "emoji", "blurb")} for q in quizzes().values()]


@app.get("/api/profile/{visitor}")
def get_profile(visitor: str):
    return profile(visitor)


class Step(BaseModel):
    quiz_id: str
    visitor_id: str
    answers: list[dict] = []  # [{q, picked}]


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
                "A balcony overlooking morning mist and cedar trees"
            ]
        }
    },
    {
        "quip": "You value calm intention over sensory chaos.",
        "question": {
            "text": "Which visual contrast excites you the most?",
            "options": [
                "Dappled sunlight through trembling green leaves",
                "Stark monochromatic black against architectural white",
                "Vivid complementary colors vibrating side by side",
                "Subtle weathered tones of indigo and ochre"
            ]
        }
    },
    {
        "quip": "That explains the cadence of your earlier picks.",
        "question": {
            "text": "If a piece of art could speak, what should it say?",
            "options": [
                "Remember this fleeting summer afternoon",
                "Notice the quiet beauty in pure form",
                "Reality is stranger and deeper than it looks",
                "Find peace in ancient natural rhythms"
            ]
        }
    },
    {
        "quip": "Almost there. One final instinct:",
        "question": {
            "text": "Pick a keepsake to keep on your desk forever:",
            "options": [
                "A small brass compass with weathered patina",
                "A smooth river stone resting on raw slate",
                "A miniature surreal bronze sculpture",
                "A hand-painted ceramic bowl with gold kintsugi"
            ]
        }
    }
]

DEMO_RESULTS = [
    {
        "title": "Luminous Impressionist & Organic Minimalist",
        "tagline": "Drawn to shifting light, honest textures, and poetic stillness.",
        "body": "Your aesthetic instincts lean toward warmth, atmosphere, and lived-in grace rather than rigid perfection. You notice how light moves across a room throughout the day, and you're naturally drawn to art that captures feeling and moment over cold photorealism. Your eye seeks breathing room, organic materials, and gentle, evocative nuances.",
        "tags": ["Warm Light", "Impressionism", "Organic Textures", "Poetic Mood"],
        "picks": [
            {"name": "Claude Monet's The Artist's Garden at Vétheuil", "why": "Dappled golden sunlight and loose, vibrant brushwork."},
            {"name": "Hasui Kawase's Rain at Maekawa", "why": "Masterful atmospheric mood with timeless tranquil balance."},
            {"name": "Vilhelm Hammershøi's Sunbeams", "why": "Subtle, luminous architectural meditation on quiet light."}
        ],
        "palette": ["#C29B7F", "#5D7A88", "#E6DFC8", "#82937A", "#2B3A42"]
    }
]


@app.post("/api/next")
def next_step(s: Step):
    q = quizzes().get(s.quiz_id)
    if not q:
        raise HTTPException(404, "Unknown quiz")
    n, lo, hi = len(s.answers), q.get("min", 7), q.get("max", 11)
    known = profile(s.visitor_id)["top_signals"]

    d = None
    if ai:
        system = CORE + f"\n\nQUIZ: {q['title']}\n{q['body']}\n\nAsk at least {lo} and at most {hi} questions, finishing as soon as you have real signal. Answered so far: {n}."
        if n >= hi:
            system += "\nYou must finish now with done true."
        if n < lo:
            system += "\nDo not finish yet."
        if known:
            system += "\n\nALREADY KNOWN about this person from other quizzes (weave in lightly, never re-ask): " + ", ".join(known)
        log = "\n".join(f"Q{i + 1}: {a['q']} / answer: {a['picked']}" for i, a in enumerate(s.answers)) or "(none yet, ask the first question)"
        for _ in range(2):
            try:
                out = ai.messages.create(model=MODEL, max_tokens=1200, system=system, messages=[{"role": "user", "content": log}])
                d = parse(out.content[0].text)
                if d and (d.get("done") or d.get("question")):
                    break
            except Exception as e:
                print(f"Error calling Anthropic API: {e}")
                d = None

    # Fallback to interactive demo mode if AI was not configured or failed
    if not d:
        if n < min(lo, len(DEMO_QUESTIONS)):
            step_data = DEMO_QUESTIONS[n]
            d = {"done": False, "quip": step_data["quip"], "question": step_data["question"]}
        else:
            res = DEMO_RESULTS[0]
            d = {
                "done": True,
                "signals": ["impressionism", "warm natural light", "tactile textures", "quiet contemplation", "plein air", "slow living", "earthy pigments", "poetic atmosphere"],
                "result": res
            }

    if d.get("done"):
        db.execute("insert into results(visitor, quiz, answers, result, signals, ts) values(?,?,?,?,?,?)",
                   (s.visitor_id, s.quiz_id, json.dumps(s.answers), json.dumps(d["result"]), json.dumps(d.get("signals", [])), time.time()))
        db.commit()
        d["profile"] = profile(s.visitor_id)
    return d


class Lead(BaseModel):
    visitor_id: str
    email: str


@app.post("/api/lead")
def lead(l: Lead):
    db.execute("insert into leads values(?,?,?)", (l.visitor_id, l.email.strip(), time.time()))
    db.commit()
    return {"ok": True}


@app.get("/")
@app.get("/quiz")
@app.get("/style-calibration-quiz")
def get_quiz():
    return FileResponse(HERE / "static" / "index.html")


@app.get("/curated-art-style")
def get_curated():
    return FileResponse(HERE / "static" / "curated-art-style.html")


@app.get("/daily-art-style-update")
def get_daily():
    return FileResponse(HERE / "static" / "daily-art-style-update.html")


@app.get("/story-studio")
@app.get("/cinematic-drafting-suite")
@app.get("/illuminated-storyboards")
def get_studio():
    return FileResponse(HERE / "static" / "story-studio.html")


@app.get("/classic")
def get_classic():
    return FileResponse(HERE / "static" / "classic.html")


@app.get("/logo.jpeg")
def get_logo():
    logo_path = HERE / "static" / "logo.jpeg"
    if not logo_path.exists():
        logo_path = HERE / "WhatsApp Image 2026-10-27 at 01.28.01.jpeg"
    return FileResponse(logo_path, media_type="image/jpeg")


app.mount("/", StaticFiles(directory=HERE / "static", html=True), name="static")

