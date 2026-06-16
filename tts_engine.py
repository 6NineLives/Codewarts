"""Tagalog text-to-speech — edge-tts Filipino neural voices with fallbacks."""

from __future__ import annotations

import asyncio
import os
import tempfile
import threading
from pathlib import Path

DEFAULT_VOICE = "fil-PH-BlessicaNeural"
FALLBACK_VOICE = "fil-PH-AngeloNeural"


class TagalogTTS:
    """Speak Tagalog using edge-tts (primary), gTTS, or pyttsx3."""

    def __init__(self):
        self._lock = threading.Lock()
        self._voice = os.getenv("TTS_VOICE", DEFAULT_VOICE).strip() or DEFAULT_VOICE
        self._backend: str | None = None
        self._available = False
        self._synth_cache: dict[str, bytes] = {}
        self._init_backend()

    def _init_backend(self) -> None:
        try:
            import edge_tts  # noqa: F401

            self._backend = "edge"
            self._available = True
            print(f"TTS ready (edge-tts Tagalog, voice={self._voice})")
            return
        except ImportError:
            pass

        try:
            from gtts import gTTS  # noqa: F401

            self._backend = "gtts"
            self._available = True
            print("TTS ready (gTTS Tagalog fallback)")
            return
        except ImportError:
            pass

        try:
            import pyttsx3  # noqa: F401

            self._backend = "pyttsx3"
            self._available = True
            print("TTS ready (pyttsx3 fallback — Tagalog may sound unnatural)")
        except Exception as exc:
            print(f"TTS init failed: {exc}")

    @property
    def available(self) -> bool:
        return self._available

    def speak(self, text: str) -> None:
        if not self._available or not text.strip():
            return

        spoken_text = self._prepare_text_for_tts(text.strip())
        with self._lock:
            try:
                if self._backend == "edge":
                    self._speak_edge(spoken_text)
                elif self._backend == "gtts":
                    self._speak_gtts(spoken_text)
                else:
                    self._speak_pyttsx3(spoken_text)
            except Exception as exc:
                print(f"TTS error ({self._backend}): {exc}")
                if self._backend == "edge":
                    self._try_fallback_chain(spoken_text, skip="edge")

    def synthesize_mp3(self, text: str) -> bytes | None:
        """Return Tagalog speech as MP3 bytes (for mobile clients)."""
        if not self._available or not text.strip():
            return None

        spoken_text = self._prepare_text_for_tts(text.strip())
        with self._lock:
            cached = self._synth_cache.get(spoken_text)
            if cached is not None:
                return cached
            try:
                result: bytes | None = None
                if self._backend == "edge":
                    path = self._run_async(self._edge_to_file(spoken_text))
                    try:
                        result = Path(path).read_bytes()
                    finally:
                        Path(path).unlink(missing_ok=True)
                elif self._backend == "gtts":
                    from gtts import gTTS

                    fd, path = tempfile.mkstemp(suffix=".mp3")
                    os.close(fd)
                    try:
                        gTTS(text=spoken_text, lang="tl").save(path)
                        result = Path(path).read_bytes()
                    finally:
                        Path(path).unlink(missing_ok=True)
                if result:
                    self._synth_cache[spoken_text] = result
                return result
            except Exception as exc:
                print(f"TTS synthesize error ({self._backend}): {exc}")
        return None

    @staticmethod
    def _prepare_text_for_tts(text: str) -> str:
        """Edge-TTS can fail on ultra-short strings like 'Oo.' — pad naturally."""
        core = text.strip().rstrip(".!?")
        if len(core) <= 3 and " " not in core:
            return f"{core} po."
        return text.strip()

    def _try_fallback_chain(self, text: str, skip: str) -> None:
        for backend in ("gtts", "pyttsx3"):
            if backend == skip:
                continue
            try:
                if backend == "gtts":
                    self._speak_gtts(text)
                else:
                    self._speak_pyttsx3(text)
                print(f"TTS recovered via {backend}")
                return
            except Exception as exc:
                print(f"TTS fallback {backend} failed: {exc}")

    def _speak_edge(self, text: str) -> None:
        path = self._run_async(self._edge_to_file(text))
        try:
            self._play_mp3(path)
        finally:
            Path(path).unlink(missing_ok=True)

    async def _edge_to_file(self, text: str) -> str:
        import edge_tts

        fd, path = tempfile.mkstemp(suffix=".mp3")
        os.close(fd)
        for voice in (self._voice, FALLBACK_VOICE):
            try:
                communicate = edge_tts.Communicate(text, voice)
                await communicate.save(path)
                if Path(path).stat().st_size > 800:
                    return path
            except Exception:
                if voice == FALLBACK_VOICE:
                    raise
        return path

    def _speak_gtts(self, text: str) -> None:
        from gtts import gTTS

        fd, path = tempfile.mkstemp(suffix=".mp3")
        os.close(fd)
        try:
            gTTS(text=text, lang="tl").save(path)
            self._play_mp3(path)
        finally:
            Path(path).unlink(missing_ok=True)

    def _speak_pyttsx3(self, text: str) -> None:
        import pyttsx3

        com_init = False
        try:
            import pythoncom

            pythoncom.CoInitialize()
            com_init = True
        except ImportError:
            pass

        engine = None
        try:
            engine = pyttsx3.init()
            engine.setProperty("rate", 175)
            engine.say(text)
            engine.runAndWait()
        finally:
            if engine:
                try:
                    engine.stop()
                except Exception:
                    pass
            if com_init:
                try:
                    import pythoncom

                    pythoncom.CoUninitialize()
                except Exception:
                    pass

    @staticmethod
    def _run_async(coro):
        loop = asyncio.new_event_loop()
        try:
            return loop.run_until_complete(coro)
        finally:
            loop.close()

    @staticmethod
    def _play_mp3(path: str) -> None:
        try:
            from playsound import playsound

            playsound(path, block=True)
            return
        except Exception:
            pass

        import pygame

        if not pygame.mixer.get_init():
            pygame.mixer.init()
        pygame.mixer.music.load(path)
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            pygame.time.wait(50)
