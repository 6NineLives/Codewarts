"""
Filipino Sign Language Translator — real-time recognition with Gemini semantic layer.
"""

import tkinter as tk
from tkinter import messagebox, filedialog
import cv2
from PIL import Image, ImageTk
import numpy as np
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout, Conv1D
from tensorflow.keras.regularizers import l2
import threading
import pyttsx3
import joblib
from pathlib import Path
from datetime import datetime
from collections import deque
import time

from fsl_landmarks import HolisticTracker, KEYPOINT_DIM
from semantic_layer import SemanticInterpreter

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
FSL_15_DIR = MODELS_DIR / "fsl_15_lstm"
LABELS_PATH = FSL_15_DIR / "action_labels_15.npy"
SCALER_PATH = FSL_15_DIR / "scaler.pkl"
MODEL_CANDIDATES = [
    FSL_15_DIR / "fsl_15_model.h5",
    FSL_15_DIR / "training" / "best_model.h5",
    FSL_15_DIR / "training" / "final_model.h5",
    MODELS_DIR / "fsl_15_model.h5",
    MODELS_DIR / "fsl_11_model.h5",
]
SEQUENCE_LENGTH = 30
PREDICTION_CONFIDENCE_THRESHOLD = 0.70
MAX_LIVE_SIGNS = 20
STABLE_FRAMES_TO_RECORD = 10   # ~0.3s same prediction → record sign
SIGN_COOLDOWN_FRAMES = 12
GEMINI_DEBOUNCE_SEC = 0.8

# Video / latency tuning
ASPECT_RATIO = 16 / 9
CAMERA_WIDTH = 640
CAMERA_HEIGHT = 360          # 16:9 capture
TRACKER_PROCESS_WIDTH = 480
DISPLAY_INTERVAL_MS = 16          # ~60 fps UI cap
INFERENCE_EVERY_N_FRAMES = 2      # LSTM runs every N processed frames
UI_LABEL_MIN_INTERVAL_MS = 80     # throttle live sign label updates
DROP_STALE_CAMERA_FRAMES = 2      # grab() skips buffered old frames

# Minimal palette
BG = "#0f0f0f"
BAR_BG = "#1a1a1a"
TEXT = "#e8e8e8"
MUTED = "#888888"
ACCENT = "#4a9eff"
TRANSCRIPT_FG = "#7dcea0"


def prepare_model_input(sequence, scaler):
    seq_array = np.array(sequence, dtype=np.float32)
    seq_reshaped = seq_array.reshape(-1, seq_array.shape[-1])
    seq_scaled = scaler.transform(seq_reshaped)
    return np.expand_dims(seq_scaled, axis=0)


def crop_to_aspect_ratio(frame: np.ndarray, aspect_ratio: float = ASPECT_RATIO) -> np.ndarray:
    """Center-crop frame to the target aspect ratio (default 16:9)."""
    h, w = frame.shape[:2]
    if h == 0 or w == 0:
        return frame
    current_ratio = w / h
    if abs(current_ratio - aspect_ratio) < 0.01:
        return frame
    if current_ratio > aspect_ratio:
        new_w = int(h * aspect_ratio)
        x0 = (w - new_w) // 2
        return frame[:, x0 : x0 + new_w]
    new_h = int(w / aspect_ratio)
    y0 = (h - new_h) // 2
    return frame[y0 : y0 + new_h, :]


def fit_aspect_size(container_w: int, container_h: int, aspect_ratio: float = ASPECT_RATIO) -> tuple[int, int]:
    """Largest (w, h) that fits inside the container at the given aspect ratio."""
    if container_w <= 0 or container_h <= 0:
        return 640, 360
    if container_w / container_h > aspect_ratio:
        h = container_h
        w = int(h * aspect_ratio)
    else:
        w = container_w
        h = int(w / aspect_ratio)
    return max(w, 1), max(h, 1)


def letterbox_frame(frame: np.ndarray, container_w: int, container_h: int) -> np.ndarray:
    """Scale frame to 16:9 inside the container and pad with black bars."""
    rw, rh = fit_aspect_size(container_w, container_h)
    scaled = cv2.resize(frame, (rw, rh), interpolation=cv2.INTER_LINEAR)
    if rw == container_w and rh == container_h:
        return scaled
    canvas = np.zeros((container_h, container_w, 3), dtype=np.uint8)
    x0 = (container_w - rw) // 2
    y0 = (container_h - rh) // 2
    canvas[y0 : y0 + rh, x0 : x0 + rw] = scaled
    return canvas


def resolve_model_path():
    for path in MODEL_CANDIDATES:
        if path.exists():
            return path
    raise FileNotFoundError(
        f"No model found. Expected one of: {[str(p) for p in MODEL_CANDIDATES]}"
    )


def load_fsl_model(num_classes):
    model_path = resolve_model_path()
    try:
        print(f"Loading model from {model_path}")
        return load_model(str(model_path))
    except Exception:
        model = Sequential([
            Conv1D(64, kernel_size=3, activation="relu", input_shape=(SEQUENCE_LENGTH, KEYPOINT_DIM)),
            Dropout(0.3),
            LSTM(64, return_sequences=True, kernel_regularizer=l2(0.001)),
            Dropout(0.5),
            LSTM(128, return_sequences=False, kernel_regularizer=l2(0.001)),
            Dropout(0.5),
            Dense(64, activation="relu", kernel_regularizer=l2(0.001)),
            Dropout(0.3),
            Dense(num_classes, activation="softmax"),
        ])
        model.load_weights(str(model_path))
        return model


def append_sign_no_spam(sign_list, sign, max_len=MAX_LIVE_SIGNS):
    if sign_list and sign == sign_list[-1]:
        return False
    sign_list.append(sign)
    if len(sign_list) > max_len:
        del sign_list[:-max_len]
    return True


class StableSignDetector:
    """Record a sign when the model holds the same label for several frames."""

    def __init__(self):
        self.reset()

    def reset(self):
        self.cooldown = 0
        self.candidate = None
        self.streak = 0

    def update(self, sign, confidence, threshold):
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


class FSLTranslatorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Senyas FSL Translator")
        self.root.geometry("1100x780")
        self.root.configure(bg=BG)
        self.root.minsize(900, 640)

        self.is_translating = False
        self.show_bones = True
        self.is_recording_video = False
        self.video_writer = None
        self.record_path = None

        self.cap = None
        self.tracker = None
        self.model = None
        self.scaler = None
        self.actions = None
        self.semantic = SemanticInterpreter()

        self.detected_signs = []
        self.current_label = "—"
        self.transcript = ""
        self.last_spoken = ""
        self.confidence_threshold = PREDICTION_CONFIDENCE_THRESHOLD

        self.sign_detector = StableSignDetector()
        self.sequence = deque(maxlen=SEQUENCE_LENGTH)
        self.video_running = False
        self.current_frame = None
        self.frame_lock = threading.Lock()
        self.frame_version = 0
        self._last_shown_version = -1
        self._container_size = (640, 360)
        self._render_size = (640, 360)
        self._frame_counter = 0
        self._last_live_sign = ""
        self._last_live_conf = 0.0
        self._last_label_update_ms = 0
        self.state_lock = threading.Lock()
        self.gemini_timer = None
        self.live_sign = ""
        self.live_confidence = 0.0

        self.tts_lock = threading.Lock()
        self.tts_voice_id = None
        self.tts_rate = 180
        self.tts_volume = 0.9
        self.tts_available = self._init_tts_preferences()

        self.setup_ui()
        self.load_model()
        self.root.after(100, self.start_camera)
        self.root.after(500, self._refresh_display_size)
        self.update_frame()

    def setup_ui(self):
        self.camera_frame = tk.Frame(self.root, bg="#000000")
        self.camera_frame.pack(fill=tk.BOTH, expand=True, padx=16, pady=(16, 8))

        self.video_label = tk.Label(self.camera_frame, bg="#000000", bd=0)
        self.video_label.pack(expand=True)

        self.bottom_bar = tk.Frame(self.root, bg=BAR_BG, height=88)
        self.bottom_bar.pack(fill=tk.X, side=tk.BOTTOM)
        self.bottom_bar.pack_propagate(False)

        self.bottom_bar.grid_columnconfigure(0, weight=1, minsize=160)
        self.bottom_bar.grid_columnconfigure(1, weight=4, minsize=280)
        self.bottom_bar.grid_columnconfigure(2, weight=1, minsize=220)

        # Left — predicted label
        label_panel = tk.Frame(self.bottom_bar, bg=BAR_BG)
        label_panel.grid(row=0, column=0, sticky="nsew", padx=(12, 6), pady=10)
        tk.Label(label_panel, text="Sign", font=("Segoe UI", 9), bg=BAR_BG, fg=MUTED).pack(anchor="w")
        self.label_display = tk.Label(
            label_panel, text="—", font=("Segoe UI", 16, "bold"),
            bg=BAR_BG, fg=ACCENT, wraplength=140, justify=tk.LEFT,
        )
        self.label_display.pack(anchor="w", fill=tk.X)

        # Middle — transcript (widest)
        transcript_panel = tk.Frame(self.bottom_bar, bg=BAR_BG)
        transcript_panel.grid(row=0, column=1, sticky="nsew", padx=6, pady=10)
        tk.Label(transcript_panel, text="Translation", font=("Segoe UI", 9), bg=BAR_BG, fg=MUTED).pack(anchor="w")
        self.transcript_display = tk.Label(
            transcript_panel, text="Start translating to begin…",
            font=("Segoe UI", 14), bg=BAR_BG, fg=TRANSCRIPT_FG,
            wraplength=520, justify=tk.LEFT, anchor="w",
        )
        self.transcript_display.pack(anchor="w", fill=tk.BOTH, expand=True)

        # Right — buttons
        btn_panel = tk.Frame(self.bottom_bar, bg=BAR_BG)
        btn_panel.grid(row=0, column=2, sticky="nsew", padx=(6, 12), pady=10)

        btn_style = dict(
            font=("Segoe UI", 10), bd=0, padx=10, pady=8,
            cursor="hand2", relief=tk.FLAT,
        )

        self.translate_btn = tk.Button(
            btn_panel, text="Start translating",
            command=self.toggle_translating,
            bg="#2d6a4f", fg=TEXT, activebackground="#40916c", activeforeground=TEXT,
            **btn_style,
        )
        self.translate_btn.pack(fill=tk.X, pady=(0, 4))

        self.record_btn = tk.Button(
            btn_panel, text="Record video",
            command=self.toggle_video_recording,
            bg="#3d3d3d", fg=TEXT, activebackground="#555555", activeforeground=TEXT,
            **btn_style,
        )
        self.record_btn.pack(fill=tk.X, pady=4)

        self.bones_btn = tk.Button(
            btn_panel, text="Turn off bones",
            command=self.toggle_bones,
            bg="#3d3d3d", fg=TEXT, activebackground="#555555", activeforeground=TEXT,
            **btn_style,
        )
        self.bones_btn.pack(fill=tk.X, pady=(4, 0))

    def load_model(self):
        try:
            if not LABELS_PATH.exists():
                raise FileNotFoundError(f"Labels not found: {LABELS_PATH}")
            if not SCALER_PATH.exists():
                raise FileNotFoundError(f"Scaler not found: {SCALER_PATH}")

            self.actions = np.load(LABELS_PATH, allow_pickle=True)
            self.model = load_fsl_model(len(self.actions))
            self.scaler = joblib.load(SCALER_PATH)
            n_features = getattr(self.scaler, "n_features_in_", None)
            if n_features is not None and n_features != KEYPOINT_DIM:
                raise ValueError(f"Scaler expects {n_features} features, app uses {KEYPOINT_DIM}")
            print(f"Loaded {len(self.actions)}-sign LSTM from {FSL_15_DIR.name}")
            self._warmup_model()
        except Exception as exc:
            messagebox.showerror("Error", f"Failed to load model:\n{exc}")

    def _warmup_model(self):
        if self.model is None or self.scaler is None:
            return
        dummy_seq = np.zeros((SEQUENCE_LENGTH, KEYPOINT_DIM), dtype=np.float32)
        self._classify_sequence(dummy_seq)
        print("Model warmup complete")

    def _refresh_display_size(self):
        try:
            cw = max(self.camera_frame.winfo_width(), 640)
            ch = max(self.camera_frame.winfo_height(), 360)
            self._container_size = (cw, ch)
            self._render_size = fit_aspect_size(cw, ch)
        except tk.TclError:
            pass
        self.root.after(500, self._refresh_display_size)

    def _open_camera(self):
        cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
        if not cap.isOpened():
            cap = cv2.VideoCapture(0)
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, CAMERA_WIDTH)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, CAMERA_HEIGHT)
        cap.set(cv2.CAP_PROP_FPS, 30)
        return cap

    def _read_latest_frame(self):
        if not self.cap or not self.cap.isOpened():
            return False, None
        for _ in range(DROP_STALE_CAMERA_FRAMES):
            if not self.cap.grab():
                break
        return self.cap.retrieve()

    def start_camera(self):
        if self.video_running:
            return
        try:
            self.cap = self._open_camera()
            if not self.cap.isOpened():
                raise RuntimeError("Could not open camera")
            ret, _ = self._read_latest_frame()
            if not ret:
                raise RuntimeError("Could not read from camera")

            self.tracker = HolisticTracker(process_width=TRACKER_PROCESS_WIDTH)
            self.video_running = True
            threading.Thread(target=self.process_video, daemon=True).start()
        except Exception as exc:
            messagebox.showerror("Camera Error", str(exc))

    def toggle_translating(self):
        if not self.is_translating:
            self.is_translating = True
            self.detected_signs = []
            self.transcript = ""
            self.last_spoken = ""
            self.sign_detector.reset()
            self.sequence.clear()
            self.live_sign = ""
            self.live_confidence = 0.0
            self.translate_btn.config(text="Stop translating", bg="#9b2226")
            self._update_transcript_display("Sign now — translation updates live")
            self.label_display.config(text="—")
        else:
            self.is_translating = False
            self.translate_btn.config(text="Start translating", bg="#2d6a4f")

    def toggle_bones(self):
        self.show_bones = not self.show_bones
        self.bones_btn.config(text="Turn on bones" if not self.show_bones else "Turn off bones")

    def toggle_video_recording(self):
        if not self.is_recording_video:
            path = filedialog.asksaveasfilename(
                defaultextension=".mp4",
                filetypes=[("MP4 video", "*.mp4")],
                initialfile=f"fsl_recording_{datetime.now():%Y%m%d_%H%M%S}.mp4",
            )
            if not path:
                return
            self.record_path = path
            self.is_recording_video = True
            self.record_btn.config(text="Stop recording", bg="#9b2226")
        else:
            self.is_recording_video = False
            if self.video_writer:
                self.video_writer.release()
                self.video_writer = None
            self.record_btn.config(text="Record video", bg="#3d3d3d")
            if self.record_path:
                messagebox.showinfo("Saved", f"Video saved to:\n{self.record_path}")
                self.record_path = None

    def _classify_sequence(self, sequence):
        if self.model is None or self.scaler is None or len(sequence) < SEQUENCE_LENGTH:
            return None, 0.0
        if isinstance(sequence, deque):
            window = np.array(sequence, dtype=np.float32)
        else:
            window = np.asarray(sequence[-SEQUENCE_LENGTH:], dtype=np.float32)
        model_input = prepare_model_input(window, self.scaler)
        res = self.model(model_input, training=False).numpy()[0]
        best = int(np.argmax(res))
        return str(self.actions[best]), float(res[best])

    def _on_sign_recorded(self, sign, confidence):
        with self.state_lock:
            if not append_sign_no_spam(self.detected_signs, sign):
                return
            signs_copy = list(self.detected_signs)

        display = sign.replace("_", " ")
        interim = SemanticInterpreter._fallback(signs_copy)
        self.root.after(0, lambda: self.label_display.config(text=f"{display} ({confidence:.0%})"))
        self.root.after(0, lambda: self._update_transcript_display(interim))
        print(f"Recorded: {sign} ({confidence:.0%}) → {interim}")
        self._schedule_semantic_update()

    def _schedule_semantic_update(self):
        if self.gemini_timer:
            self.root.after_cancel(self.gemini_timer)
        self.gemini_timer = self.root.after(int(GEMINI_DEBOUNCE_SEC * 1000), self._run_semantic_update)

    def _run_semantic_update(self):
        with self.state_lock:
            signs = list(self.detected_signs)
        if not signs:
            return

        def worker():
            text = self.semantic.interpret(signs)
            self.root.after(0, lambda: self._apply_transcript(text))

        threading.Thread(target=worker, daemon=True).start()

    def _apply_transcript(self, text):
        if not text:
            return
        self.transcript = text
        self._update_transcript_display(text)
        if text != self.last_spoken and self.tts_available:
            self.last_spoken = text
            self.speak_text(text)

    def _update_transcript_display(self, text):
        self.transcript_display.config(text=text or "…")

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

            if output.keypoints is not None:
                self.sequence.append(output.keypoints)

            self._frame_counter += 1
            run_inference = (
                self._frame_counter % INFERENCE_EVERY_N_FRAMES == 0
                or len(self.sequence) == SEQUENCE_LENGTH
            )
            if run_inference:
                sign, confidence = self._classify_sequence(self.sequence)
                self.live_sign = sign or ""
                self.live_confidence = confidence
            else:
                sign, confidence = self.live_sign, self.live_confidence

            if self.is_translating and len(self.sequence) == SEQUENCE_LENGTH:
                now_ms = int(time.monotonic() * 1000)
                sign_changed = sign != self._last_live_sign
                conf_changed = abs(confidence - self._last_live_conf) >= 0.05
                label_due = (now_ms - self._last_label_update_ms) >= UI_LABEL_MIN_INTERVAL_MS

                if sign_changed or conf_changed or label_due:
                    self._last_live_sign = sign or ""
                    self._last_live_conf = confidence
                    self._last_label_update_ms = now_ms
                    live_text = (
                        f"{sign.replace('_', ' ')} ({confidence:.0%})"
                        if sign else "—"
                    )
                    self.root.after(0, lambda t=live_text: self.label_display.config(text=t))

                recorded = self.sign_detector.update(
                    sign, confidence, self.confidence_threshold
                )
                if recorded:
                    self._on_sign_recorded(recorded, confidence)

            if self.is_recording_video:
                self._write_video_frame(cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR))

            cw, ch = self._container_size
            display_rgb = letterbox_frame(rgb, cw, ch)
            with self.frame_lock:
                self.current_frame = display_rgb
                self.frame_version += 1

    def _write_video_frame(self, bgr_frame):
        h, w = bgr_frame.shape[:2]
        if self.video_writer is None:
            fourcc = cv2.VideoWriter_fourcc(*"mp4v")
            self.video_writer = cv2.VideoWriter(self.record_path, fourcc, 20.0, (w, h))
        self.video_writer.write(bgr_frame)

    def update_frame(self):
        try:
            with self.frame_lock:
                if self.current_frame is None or self.frame_version == self._last_shown_version:
                    self.root.after(DISPLAY_INTERVAL_MS, self.update_frame)
                    return
                frame = self.current_frame
                self._last_shown_version = self.frame_version

            imgtk = ImageTk.PhotoImage(Image.fromarray(frame))
            self.video_label.imgtk = imgtk
            self.video_label.configure(image=imgtk)
        except Exception as exc:
            print(f"Frame update error: {exc}")
        self.root.after(DISPLAY_INTERVAL_MS, self.update_frame)

    def _init_tts_preferences(self):
        engine = None
        try:
            engine = pyttsx3.init()
            engine.setProperty("rate", self.tts_rate)
            engine.setProperty("volume", self.tts_volume)
            voices = engine.getProperty("voices")
            if voices:
                self.tts_voice_id = voices[0].id
            return True
        except Exception as exc:
            print(f"TTS init failed: {exc}")
            return False
        finally:
            if engine:
                try:
                    engine.stop()
                except Exception:
                    pass

    def speak_text(self, text):
        if not self.tts_available or not text.strip():
            return

        def worker():
            with self.tts_lock:
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
                    engine.setProperty("rate", self.tts_rate)
                    engine.setProperty("volume", self.tts_volume)
                    if self.tts_voice_id:
                        engine.setProperty("voice", self.tts_voice_id)
                    engine.say(text.strip())
                    engine.runAndWait()
                except Exception as exc:
                    print(f"TTS error: {exc}")
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

        threading.Thread(target=worker, daemon=True).start()

    def on_closing(self):
        self.video_running = False
        if self.video_writer:
            self.video_writer.release()
        if self.cap:
            self.cap.release()
        if self.tracker:
            self.tracker.close()
        self.root.destroy()


if __name__ == "__main__":
    root = tk.Tk()
    app = FSLTranslatorApp(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)
    root.mainloop()
