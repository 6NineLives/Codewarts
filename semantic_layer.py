"""
Gemini-powered semantic layer: turns detected sign labels into natural English.
"""

from __future__ import annotations

import os
import threading
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / ".env")

SYSTEM_PROMPT = """You are a Filipino Sign Language translation assistant.
You receive a sequence of detected sign labels from a live recognition system.
Combine them into one short, natural English sentence or phrase.

Rules:
- Use only the signs provided; do not invent signs.
- Fix grammar and word order (e.g. TODAY + SUNDAY -> "Today is Sunday").
- Keep responses concise (one or two sentences max).
- Return ONLY the interpreted English text, no quotes or explanation.
- If signs are unrelated, join them clearly with proper punctuation.
- Label format uses underscores (e.g. THANK_YOU, HOW_ARE_YOU, IM_FINE)."""


class SemanticInterpreter:
    """Calls Gemini to interpret accumulated sign labels in real time."""

    def __init__(self):
        self._lock = threading.Lock()
        self._model = None
        self._available = False
        self._init_client()

    def _init_client(self):
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        model_name = os.getenv("TANAW_GEMINI_MODEL", "gemini-2.5-flash").strip()
        if not api_key:
            print("GEMINI_API_KEY not set — semantic layer disabled.")
            return
        try:
            import google.generativeai as genai

            genai.configure(api_key=api_key)
            self._model = genai.GenerativeModel(
                model_name=model_name,
                system_instruction=SYSTEM_PROMPT,
            )
            self._available = True
            print(f"Semantic layer ready ({model_name})")
        except Exception as exc:
            print(f"Semantic layer init failed: {exc}")

    @property
    def available(self) -> bool:
        return self._available

    def interpret(self, signs: list[str]) -> str:
        """Convert sign labels to natural English."""
        if not signs:
            return ""

        if not self._available:
            return self._fallback(signs)

        labels_text = ", ".join(signs)
        prompt = f"Detected signs (in order): {labels_text}"

        with self._lock:
            try:
                response = self._model.generate_content(prompt)
                text = (response.text or "").strip()
                return text if text else self._fallback(signs)
            except Exception as exc:
                print(f"Gemini error: {exc}")
                return self._fallback(signs)

    @staticmethod
    def _fallback(signs: list[str]) -> str:
        words = [s.replace("_", " ").lower() for s in signs]
        if not words:
            return ""
        sentence = " ".join(words)
        return sentence[0].upper() + sentence[1:] + "."
