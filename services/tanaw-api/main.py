"""
TANAW API — bridges the Expo mobile app and Codewarts Python ML backend.
"""

from __future__ import annotations

from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI

# Load Codewarts/.env (Gemini, TTS) regardless of uvicorn cwd.
load_dotenv(Path(__file__).resolve().parents[2] / ".env")
from fastapi.middleware.cors import CORSMiddleware

from contextlib import asynccontextmanager

from core.engine import InferenceEngine
from routes.health import router as health_router
from routes.inference import router as inference_router
from routes.tts import router as tts_router, warm_demo_tts_cache


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Pre-load MediaPipe holistic tracker so first /inference/frame is fast.
    engine = InferenceEngine.get()
    if engine.bones_ready:
        print("Holistic tracker ready — bones overlay enabled")
    else:
        print(f"Holistic tracker failed: {engine.tracker_error}")
    warm_demo_tts_cache()
    yield


app = FastAPI(
    title="TANAW API",
    description="FSL inference bridge for the TANAW mobile app",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(inference_router)
app.include_router(tts_router)


@app.get("/")
def root() -> dict[str, str]:
    return {"service": "tanaw-api", "docs": "/docs"}
