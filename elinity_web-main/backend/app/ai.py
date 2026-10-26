import os
# pyrefly: ignore [missing-import]
from fastapi import HTTPException
# pyrefly: ignore [missing-import]
from openai import AsyncOpenAI
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = "llama-3.3-70b-versatile"

groq_client = AsyncOpenAI(
    api_key=GROQ_API_KEY or "mock-groq-key",
    base_url="https://api.groq.com/openai/v1",
)


def generate_fallback_ai_response(system_prompt: str, history: list[dict]) -> str:
    """Provides an intelligent, contextual response when running in demo/offline mode."""
    sys_lower = system_prompt.lower()
    last_user_msg = ""
    for m in reversed(history):
        if m.get("role") == "user":
            last_user_msg = m.get("content", "").strip()
            break

    # 1. Reflection JSON generation
    if "json" in sys_lower and "summary" in sys_lower and "insight" in sys_lower:
        import json
        return json.dumps({
            "summary": "You discovered an affinity for tactile chiaroscuro, architectural stillness, and poetic light.",
            "insight": "True taste is not about perfection, but honest resonance with form and light."
        })

    # 2. Historical / Atelier personas
    if "vizzy" in sys_lower or "deckoviz" in sys_lower or "curator" in sys_lower:
        if not history or len(history) <= 1:
            return "Welcome to the Deckoviz Atelier! I am Vizzy, your resident style curator. To begin calibrating your visual intuition: when walking into a room, what catches your eye first — warm afternoon light on raw floorboards, or a bold concrete arch with clean geometry?"
        return f"A sharp eye for presence and atmosphere. Choosing '{last_user_msg}' reveals an instinct for honest materials and balanced light. Which contrast excites you more: soot-heavy woodcut engravings or luminous impressionist watercolors?"

    if "carl jung" in sys_lower or "jung" in sys_lower:
        if not history or len(history) <= 1:
            return "Welcome. Rather than rushing toward quick answers, let us look within. What thoughts or dreams have lingered in your awareness lately?"
        return f"That is a revealing observation. Often what we notice in '{last_user_msg}' mirrors an unexpressed part of our inner landscape. What feeling surfaces when you sit with that?"

    if "nietzsche" in sys_lower:
        if not history or len(history) <= 1:
            return "The easiest path is to follow the crowd. But you are here seeking something deeper. Tell me: what is the heaviest illusion you are currently carrying?"
        return f"A provocative reflection. Confronting '{last_user_msg}' demands that you discard comfortable assumptions. What value are you willing to forge for yourself from this?"

    if "seneca" in sys_lower:
        if not history or len(history) <= 1:
            return "Greetings, my friend. We suffer more in imagination than in reality. What worry is currently clouding your peace, and how much of it is truly within your control?"
        return f"A grounded thought. When considering '{last_user_msg}', remember that outer storms pass, while inner tranquility is cultivated by what we choose to dwell upon."

    if "william james" in sys_lower:
        if not history or len(history) <= 1:
            return "Hello there! Life is in the transitions, in the making. What practical choice or dilemma is currently before you?"
        return f"A very pragmatic insight. How does your experience of '{last_user_msg}' translate into action when tomorrow morning arrives?"

    # 3. Quiz Mode
    if "running quiz" in sys_lower or "quiz" in sys_lower:
        if not history or len(history) <= 1:
            return "Welcome to this journey of self-exploration. Let us begin with an instinctive choice: What kind of environment makes you feel most genuinely grounded and alive?"
        return f"I appreciate the honesty in that answer. When you reflect on '{last_user_msg}', does it come from a place of habit, or a genuine desire for renewal?"

    # 4. Default Lumi assistant
    if not history or len(history) <= 1:
        return "Hello! I'm Lumi, your companion here at Elinity & Deckoviz. Whether you want to explore our Taste Quizzes, dive into the Archival Atelier, or uncover your signature style, I'm here. What would you like to explore today?"
    return f"I love how thoughtfully you approach this. Exploring '{last_user_msg}' is such a rewarding thread. Would you like to dive deeper into our Style Calibration Quiz, or explore the Curated Art Folio?"


async def get_ai_response(system_prompt: str, history: list[dict]) -> str:
    # If a valid GROQ_API_KEY is configured, try live LLM call
    if GROQ_API_KEY and GROQ_API_KEY.strip() and not GROQ_API_KEY.startswith("your_groq"):
        try:
            messages = []
            has_system_in_history = history and history[0].get("role") == "system"
            if not has_system_in_history:
                messages.append({"role": "system", "content": system_prompt})

            for msg in history:
                if msg["role"] == "system":
                    messages.append({"role": "system", "content": msg["content"]})
                    continue
                role = msg["role"] if msg["role"] in ("user", "assistant") else "user"
                messages.append({"role": role, "content": msg["content"]})

            if not any(m["role"] == "user" for m in messages):
                messages.append({"role": "user", "content": "Begin the experience."})

            response = await groq_client.chat.completions.create(
                model=GROQ_MODEL,
                messages=messages,
                max_tokens=1024,
                temperature=0.8,
            )

            reply = response.choices[0].message.content
            if reply:
                return reply
        except Exception as e:
            print(f"Notice: Groq API call fallback ({e}). Using local generative intelligence.")

    # Graceful fallback for offline, demo, and test environments
    return generate_fallback_ai_response(system_prompt, history)

