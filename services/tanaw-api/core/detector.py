"""Stable sign detection — ported from fsl_translator_app.py."""

from __future__ import annotations

STABLE_FRAMES_TO_RECORD = 10
SIGN_COOLDOWN_FRAMES = 12


class StableSignDetector:
    """Record a sign when the model holds the same label for several frames."""

    def __init__(self) -> None:
        self.reset()

    def reset(self) -> None:
        self.cooldown = 0
        self.candidate: str | None = None
        self.streak = 0

    def update(self, sign: str | None, confidence: float, threshold: float) -> str | None:
        if self.cooldown > 0:
            self.cooldown -= 1
            return None

        if not sign or confidence < threshold:
            self.candidate = None
            self.streak = 0
            return None

        if sign == self.candidate:
            self.streak += 1
        else:
            self.candidate = sign
            self.streak = 1

        if self.streak >= STABLE_FRAMES_TO_RECORD:
            recorded = self.candidate
            self.candidate = None
            self.streak = 0
            self.cooldown = SIGN_COOLDOWN_FRAMES
            return recorded
        return None
