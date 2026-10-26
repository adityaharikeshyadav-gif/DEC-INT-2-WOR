import os
import logging
from typing import AsyncIterator
from dotenv import load_dotenv
from openai import AsyncOpenAI
import edge_tts

load_dotenv()

logger = logging.getLogger("voice.tts")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

openai_client = None
if OPENAI_API_KEY:
    openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)


def select_edge_voice(voice_or_persona: str) -> str:
    """
    Selects a realistic Edge TTS neural voice based on the requested voice or persona name.
    """
    name_lower = voice_or_persona.lower()
    
    # Check for masculine names/personas (including Seneca, Nietzsche, Jung, James)
    masculine_indicators = [
        "jung", "nietzsche", "seneca", "james", "carl", "friedrich", "william",
        "guy", "boy", "man", "philosopher", "thinker", "socrates", "alloy", "onyx", "echo"
    ]
    if any(ind in name_lower for ind in masculine_indicators):
        return "en-US-GuyNeural"
        
    return "en-US-AriaNeural"


def select_openai_voice(voice_or_persona: str) -> str:
    """
    Maps custom persona names/genders to supported OpenAI voice presets:
    alloy, echo, fable, onyx, nova, shimmer.
    """
    name_lower = voice_or_persona.lower()
    if name_lower in ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]:
        return name_lower
        
    masculine_indicators = [
        "jung", "nietzsche", "seneca", "james", "carl", "friedrich", "william",
        "guy", "boy", "man", "philosopher", "thinker", "socrates"
    ]
    if any(ind in name_lower for ind in masculine_indicators):
        return "onyx"
        
    feminine_indicators = ["aria", "girl", "woman", "samantha", "shimmer", "nova"]
    if any(ind in name_lower for ind in feminine_indicators):
        return "shimmer"
        
    return "alloy"


async def generate_tts_stream(text: str, voice: str = "alloy") -> AsyncIterator[bytes]:
    """
    Streams audio bytes generated from text using OpenAI's TTS API or Edge TTS fallback.
    """
    if not text.strip():
        raise ValueError("Cannot synthesize empty text")

    # 1. If OpenAI API Key is configured, use premium OpenAI TTS
    if openai_client:
        try:
            openai_voice = select_openai_voice(voice)
            logger.info(f"Generating TTS using OpenAI model for: '{text[:40]}...' mapped voice: {openai_voice}")
            response = await openai_client.audio.speech.create(
                model="tts-1",
                voice=openai_voice,
                input=text,
                response_format="mp3",
            )
            async for chunk in response.iter_bytes(chunk_size=1024):
                yield chunk
            return
        except Exception as e:
            logger.error(f"OpenAI TTS synthesis failed: {e}. Falling back to Edge TTS...")
            # Fall through to Edge TTS if OpenAI fails

    # 2. Use Edge TTS (completely free, neural, highly human-like)
    try:
        edge_voice = select_edge_voice(voice)
        logger.info(f"Generating TTS using Edge Neural Voice ({edge_voice}) for: '{text[:40]}...'")
        communicate = edge_tts.Communicate(text, edge_voice)
        
        async for chunk in communicate.stream():
            if chunk.get("type") == "audio":
                yield chunk["data"]
                
    except Exception as e:
        logger.error(f"Edge TTS synthesis failed: {e}")
        raise RuntimeError(f"TTS synthesis failed: {e}")
