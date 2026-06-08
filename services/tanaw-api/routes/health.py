from __future__ import annotations

import sys
from pathlib import Path

from fastapi import APIRouter

ROOT = Path(__file__).resolve().parents[3]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from sign_labels import ENGLISH_KEYS, TAGALOG_BY_KEY  # noqa: E402
from semantic_layer import SemanticInterpreter  # noqa: E402

from core.engine import InferenceEngine  # noqa: E402
from schemas.inference import HealthResponse, LabelsResponse  # noqa: E402

router = APIRouter(tags=["health"])
_semantic = SemanticInterpreter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    engine = InferenceEngine.get()
    return HealthResponse(
        status="ok",
        bonesReady=engine.bones_ready,
        bonesError=engine.tracker_error,
        semanticReady=_semantic.available,
        ttsReady=True,
    )


@router.get("/labels", response_model=LabelsResponse)
def labels() -> LabelsResponse:
    return LabelsResponse(keys=list(ENGLISH_KEYS), tagalogByKey=dict(TAGALOG_BY_KEY))
