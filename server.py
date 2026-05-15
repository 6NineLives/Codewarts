"""
FSL Translator — FastAPI Backend Server
Headless ML inference server extracted from the Tkinter app.
Provides WebSocket for real-time sign detection and REST endpoints for status/control.
"""

import asyncio
import base64
import json
import os
import threading
import time
from collections import deque
from contextlib import asynccontextmanager

import cv2
import numpy as np
import mediapipe as mp
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# Optional TTS
try:
    import pyttsx3
    TTS_AVAILABLE = True
except ImportError:
    TTS_AVAILABLE = False

# ==========================================
# CONFIGURATION
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIDENCE_THRESHOLD = 0.65
STABILITY_WINDOW = 15
MIN_SIGN_DURATION = 20
SEQUENCE_LENGTH = 30


# ==========================================
# SIGN STABILIZER (extracted from Tkinter app)
# ==========================================
class SignStabilizer:
    def __init__(self, window_size=STABILITY_WINDOW, min_duration=MIN_SIGN_DURATION):
        self.window_size = window_size
        self.min_duration = min_duration
        self.prediction_history = deque(maxlen=window_size)
        self.current_sign = None
        self.current_sign_count = 0

    def add_prediction(self, predicted_idx, confidence):
        self.prediction_history.append((predicted_idx, confidence))

        if len(self.prediction_history) >= self.window_size:
            predictions = [p[0] for p in self.prediction_history]
            unique, counts = np.unique(predictions, return_counts=True)
            most_common_idx = unique[np.argmax(counts)]
            most_common_count = np.max(counts)
            avg_confidence = np.mean(
                [c for p, c in self.prediction_history if p == most_common_idx]
            )

            stability_ratio = most_common_count / self.window_size

            if stability_ratio >= 0.6 and avg_confidence >= CONFIDENCE_THRESHOLD:
                if most_common_idx == self.current_sign:
                    self.current_sign_count += 1
                else:
                    self.current_sign = most_common_idx
                    self.current_sign_count = 1

                if self.current_sign_count >= self.min_duration:
                    return most_common_idx, avg_confidence, True

        return None, 0, False

    def reset(self):
        self.current_sign = None
        self.current_sign_count = 0
        self.prediction_history.clear()


# ==========================================
# SENTENCE BUILDER (extracted from Tkinter app)
# ==========================================
class SentenceBuilder:
    def __init__(self):
        self.greetings = ['HELLO', 'HI', 'GOOD_MORNING', 'GOOD_AFTERNOON', 'GOOD_EVENING']
        self.questions = ['HOW', 'WHAT', 'WHERE', 'WHEN', 'WHY', 'WHO']
        self.connectors = {
            'GOOD_MORNING': 'Good morning',
            'GOOD_AFTERNOON': 'Good afternoon',
            'GOOD_EVENING': 'Good evening',
            'NICE_TO_MEET_YOU': "Nice to meet you",
            'HOW_ARE_YOU': "How are you",
            'THANK_YOU': "Thank you",
            'YOURE_WELCOME': "You're welcome",
            'SEE_YOU_TOMORROW': "See you tomorrow",
            'IM_FINE': "I'm fine",
            'DONT_KNOW': "I don't know",
            'DONT_UNDERSTAND': "I don't understand",
        }

    def build_sentence(self, signs):
        if not signs:
            return ""

        result = []
        for sign in signs:
            if sign in self.connectors:
                result.append(self.connectors[sign])
            else:
                result.append(sign.replace('_', ' ').title())

        sentence = ' '.join(result)

        if any(q in signs for q in self.questions):
            sentence += '?'
        elif any(g in signs for g in self.greetings):
            sentence += '!'
        else:
            sentence += '.'

        if sentence:
            sentence = sentence[0].upper() + sentence[1:]

        return sentence


# ==========================================
# ML INFERENCE ENGINE
# ==========================================
class InferenceEngine:
    """Manages the TensorFlow model, MediaPipe, and camera."""

    def __init__(self):
        self.model = None
        self.actions = None
        self.stabilizer = SignStabilizer()
        self.sentence_builder = SentenceBuilder()
        self.detected_signs: list[str] = []
        self.sequence: list = []
        self.is_collecting = False
        self.is_camera_active = False
        self.current_translation = ""
        self.sensitivity = 0.85
        self.tts_enabled = True

        # MediaPipe
        self.mp_holistic = mp.solutions.holistic
        self.holistic = None

        # Camera
        self.cap = None
        self._video_thread = None
        self._current_frame_b64 = None
        self._frame_lock = threading.Lock()
        self._ws_clients: list[WebSocket] = []
        self._running = False

        # TTS
        self._tts_engine = None
        if TTS_AVAILABLE:
            try:
                self._tts_engine = pyttsx3.init()
                self._tts_engine.setProperty('rate', 180)
                self._tts_engine.setProperty('volume', 0.9)
            except Exception:
                self._tts_engine = None

    def load_model(self):
        """Load the TF model and action labels."""
        from tensorflow.keras.models import Sequential
        from tensorflow.keras.layers import LSTM, Dense, Dropout, Conv1D
        from tensorflow.keras.regularizers import l2

        labels_path = os.path.join(BASE_DIR, 'models', 'action_labels.npy')
        self.actions = np.load(labels_path, allow_pickle=True)

        self.model = Sequential()
        self.model.add(Conv1D(64, kernel_size=3, activation='relu', input_shape=(30, 258)))
        self.model.add(Dropout(0.3))
        self.model.add(LSTM(64, return_sequences=True, kernel_regularizer=l2(0.001)))
        self.model.add(Dropout(0.5))
        self.model.add(LSTM(128, return_sequences=False, kernel_regularizer=l2(0.001)))
        self.model.add(Dropout(0.5))
        self.model.add(Dense(64, activation='relu', kernel_regularizer=l2(0.001)))
        self.model.add(Dropout(0.3))
        self.model.add(Dense(self.actions.shape[0], activation='softmax'))
        self.model.compile(
            optimizer='Adam', loss='categorical_crossentropy',
            metrics=['categorical_accuracy'],
        )

        model_path = os.path.join(BASE_DIR, 'models', 'fsl_105_model.h5')
        self.model.load_weights(model_path)
        print(f"[server] Model loaded — {len(self.actions)} signs")

    def start_camera(self):
        if self._running:
            return
        self.cap = cv2.VideoCapture(0)
        if not self.cap.isOpened():
            raise RuntimeError("Could not open camera")
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

        self.holistic = self.mp_holistic.Holistic(
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )

        self._running = True
        self.is_camera_active = True
        self._video_thread = threading.Thread(target=self._process_video_loop, daemon=True)
        self._video_thread.start()
        print("[server] Camera started")

    def stop_camera(self):
        self._running = False
        self.is_camera_active = False
        if self.cap:
            self.cap.release()
            self.cap = None
        if self.holistic:
            self.holistic.close()
            self.holistic = None
        print("[server] Camera stopped")

    def _extract_keypoints(self, results):
        pose = (
            np.array([[r.x, r.y, r.z, r.visibility] for r in results.pose_landmarks.landmark]).flatten()
            if results.pose_landmarks else np.zeros(33 * 4)
        )
        lh = (
            np.array([[r.x, r.y, r.z] for r in results.left_hand_landmarks.landmark]).flatten()
            if results.left_hand_landmarks else np.zeros(21 * 3)
        )
        rh = (
            np.array([[r.x, r.y, r.z] for r in results.right_hand_landmarks.landmark]).flatten()
            if results.right_hand_landmarks else np.zeros(21 * 3)
        )
        return np.concatenate([pose, lh, rh])

    def _process_video_loop(self):
        """Background thread: read camera, run inference, broadcast frames."""
        mp_drawing = mp.solutions.drawing_utils
        frame_count = 0
        fps_start = time.time()
        current_fps = 0

        while self._running and self.cap and self.cap.isOpened():
            ret, frame = self.cap.read()
            if not ret:
                break

            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            results = self.holistic.process(image)
            image.flags.writeable = True

            # Draw landmarks on the frame
            if results.pose_landmarks:
                mp_drawing.draw_landmarks(
                    image, results.pose_landmarks, self.mp_holistic.POSE_CONNECTIONS,
                    mp_drawing.DrawingSpec(color=(255, 107, 53), thickness=2, circle_radius=4),
                    mp_drawing.DrawingSpec(color=(255, 107, 53), thickness=2, circle_radius=2),
                )
            if results.left_hand_landmarks:
                mp_drawing.draw_landmarks(
                    image, results.left_hand_landmarks, self.mp_holistic.HAND_CONNECTIONS,
                    mp_drawing.DrawingSpec(color=(255, 107, 53), thickness=2, circle_radius=4),
                    mp_drawing.DrawingSpec(color=(255, 181, 157), thickness=2, circle_radius=2),
                )
            if results.right_hand_landmarks:
                mp_drawing.draw_landmarks(
                    image, results.right_hand_landmarks, self.mp_holistic.HAND_CONNECTIONS,
                    mp_drawing.DrawingSpec(color=(255, 107, 53), thickness=2, circle_radius=4),
                    mp_drawing.DrawingSpec(color=(255, 181, 157), thickness=2, circle_radius=2),
                )

            # ML inference
            keypoints = self._extract_keypoints(results)
            self.sequence.append(keypoints)
            self.sequence = self.sequence[-SEQUENCE_LENGTH:]

            detected_sign = None
            confidence = 0.0

            if len(self.sequence) == SEQUENCE_LENGTH:
                res = self.model.predict(np.expand_dims(self.sequence, axis=0), verbose=0)[0]
                predicted_idx = np.argmax(res)
                conf = float(res[predicted_idx])

                stable_idx, stable_conf, is_stable = self.stabilizer.add_prediction(predicted_idx, conf)

                if is_stable and self.is_collecting:
                    sign = str(self.actions[stable_idx])
                    if len(self.detected_signs) == 0 or self.detected_signs[-1] != sign:
                        self.detected_signs.append(sign)
                        detected_sign = sign
                        confidence = float(stable_conf)
                        self.stabilizer.reset()
                elif is_stable:
                    self.stabilizer.reset()

            # FPS calculation
            frame_count += 1
            elapsed = time.time() - fps_start
            if elapsed >= 1.0:
                current_fps = frame_count / elapsed
                frame_count = 0
                fps_start = time.time()

            # Encode frame as JPEG base64 for WebSocket streaming
            jpeg_frame = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
            _, buffer = cv2.imencode('.jpg', jpeg_frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
            frame_b64 = base64.b64encode(buffer).decode('utf-8')

            with self._frame_lock:
                self._current_frame_b64 = frame_b64

            # Broadcast to all WebSocket clients
            message = {
                "type": "frame",
                "frame": frame_b64,
                "fps": round(current_fps, 1),
                "is_collecting": self.is_collecting,
                "detected_signs": self.detected_signs.copy(),
                "new_sign": detected_sign,
                "confidence": round(confidence, 3),
                "translation": self.current_translation,
            }

            # Queue broadcast (non-blocking)
            asyncio.run_coroutine_threadsafe(
                self._broadcast(json.dumps(message)),
                self._loop,
            )

        print("[server] Video processing loop ended")

    async def _broadcast(self, message: str):
        """Send message to all connected WebSocket clients."""
        disconnected = []
        for ws in self._ws_clients:
            try:
                await ws.send_text(message)
            except Exception:
                disconnected.append(ws)
        for ws in disconnected:
            if ws in self._ws_clients:
                self._ws_clients.remove(ws)

    def start_collecting(self):
        self.is_collecting = True
        self.detected_signs = []
        self.current_translation = ""
        self.stabilizer.reset()

    def stop_collecting(self):
        self.is_collecting = False
        if self.detected_signs:
            self.current_translation = self.sentence_builder.build_sentence(self.detected_signs)
            # TTS
            if self.tts_enabled and self._tts_engine:
                self._speak(self.current_translation)
        return self.current_translation

    def clear_all(self):
        self.detected_signs = []
        self.current_translation = ""
        self.sequence = []
        self.stabilizer.reset()

    def _speak(self, text):
        def _do():
            try:
                self._tts_engine.stop()
                self._tts_engine.say(text)
                self._tts_engine.runAndWait()
            except Exception as e:
                print(f"[server] TTS error: {e}")
        threading.Thread(target=_do, daemon=True).start()

    def get_status(self):
        return {
            "model_loaded": self.model is not None,
            "camera_active": self.is_camera_active,
            "is_collecting": self.is_collecting,
            "num_signs": len(self.actions) if self.actions is not None else 0,
            "detected_signs": self.detected_signs.copy(),
            "translation": self.current_translation,
            "tts_available": self._tts_engine is not None,
            "tts_enabled": self.tts_enabled,
            "sensitivity": self.sensitivity,
        }


# ==========================================
# APP LIFECYCLE
# ==========================================
engine = InferenceEngine()


@asynccontextmanager
async def lifespan(app: FastAPI):
    engine._loop = asyncio.get_event_loop()
    engine.load_model()
    engine.start_camera()
    yield
    engine.stop_camera()


# ==========================================
# FASTAPI APP
# ==========================================
app = FastAPI(title="FSL Translator API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- REST Endpoints ---

@app.get("/api/status")
async def get_status():
    return engine.get_status()


@app.post("/api/collect/start")
async def start_collecting():
    engine.start_collecting()
    return {"status": "collecting"}


@app.post("/api/collect/stop")
async def stop_collecting():
    translation = engine.stop_collecting()
    return {"status": "stopped", "translation": translation, "signs": engine.detected_signs}


@app.post("/api/clear")
async def clear_all():
    engine.clear_all()
    return {"status": "cleared"}


@app.post("/api/tts/toggle")
async def toggle_tts():
    engine.tts_enabled = not engine.tts_enabled
    return {"tts_enabled": engine.tts_enabled}


@app.post("/api/sensitivity")
async def set_sensitivity(value: float = 0.85):
    engine.sensitivity = max(0.0, min(1.0, value))
    return {"sensitivity": engine.sensitivity}


# --- WebSocket ---

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    engine._ws_clients.append(ws)
    print(f"[server] WebSocket client connected ({len(engine._ws_clients)} total)")
    try:
        while True:
            data = await ws.receive_text()
            msg = json.loads(data)

            if msg.get("action") == "start":
                engine.start_collecting()
            elif msg.get("action") == "stop":
                engine.stop_collecting()
            elif msg.get("action") == "clear":
                engine.clear_all()
            elif msg.get("action") == "tts_toggle":
                engine.tts_enabled = not engine.tts_enabled
            elif msg.get("action") == "set_sensitivity":
                engine.sensitivity = max(0.0, min(1.0, msg.get("value", 0.85)))

    except WebSocketDisconnect:
        pass
    finally:
        if ws in engine._ws_clients:
            engine._ws_clients.remove(ws)
        print(f"[server] WebSocket client disconnected ({len(engine._ws_clients)} total)")


# ==========================================
# MAIN
# ==========================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
