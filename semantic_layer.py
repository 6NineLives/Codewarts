"""
Gemini-powered semantic layer: turns detected sign labels into natural Tagalog.
"""

from __future__ import annotations

import os
import threading
from pathlib import Path

from dotenv import load_dotenv

from sign_labels import to_tagalog, to_tagalog_list

load_dotenv(Path(__file__).resolve().parent / ".env")

SYSTEM_PROMPT = """Ikaw ay isang katulong sa pagsasalin ng Filipino Sign Language (FSL).
Tatanggap ka ng sunod-sunod na mga senyas mula sa live recognition system.
Pag-isahin mo ang mga ito sa isang maikli at natural na pangungusap o parirala sa TAGALOG.

Mga alituntunin:
- Gamitin lamang ang ibinigay na mga senyas; huwag mag-imbento.
- Ayusin ang gramatika at ayos ng salita sa natural na Tagalog.
- Panatilihing maikli ang sagot (isa o dalawang pangungusap lang).
- Ibabalik mo LAMANG ang isinaling teksto sa Tagalog — walang quotes, paliwanag, o Ingles.
- Kung hindi magkaugnay ang mga senyas, pagdugtungin nang malinaw gamit ang tamang bantas.
- Ang mga senyas ay ibinibigay sa Tagalog (hal. Salamat, Kumusta ka?, Okay lang ako)."""


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
            print(f"Semantic layer ready ({model_name}, Tagalog output)")
        except Exception as exc:
            print(f"Semantic layer init failed: {exc}")

    @property
    def available(self) -> bool:
        return self._available

    def interpret(self, signs: list[str]) -> str:
        """Convert sign labels to natural Tagalog."""
        if not signs:
            return ""

        if not self._available:
            return self._fallback(signs)

        tagalog_signs = to_tagalog_list(signs)
        labels_text = ", ".join(tagalog_signs)
        prompt = f"Natukoy na mga senyas (sunod-sunod): {labels_text}"

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
        words = to_tagalog_list(signs)
        if not words:
            return ""
        sentence = " ".join(words)
        if sentence and sentence[-1] not in ".?!":
            sentence += "."
        return sentence[0].upper() + sentence[1:] if sentence else ""
