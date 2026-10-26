import base64
import logging
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional

from ..voice.stt import transcribe_audio_bytes
from ..voice.tts import generate_tts_stream
from .conversations import process_chat_message, ReflectionData, sessions

router = APIRouter(prefix="/conversations/voice", tags=["voice"])

logger = logging.getLogger("voice.router")


class VoiceChatResponse(BaseModel):
    user_transcript: str
    ai_response: str
    session_concluded: bool
    reflection: Optional[ReflectionData] = None
    audio_base64: str


@router.post("/transcribe")
async def transcribe_voice(request: Request, filename: str = "audio.webm"):
    """
    Transcribes uploaded raw binary audio to text.
    """
    try:
        audio_bytes = await request.body()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="No audio data received")

        # Extract actual MIME type from request Content-Type header
        content_type = request.headers.get("content-type", "audio/webm")
        # Strip any parameters (e.g., "audio/webm;codecs=opus" -> "audio/webm")
        mime_type = content_type.split(";")[0].strip()

        transcript = await transcribe_audio_bytes(
            audio_bytes, filename=filename, mime_type=mime_type
        )
        return {"text": transcript}
    except ValueError as ve:
        # Audio too short / validation errors — return 400, not 500
        logger.warning(f"Audio validation failed: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error in transcription endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/tts")
async def text_to_speech(text: str, voice: str = "alloy"):
    """
    Streams TTS audio for a given string of text.
    """
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
        
    try:
        audio_stream = generate_tts_stream(text, voice=voice)
        return StreamingResponse(audio_stream, media_type="audio/mpeg")
    except Exception as e:
        logger.error(f"Error in TTS endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat", response_model=VoiceChatResponse)
async def voice_chat(request: Request, session_id: str, filename: str = "audio.webm", voice: str = "alloy"):
    """
    Consolidated voice endpoint:
    1. Transcribes incoming raw audio bytes.
    2. Sends the transcript to the existing conversation flow.
    3. Converts the AI text response to speech.
    4. Returns a single unified response containing transcripts and base64 audio.
    """
    try:
        audio_bytes = await request.body()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="No audio data received")

        # Extract actual MIME type from the request Content-Type header
        content_type = request.headers.get("content-type", "audio/webm")
        mime_type = content_type.split(";")[0].strip()

        logger.info(
            f"Voice chat: session={session_id}, file={filename}, "
            f"content_type={content_type}, audio_size={len(audio_bytes)} bytes"
        )

        # 1. Transcribe speech to text
        user_transcript = await transcribe_audio_bytes(
            audio_bytes, filename=filename, mime_type=mime_type
        )
        if not user_transcript:
            raise HTTPException(status_code=400, detail="Could not transcribe audio")

        # 2. Process message using existing chat engine (Groq, memory, reflection)
        chat_res = await process_chat_message(session_id, user_transcript)

        # Look up active persona's name for realistic TTS matching
        session = sessions.get(session_id)
        persona_name = session.get("persona_name", voice) if session else voice

        # 3. Synthesize reply to speech
        audio_base64 = ""
        try:
            tts_chunks = []
            async for chunk in generate_tts_stream(chat_res.response, voice=persona_name):
                tts_chunks.append(chunk)
            full_audio_bytes = b"".join(tts_chunks)
            audio_base64 = base64.b64encode(full_audio_bytes).decode("utf-8")
        except Exception as e:
            logger.warning(f"TTS synthesis skipped or failed (falling back to client browser TTS): {e}")

        # 4. Return combined result
        return VoiceChatResponse(
            user_transcript=user_transcript,
            ai_response=chat_res.response,
            session_concluded=chat_res.session_concluded,
            reflection=chat_res.reflection,
            audio_base64=audio_base64
        )

    except ValueError as ve:
        # Audio too short / validation errors — return 400
        logger.warning(f"Voice chat audio validation failed: {ve}")
        raise HTTPException(status_code=400, detail=str(ve))
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error in voice chat endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
