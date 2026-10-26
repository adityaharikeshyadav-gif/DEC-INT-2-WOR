"""
End-to-end integration test suite for Deckoviz Taste Quizzes, Purple UI, and Chatbot Pipeline.
Run with: python test_deckoviz_integration.py
"""
import sys
import unittest
from pathlib import Path
from fastapi.testclient import TestClient

HERE = Path(__file__).parent
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

try:
    from main import app
except ImportError:
    try:
        from app.main import app
    except ImportError:
        from backend.app.main import app

class TestDeckovizFullPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_static_pages_serve_purple_theme_and_logo(self):
        """Verifies that all frontend pages serve purple color scheme and company logo."""
        pages = ["/", "/style-calibration-quiz", "/curated-art-style", "/daily-art-style-update", "/story-studio"]
        for path in pages:
            res = self.client.get(path)
            self.assertEqual(res.status_code, 200, f"Page {path} failed to load")
            html = res.text
            # Verify company logo
            self.assertIn('/logo.jpeg', html, f"Logo /logo.jpeg not found in {path}")
            # Verify purple primary color
            self.assertIn('#7c3aed', html, f"Purple primary #7c3aed not found in {path}")
            # Verify chatbot widget injection
            self.assertIn('deckoviz-chatbot-root', html, f"Chatbot widget not found in {path}")
            self.assertIn('deckoviz-chat-toggle', html, f"Chatbot toggle button not found in {path}")
        print("[OK] Test 01: All static pages render purple theme (#7c3aed), company logo, and chatbot widget.")

    def test_02_logo_endpoint(self):
        """Verifies /logo.jpeg returns valid binary jpeg data."""
        res = self.client.get("/logo.jpeg")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers.get("content-type"), "image/jpeg")
        self.assertGreater(len(res.content), 1000, "Logo image file is empty or corrupted")
        print(f"[OK] Test 02: /logo.jpeg served with size {len(res.content)} bytes.")

    def test_03_deckoviz_quizzes_catalog(self):
        """Verifies that Deckoviz Taste Quizzes (IDs 46-49) are registered in the chatbot catalog."""
        res = self.client.get("/quizzes")
        self.assertEqual(res.status_code, 200)
        quizzes = res.json()
        quiz_ids = {q["id"] for q in quizzes}
        self.assertIn(46, quiz_ids, "Quiz 46 (Deckoviz Style Calibration) missing")
        self.assertIn(47, quiz_ids, "Quiz 47 (Folio Taste Matrix) missing")
        self.assertIn(48, quiz_ids, "Quiz 48 (Illuminated Story Studio) missing")
        self.assertIn(49, quiz_ids, "Quiz 49 (Archival Gazette) missing")
        style_quiz = next(q for q in quizzes if q["id"] == 46)
        self.assertEqual(style_quiz["category"], "creative")
        self.assertIn("Deckoviz Style Calibration", style_quiz["title"])
        print(f"[OK] Test 03: Deckoviz Taste Quizzes verified in catalog ({len(quizzes)} total quizzes).")

    def test_04_deckoviz_experiences_catalog(self):
        """Verifies that Deckoviz Atelier Experiences are registered in the experiences catalog."""
        res = self.client.get("/experiences")
        self.assertEqual(res.status_code, 200)
        experiences = res.json()
        exp_ids = {e["id"] for e in experiences}
        self.assertIn("deckoviz-archival-atelier", exp_ids, "Deckoviz Archival Atelier missing")
        self.assertIn("deckoviz-illuminated-story-studio", exp_ids, "Deckoviz Illuminated Story Studio missing")
        self.assertIn("deckoviz-curated-art-salon", exp_ids, "Deckoviz Curated Art Salon missing")
        atelier = next(e for e in experiences if e["id"] == "deckoviz-archival-atelier")
        self.assertIn("Linotype", atelier["title"])
        print(f"[OK] Test 04: Deckoviz Atelier experiences verified in catalog ({len(experiences)} total experiences).")

    def test_05_vizzy_curator_persona(self):
        """Verifies that Vizzy (Deckoviz Atelier Curator) is registered in personas."""
        res = self.client.get("/conversations/personas")
        self.assertEqual(res.status_code, 200)
        personas = res.json()
        vizzy = next((p for p in personas if p["id"] == "vizzy"), None)
        self.assertIsNotNone(vizzy, "Vizzy persona not found")
        self.assertIn("Deckoviz", vizzy["name"])
        print(f"[OK] Test 05: Vizzy Curator persona verified in conversations: '{vizzy['name']}'.")

    def test_06_conversational_quiz_flow(self):
        """Tests the multi-turn conversational quiz pipeline for Deckoviz Style Calibration."""
        # 1. Start Session
        start_res = self.client.post("/session/start", json={"quiz_id": 46, "mode": "solo"})
        self.assertEqual(start_res.status_code, 200)
        session_data = start_res.json()
        session_id = session_data["session_id"]
        self.assertTrue(session_id, "No session ID returned")
        self.assertTrue(session_data["greeting"], "No greeting returned")

        # 2. Answer Turn 1
        chat_res1 = self.client.post("/chat", json={
            "session_id": session_id,
            "message": "I prefer warm afternoon light on raw wood floorboards over cold geometry."
        })
        self.assertEqual(chat_res1.status_code, 200)
        reply1 = chat_res1.json()
        self.assertTrue(reply1["quiz_active"])
        self.assertEqual(reply1["quiz_id"], 46)
        self.assertTrue(reply1["response"])

        # 3. Answer Turn 2
        chat_res2 = self.client.post("/chat", json={
            "session_id": session_id,
            "message": "Thick tactile oil paint ridges with visible palette knife strokes."
        })
        self.assertEqual(chat_res2.status_code, 200)
        reply2 = chat_res2.json()
        self.assertTrue(reply2["quiz_active"])
        print(f"[OK] Test 06: Conversational quiz pipeline successfully conducted 2 turns for Session {session_id[:8]}...")

    def test_07_general_chatbot_endpoint(self):
        """Tests /chat/general endpoint that powers the floating website chatbot."""
        payload = {
            "message": "Which Deckoviz experiences should I attend if I love Victorian woodcuts and printmaking?",
            "history": [
                {"sender": "user", "text": "Hello! What can you tell me about Deckoviz?"},
                {"sender": "assistant", "text": "Welcome! I can guide your style calibration or explore our atelier workshops."}
            ]
        }
        res = self.client.post("/chat/general", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data.get("response"), "Empty response from /chat/general")
        print(f"[OK] Test 07: /chat/general responded: '{data['response'][:85]}...'")

    def test_08_vizzy_persona_dialogue(self):
        """Tests starting a 1-on-1 dialogue with Vizzy through /conversations."""
        start_res = self.client.post("/conversations/session/start", json={"persona_id": "vizzy", "mode": "text"})
        self.assertEqual(start_res.status_code, 200)
        s_data = start_res.json()
        session_id = s_data["session_id"]
        self.assertEqual(s_data["persona_name"], "Vizzy (Deckoviz Atelier Curator)")

        chat_res = self.client.post("/conversations/chat", json={
            "session_id": session_id,
            "message": "I am fascinated by Victorian chiaroscuro and atmospheric paper grain."
        })
        self.assertEqual(chat_res.status_code, 200)
        c_data = chat_res.json()
        self.assertTrue(c_data["response"])
        print(f"[OK] Test 08: 1-on-1 Dialogue with Vizzy active: '{c_data['response'][:85]}...'")

    def test_09_legacy_deckoviz_api(self):
        """Verifies that original /api/quizzes and /api/next remain fully functional."""
        res_list = self.client.get("/api/quizzes")
        self.assertEqual(res_list.status_code, 200)

        step_payload = {
            "quiz_id": "art-style",
            "visitor_id": "test-visitor-001",
            "answers": [
                {"q": "What catches your eye first?", "picked": "Warm afternoon light on raw wood floorboards"}
            ]
        }
        step_res = self.client.post("/api/next", json=step_payload)
        self.assertEqual(step_res.status_code, 200)
        step_data = step_res.json()
        self.assertIn("question", step_data)
        print("[OK] Test 09: Legacy /api/quizzes and /api/next remain operational without breaking.")

if __name__ == "__main__":
    unittest.main()
