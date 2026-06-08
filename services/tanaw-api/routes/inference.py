from __future__ import annotations

import sys
from pathlib import Path

from concurrent.futures import ThreadPoolExecutor

from fastapi import APIRouter, HTTPException

ROOT = Path(__file__).resolve().parents[3]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from semantic_layer import SemanticInterpreter  # noqa: E402

from core.engine import InferenceEngine  # noqa: E402
from core.sessions import session_store  # noqa: E402
from schemas.inference import (  # noqa: E402
    FrameRequest,
    FrameResponse,
    SessionCreateResponse,
    TranslateRequest,
    TranslateResponse,
)

router = APIRouter(prefix="/inference", tags=["inference"])
_semantic = SemanticInterpreter()
_frame_pool = ThreadPoolExecutor(max_workers=2)


@router.post("/session", response_model=SessionCreateResponse)
def create_session() -> SessionCreateResponse:
    session = session_store.create()
    return SessionCreateResponse(sessionId=session.session_id)


@router.delete("/session/{session_id}")
def delete_session(session_id: str) -> dict[str, bool]:
    session_store.delete(session_id)
    return {"ok": True}


@router.post("/frame", response_model=FrameResponse)
async def process_frame(payload: FrameRequest) -> FrameResponse:
    """Stateless bones overlay — no session required (mirrors desktop process_video)."""
    import asyncio

    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        _frame_pool,
        lambda: InferenceEngine.get().process_frame(payload.imageBase64, draw_bones=payload.drawBones),
    )
    return FrameResponse(**result)


@router.post("/translate", response_model=TranslateResponse)
def translate_signs(payload: TranslateRequest) -> TranslateResponse:
    """Gemini semantic layer — display update only (matches demo app _apply_transcript)."""
    transcript = _semantic.interpret(payload.signs) if payload.signs else ""
    return TranslateResponse(transcript=transcript)
