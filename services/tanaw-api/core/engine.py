"""Frame processing for camera bones overlay (mirrors fsl_translator_app_demo process_video)."""

from __future__ import annotations

import base64
import sys
import threading
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[3]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fsl_landmarks import HolisticTracker  # noqa: E402

TRACKER_PROCESS_WIDTH = 320


class InferenceEngine:
    """Singleton — HolisticTracker bones overlay for the mobile camera feed."""

    _instance: InferenceEngine | None = None

    def __init__(self) -> None:
        self.tracker: HolisticTracker | None = None
        self.tracker_error: str | None = None
        self._process_lock = threading.Lock()
        self._init_tracker()

    @classmethod
    def get(cls) -> InferenceEngine:
        if cls._instance is None:
            cls._instance = InferenceEngine()
        return cls._instance

    def _init_tracker(self) -> None:
        try:
            self.tracker = HolisticTracker(process_width=TRACKER_PROCESS_WIDTH)
        except Exception as exc:
            self.tracker_error = str(exc)
            self.tracker = None

    @property
    def bones_ready(self) -> bool:
        return self.tracker is not None

    def _decode_frame(self, image_base64: str) -> np.ndarray | None:
        try:
            if "," in image_base64:
                image_base64 = image_base64.split(",", 1)[1]
            raw = base64.b64decode(image_base64)
            arr = np.frombuffer(raw, dtype=np.uint8)
            return cv2.imdecode(arr, cv2.IMREAD_COLOR)
        except Exception:
            return None

    def _serialize_landmarks(self, arr: np.ndarray | None, include_visibility: bool = False) -> list[dict] | None:
        if arr is None or arr.size == 0:
            return None
        return [
            {
                "x": float(row[0]),
                "y": float(row[1]),
                "v": float(row[3]) if include_visibility and arr.shape[1] >= 4 else 1.0,
            }
            for row in arr
        ]

    def process_frame(self, image_base64: str, draw_bones: bool = False) -> dict:
        with self._process_lock:
            return self._process_frame_unlocked(image_base64, draw_bones)

    def _process_frame_unlocked(self, image_base64: str, draw_bones: bool = False) -> dict:
        if not self.tracker:
            return {
                "overlayImageBase64": None,
                "bonesReady": False,
                "hasLandmarks": False,
                "error": self.tracker_error or "Holistic tracker not loaded",
            }

        frame = self._decode_frame(image_base64)
        if frame is None:
            return {
                "overlayImageBase64": None,
                "bonesReady": True,
                "hasLandmarks": False,
                "error": "Invalid frame data",
            }

        output = self.tracker.process(frame)
        has_landmarks = any(
            [
                output.pose_landmarks is not None,
                output.left_hand_landmarks is not None,
                output.right_hand_landmarks is not None,
            ]
        )

        landmarks = {
            "pose": self._serialize_landmarks(output.pose_landmarks, include_visibility=True),
            "leftHand": self._serialize_landmarks(output.left_hand_landmarks),
            "rightHand": self._serialize_landmarks(output.right_hand_landmarks),
        }

        overlay_b64: str | None = None
        if draw_bones:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            self.tracker.draw_landmarks(rgb, output, inplace=True)
            bgr_out = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
            ok, buf = cv2.imencode(".jpg", bgr_out, [cv2.IMWRITE_JPEG_QUALITY, 80])
            if not ok:
                return {
                    "overlayImageBase64": None,
                    "landmarks": landmarks,
                    "bonesReady": True,
                    "hasLandmarks": has_landmarks,
                    "error": "Failed to encode overlay frame",
                }
            overlay_b64 = base64.b64encode(buf).decode("ascii")

        return {
            "overlayImageBase64": overlay_b64,
            "landmarks": landmarks,
            "bonesReady": True,
            "hasLandmarks": has_landmarks,
            "error": None,
        }
