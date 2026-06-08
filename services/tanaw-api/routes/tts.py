from __future__ import annotations

import base64
import sys
from pathlib import Path

from fastapi import APIRouter, HTTPException

ROOT = Path(__file__).resolve().parents[3]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from tts_engine import TagalogTTS  # noqa: E402

from schemas.inference import TtsRequest, TtsResponse  # noqa: E402

router = APIRouter(tags=["tts"])
_tts = TagalogTTS()


@router.post("/tts", response_model=TtsResponse)
def synthesize_speech(payload: TtsRequest) -> TtsResponse:
    text = payload.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    audio = _tts.synthesize_mp3(text)
    if not audio:
        raise HTTPException(status_code=503, detail="TTS unavailable on server")

    return TtsResponse(
        audioBase64=base64.b64encode(audio).decode("ascii"),
        mimeType="audio/mpeg",
    )
