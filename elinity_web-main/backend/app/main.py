import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .routers import trips, quizzes, experiences, conversations, voice, games, deckoviz

app = FastAPI(title="Elinity API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trips.router)
app.include_router(quizzes.router)
app.include_router(experiences.router)
app.include_router(conversations.router)
app.include_router(voice.router)
app.include_router(games.router)
app.include_router(deckoviz.router)

# Resolve paths to Deckoviz static directory and logo
BASE_DIR = Path(__file__).resolve().parent.parent.parent
STATIC_DIR = BASE_DIR / "static"
if not STATIC_DIR.exists():
    STATIC_DIR = Path(__file__).resolve().parent / "static"

LOGO_PATHS = [
    STATIC_DIR / "logo.jpeg",
    BASE_DIR / "public" / "logo.jpeg",
    BASE_DIR / "WhatsApp Image 2026-10-27 at 01.28.01.jpeg",
    BASE_DIR.parent / "WhatsApp Image 2026-10-27 at 01.28.01.jpeg",
]


@app.get("/logo.jpeg")
def get_logo():
    for p in LOGO_PATHS:
        if p.exists():
            return FileResponse(p, media_type="image/jpeg")
    return JSONResponse(status_code=404, content={"error": "Logo not found"})


@app.get("/")
@app.get("/quiz")
@app.get("/style-calibration-quiz")
async def root(request: Request):
    accept = request.headers.get("accept", "")
    index_file = STATIC_DIR / "index.html"
    if ("text/html" in accept or "*/*" in accept) and index_file.exists():
        return FileResponse(index_file)
    return {"service": "Elinity API", "status": "running", "version": "2.0.0"}


@app.get("/curated-art-style")
def get_curated():
    f = STATIC_DIR / "curated-art-style.html"
    if f.exists():
        return FileResponse(f)
    return JSONResponse(status_code=404, content={"error": "Page not found"})


@app.get("/daily-art-style-update")
def get_daily():
    f = STATIC_DIR / "daily-art-style-update.html"
    if f.exists():
        return FileResponse(f)
    return JSONResponse(status_code=404, content={"error": "Page not found"})


@app.get("/story-studio")
@app.get("/cinematic-drafting-suite")
@app.get("/illuminated-storyboards")
def get_studio():
    f = STATIC_DIR / "story-studio.html"
    if f.exists():
        return FileResponse(f)
    return JSONResponse(status_code=404, content={"error": "Page not found"})


@app.get("/classic")
def get_classic():
    f = STATIC_DIR / "classic.html"
    if f.exists():
        return FileResponse(f)
    return JSONResponse(status_code=404, content={"error": "Page not found"})


if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static_dir")

