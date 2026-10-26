"""Deckoviz Quizzes: adaptive MCQ top-of-funnel. Run: ANTHROPIC_API_KEY=... uvicorn main:app --reload  (open http://localhost:8000)"""
import json, os, re, sqlite3, time
from collections import Counter
from pathlib import Path

import yaml
from anthropic import Anthropic
from fastapi import FastAPI, HTTPException
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
ai = Anthropic()
app = FastAPI(title="Deckoviz Quizzes")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

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
        _, fm, body = p.read_text().split("---", 2)
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


@app.post("/api/next")
def next_step(s: Step):
    q = quizzes().get(s.quiz_id)
    if not q:
        raise HTTPException(404, "Unknown quiz")
    n, lo, hi = len(s.answers), q.get("min", 7), q.get("max", 11)
    known = profile(s.visitor_id)["top_signals"]
    system = CORE + f"\n\nQUIZ: {q['title']}\n{q['body']}\n\nAsk at least {lo} and at most {hi} questions, finishing as soon as you have real signal. Answered so far: {n}."
    if n >= hi:
        system += "\nYou must finish now with done true."
    if n < lo:
        system += "\nDo not finish yet."
    if known:
        system += "\n\nALREADY KNOWN about this person from other quizzes (weave in lightly, never re-ask): " + ", ".join(known)
    log = "\n".join(f"Q{i + 1}: {a['q']} / answer: {a['picked']}" for i, a in enumerate(s.answers)) or "(none yet, ask the first question)"
    d = None
    for _ in range(2):
        out = ai.messages.create(model=MODEL, max_tokens=1200, system=system, messages=[{"role": "user", "content": log}])
        d = parse(out.content[0].text)
        if d and (d.get("done") or d.get("question")):
            break
    if not d:
        raise HTTPException(502, "Vizzy lost the thread")
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


app.mount("/", StaticFiles(directory=HERE / "static", html=True), name="static")
