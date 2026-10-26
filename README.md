# Deckoviz Quizzes
pip install -r requirements.txt, then ANTHROPIC_API_KEY=... uvicorn main:app --reload and open http://localhost:8000.
Add a quiz: drop a markdown file into quizzes/ (id, title, emoji, blurb, then a brief). Optional min and max question counts go in the frontmatter.
Data: SQLite tables results (answers, result, signals per visitor and quiz) and leads (emails). GET /api/profile/{visitor_id} returns the aggregated taste signals.
