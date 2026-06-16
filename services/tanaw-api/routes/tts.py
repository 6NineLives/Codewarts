from __future__ import annotations

import base64
import sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from fastapi import APIRouter, HTTPException

ROOT = Path(__file__).resolve().parents[3]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tts_engine import TagalogTTS  # noqa: E402

from schemas.inference import TtsRequest, TtsResponse  # noqa: E402

router = APIRouter(tags=["tts"])
_tts = TagalogTTS()
_tts_pool = ThreadPoolExecutor(max_workers=2)

# Demo transcripts — warmed on API startup so first mobile playback is instant.
_DEMO_TTS_PHRASES = (
    "Hello.",
    "Magandang Hapon. Ikinagagalak ko kayong makilala",
    "Oo po.",
    "Hindi.",
    "Isa. Dalawa. Tatlo.",
    "Anim. Pito.",
)


def warm_demo_tts_cache() -> None:
    if not _tts.available:
        return
    for phrase in _DEMO_TTS_PHRASES:
        _tts.synthesize_mp3(phrase)


@router.post("/tts", response_model=TtsResponse)
async def synthesize_speech(payload: TtsRequest) -> TtsResponse:
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    import asyncio

    loop = asyncio.get_event_loop()
    audio = await loop.run_in_executor(_tts_pool, _tts.synthesize_mp3, text)
    if not audio:
        raise HTTPException(status_code=503, detail="TTS unavailable on server")

    return TtsResponse(
        audioBase64=base64.b64encode(audio).decode("ascii"),
        mimeType="audio/mpeg",
    )
