"""In-memory inference session state."""

from __future__ import annotations

import time
import uuid
from collections import deque
from dataclasses import dataclass, field

from core.detector import StableSignDetector

SEQUENCE_LENGTH = 30


@dataclass
class InferenceSession:
    session_id: str
    detected_signs: list[str] = field(default_factory=list)
    sequence: deque = field(default_factory=lambda: deque(maxlen=SEQUENCE_LENGTH))
    sign_detector: StableSignDetector = field(default_factory=StableSignDetector)
    frame_counter: int = 0
    live_sign: str = ""
    live_confidence: float = 0.0
    transcript: str = ""
    last_semantic_at: float = 0.0
    created_at: float = field(default_factory=time.time)


class SessionStore:
    def __init__(self) -> None:
        self._sessions: dict[str, InferenceSession] = {}

    def create(self) -> InferenceSession:
        session = InferenceSession(session_id=str(uuid.uuid4()))
        self._sessions[session.session_id] = session
        return session

    def get(self, session_id: str) -> InferenceSession | None:
        return self._sessions.get(session_id)

    def delete(self, session_id: str) -> None:
        self._sessions.pop(session_id, None)


session_store = SessionStore()
