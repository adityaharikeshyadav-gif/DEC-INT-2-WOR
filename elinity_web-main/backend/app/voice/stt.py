import os
import logging
from io import BytesIO
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

logger = logging.getLogger("voice.stt")

# Clients initialization
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

openai_client = None
if OPENAI_API_KEY:
    openai_client = AsyncOpenAI(api_key=OPENAI_API_KEY)

groq_client = None
if GROQ_API_KEY:
    groq_client = AsyncOpenAI(
        api_key=GROQ_API_KEY,
        base_url="https://api.groq.com/openai/v1",
    )

# Minimum audio size to even attempt transcription (bytes).
# A meaningful speech segment at typical webm/opus bitrates is at least ~4KB.
# Anything smaller is almost certainly silence or noise.
MIN_AUDIO_SIZE = 4000


def _detect_mime_type(filename: str, fallback: str = "audio/webm") -> str:
    """Infer MIME type from filename extension."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    mime_map = {
        "webm": "audio/webm",
        "mp4": "audio/mp4",
        "m4a": "audio/mp4",
        "aac": "audio/aac",
        "ogg": "audio/ogg",
        "wav": "audio/wav",
        "mp3": "audio/mpeg",
        "flac": "audio/flac",
    }
    return mime_map.get(ext, fallback)


import asyncio

import tempfile

async def transcode_to_wav(audio_bytes: bytes, extension: str = "webm") -> bytes:
    """
    Transcodes raw audio bytes (WebM, MP4, etc.) to standard 16kHz mono WAV format using ffmpeg.
    Uses temporary files to support seekable container parsing, avoiding pipe-streaming errors.
    """
    temp_in = None
    temp_out = None
    try:
        # Write incoming bytes to a temporary input file preserving the source container extension
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{extension}") as f_in:
            f_in.write(audio_bytes)
            temp_in = f_in.name

        # Create a temporary output file path
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as f_out:
            temp_out = f_out.name

        # Run ffmpeg on seekable files
        process = await asyncio.create_subprocess_exec(
            "ffmpeg", "-y", "-i", temp_in, "-f", "wav", "-ar", "16000", "-ac", "1", temp_out,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout_data, stderr_data = await process.communicate()
        
        if process.returncode != 0:
            err_msg = stderr_data.decode("utf-8", errors="ignore").strip()
            logger.warning(f"ffmpeg transcoding failed (returncode={process.returncode}): {err_msg}")
            try:
                # Save to workspace root for diagnostic inspection
                diag_path = "/Volumes/SanDisk/freelancing/elinity_web/diag_failed.webm"
                with open(diag_path, "wb") as f_diag:
                    f_diag.write(audio_bytes)
                logger.info(f"Saved diagnostic failed audio to {diag_path}")
            except Exception as ex:
                logger.warning(f"Could not save diagnostic audio: {ex}")
            return audio_bytes
            
        # Read the transcoded wav bytes
        with open(temp_out, "rb") as f_res:
            wav_bytes = f_res.read()

        logger.info(f"Successfully transcoded {len(audio_bytes)} bytes to {len(wav_bytes)} bytes of 16kHz mono WAV.")
        return wav_bytes
    except Exception as e:
        logger.warning(f"Could not transcode audio using ffmpeg: {e}")
        return audio_bytes
    finally:
        # Clean up temp files
        for path in (temp_in, temp_out):
            if path and os.path.exists(path):
                try:
                    os.remove(path)
                except Exception as e:
                    logger.warning(f"Failed to remove temp file {path}: {e}")


async def transcribe_audio_bytes(
    audio_bytes: bytes,
    filename: str = "audio.webm",
    mime_type: str | None = None,
) -> str:
    """
    Transcribes audio bytes to text using OpenAI Whisper API or Groq Whisper API fallback.
    """
    if not audio_bytes:
        raise ValueError("Audio bytes are empty")

    # Validate minimum audio size before sending to any API
    if len(audio_bytes) < MIN_AUDIO_SIZE:
        logger.warning(
            f"Audio too short ({len(audio_bytes)} bytes < {MIN_AUDIO_SIZE}). "
            "Likely silence or noise — skipping transcription."
        )
        raise ValueError(
            f"Audio recording too short ({len(audio_bytes)} bytes). "
            "Please speak clearly and try again."
        )

    # Resolve MIME type: explicit > filename-inferred > default
    resolved_mime = mime_type or _detect_mime_type(filename)

    # Diagnostic: log header bytes to verify container integrity
    header_hex = audio_bytes[:20].hex(' ') if len(audio_bytes) >= 20 else audio_bytes.hex(' ')
    logger.info(
        f"Incoming audio: {len(audio_bytes)} bytes, filename={filename}, "
        f"mime={resolved_mime}, header=[{header_hex}]"
    )

    # Extract format extension from filename (default to webm)
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else "webm"

    # Transcode to standard WAV to prevent parser errors on strict APIs (like Groq)
    transcoded_bytes = await transcode_to_wav(audio_bytes, extension=extension)
    
    # If transcoding was successful, update format metadata
    if transcoded_bytes != audio_bytes:
        resolved_mime = "audio/wav"
        filename = "audio.wav"
        audio_payload = transcoded_bytes
    else:
        audio_payload = audio_bytes

    # In-memory file-like object
    audio_file = BytesIO(audio_payload)
    audio_file.name = filename

    # 1. Try OpenAI if key is present
    if openai_client:
        try:
            logger.info("Transcribing using OpenAI Whisper...")
            response = await openai_client.audio.transcriptions.create(
                model="whisper-1",
                file=(filename, audio_file, resolved_mime),
            )
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            logger.error(f"OpenAI Whisper transcription failed: {e}")
            # Fall through to Groq if possible

    # 2. Try Groq as fallback
    if groq_client:
        try:
            logger.info("Transcribing using Groq Whisper fallback...")
            # Rewind file pointer
            audio_file.seek(0)
            response = await groq_client.audio.transcriptions.create(
                model="whisper-large-v3-turbo",
                file=(filename, audio_file, resolved_mime),
            )
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            logger.error(f"Groq Whisper transcription failed: {e}")
            raise RuntimeError(f"Transcription failed: {e}")

    # 3. No client available
    error_msg = "No transcription API client configured. Please set OPENAI_API_KEY or GROQ_API_KEY in .env."
    logger.error(error_msg)
    raise RuntimeError(error_msg)
