"""
Demo FSL Translator — 6 hardcoded states, one per Start translating click.
Multi-sign states reveal each label in the bottom-left every 5 seconds.
"""

from __future__ import annotations

import tkinter as tk
import cv2

from fsl_translator_app import (
    FSLTranslatorApp,
    crop_to_aspect_ratio,
    letterbox_frame,
)
from semantic_layer import SemanticInterpreter
from sign_labels import to_tagalog

# 6 demo states — each Start click advances to the next state
DEMO_SCENARIOS: list[list[str]] = [
    ["HELLO"],                                          # 1. Hello
    ["GOOD_AFTERNOON", "NICE_TO_MEET_YOU"],             # 2. Magandang hapon + Ikinagagalak…
    ["YES"],                                            # 3. Oo
    ["NO"],                                             # 4. Hindi
    ["ONE", "TWO", "THREE"],                            # 5. Isa, Dalawa, Tatlo
    ["SIX", "SEVEN"],                                   # 6. Anim, Pito
]

DEMO_TAGALOG_OVERRIDES = {
    "NICE_TO_MEET_YOU": "Ikinagagalak ko kayo makilala",
}

DEMO_LABEL_DELAY_MS = 5000


def demo_signs_to_tagalog(keys: list[str]) -> list[str]:
    return [DEMO_TAGALOG_OVERRIDES.get(k, to_tagalog(k)) for k in keys if k]


class DemoSemanticInterpreter(SemanticInterpreter):
    """Semantic layer that accepts demo Tagalog overrides for certain keys."""

    def interpret(self, signs: list[str]) -> str:
        if not signs:
            return ""
        if not self.available:
            return self._demo_fallback(signs)

        tagalog_signs = demo_signs_to_tagalog(signs)
        labels_text = ", ".join(tagalog_signs)
        prompt = f"Natukoy na mga senyas (sunod-sunod): {labels_text}"

        with self._lock:
            try:
                response = self._model.generate_content(prompt)
                text = (response.text or "").strip()
                return text if text else self._demo_fallback(signs)
            except Exception as exc:
                print(f"Gemini error: {exc}")
                return self._demo_fallback(signs)

    @staticmethod
    def _demo_fallback(signs: list[str]) -> str:
        words = demo_signs_to_tagalog(signs)
        if not words:
            return ""
        sentence = " ".join(words)
        if sentence and sentence[-1] not in ".?!":
            sentence += "."
        return sentence[0].upper() + sentence[1:] if sentence else ""


class FSLTranslatorDemoApp(FSLTranslatorApp):
    def __init__(self, root):
        self._demo_index = 0
        self._demo_timers: list[str] = []
        super().__init__(root)
        self.root.title("Senyas FSL Translator (Demo)")
        self.semantic = DemoSemanticInterpreter()
        self.translate_btn.config(text="Start translating")

    def load_model(self):
        print("Demo mode — LSTM model skipped")

    def _cancel_demo_timers(self):
        for timer_id in self._demo_timers:
            try:
                self.root.after_cancel(timer_id)
            except tk.TclError:
                pass
        self._demo_timers.clear()
        if self.gemini_timer:
            self.root.after_cancel(self.gemini_timer)
            self.gemini_timer = None

    def _schedule_demo_timer(self, delay_ms: int, callback):
        timer_id = self.root.after(delay_ms, callback)
        self._demo_timers.append(timer_id)
        return timer_id

    def _play_demo_scenario(self, signs: list[str]):
        """Reveal each sign in the bottom-left, 5 seconds apart. Semantic runs after the last."""
        self._cancel_demo_timers()
        self.detected_signs = []
        self.label_display.config(text="—")
        self._update_transcript_display("Nakikinig…")

        def reveal_sign(index: int):
            if not self.is_translating or index >= len(signs):
                return

            sign = signs[index]
            with self.state_lock:
                self.detected_signs.append(sign)

            tagalog = demo_signs_to_tagalog([sign])[0]
            self.label_display.config(text=tagalog)
            print(f"Demo recognized ({index + 1}/{len(signs)}): {tagalog}")

            if index + 1 < len(signs):
                self._schedule_demo_timer(
                    DEMO_LABEL_DELAY_MS,
                    lambda next_index=index + 1: reveal_sign(next_index),
                )
            else:
                signs_copy = list(self.detected_signs)
                interim = DemoSemanticInterpreter._demo_fallback(signs_copy)
                self._update_transcript_display(interim)
                print(f"Demo state complete: {signs_copy} → {interim}")
                self._speak_demo_transcript(interim)
                self._schedule_semantic_update()

        self._schedule_demo_timer(DEMO_LABEL_DELAY_MS, lambda: reveal_sign(0))

    def _speak_demo_transcript(self, text: str):
        if not text or not self.tts_available:
            return
        self.last_spoken = text
        self.speak_text(text)

    def _schedule_semantic_update(self):
        if self.gemini_timer:
            self.root.after_cancel(self.gemini_timer)
            self.gemini_timer = None
        self._run_semantic_update()

    def _apply_transcript(self, text):
        """Gemini updates the display only — TTS already spoke the demo fallback."""
        if not text:
            return
        self.transcript = text
        self._update_transcript_display(text)

    def toggle_translating(self):
        if not self.is_translating:
            signs = list(DEMO_SCENARIOS[self._demo_index])
            self._demo_index = (self._demo_index + 1) % len(DEMO_SCENARIOS)

            self.is_translating = True
            self.transcript = ""
            self.last_spoken = ""
            self.translate_btn.config(text="Stop translating", bg="#9b2226")
            self._play_demo_scenario(signs)
        else:
            self._cancel_demo_timers()
            self.is_translating = False
            self.translate_btn.config(text="Start translating", bg="#2d6a4f")

    def process_video(self):
        while self.video_running and self.cap and self.cap.isOpened():
            ret, frame = self._read_latest_frame()
            if not ret:
                break

            frame = crop_to_aspect_ratio(frame)
            output = self.tracker.process(frame)
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            if self.show_bones:
                self.tracker.draw_landmarks(rgb, output, inplace=True)

            if self.is_recording_video:
                self._write_video_frame(cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR))

            cw, ch = self._container_size
            with self.frame_lock:
                self.current_frame = letterbox_frame(rgb, cw, ch)
                self.frame_version += 1

    def on_closing(self):
        self._cancel_demo_timers()
        super().on_closing()


if __name__ == "__main__":
    root = tk.Tk()
    app = FSLTranslatorDemoApp(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()
