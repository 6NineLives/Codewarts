"""
MediaPipe Holistic landmark extraction and skeleton drawing (Tasks API only).

Drawing uses OpenCV with MediaPipe connection topology — no mp.solutions.
"""

from __future__ import annotations

import urllib.request
from dataclasses import dataclass
from pathlib import Path

import cv2
import numpy as np

KEYPOINT_DIM = 258
POSE_DIM = 33 * 4
LH_DIM = 21 * 3
RH_DIM = 21 * 3

HOLISTIC_MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/"
    "holistic_landmarker/holistic_landmarker/float16/latest/holistic_landmarker.task"
)
DEFAULT_MODEL_PATH = Path(__file__).resolve().parent / "models" / "holistic_landmarker.task"

# MediaPipe pose / hand topology (same as legacy Holistic drawing)
POSE_CONNECTIONS = (
    (0, 1), (1, 2), (2, 3), (3, 7), (0, 4), (4, 5), (5, 6), (6, 8),
    (9, 10), (11, 12), (11, 13), (13, 15), (15, 17), (15, 19), (15, 21),
    (17, 19), (12, 14), (14, 16), (16, 18), (16, 20), (16, 22), (18, 20),
    (11, 23), (12, 24), (23, 24), (23, 25), (24, 26), (25, 27), (26, 28),
    (27, 29), (28, 30), (29, 31), (30, 32), (27, 31), (28, 32),
)
HAND_CONNECTIONS = (
    (0, 1), (1, 2), (2, 3), (3, 4),
    (0, 5), (5, 6), (6, 7), (7, 8),
    (5, 9), (9, 10), (10, 11), (11, 12),
    (9, 13), (13, 14), (14, 15), (15, 16),
    (13, 17), (0, 17), (17, 18), (18, 19), (19, 20),
)

# RGB skeleton colors (green)
POSE_JOINT_COLOR = (80, 255, 100)
POSE_LINE_COLOR = (0, 200, 60)
LEFT_HAND_JOINT_COLOR = (80, 255, 100)
LEFT_HAND_LINE_COLOR = (0, 200, 60)
RIGHT_HAND_JOINT_COLOR = (80, 255, 100)
RIGHT_HAND_LINE_COLOR = (0, 200, 60)


@dataclass
class HolisticOutput:
    pose_landmarks: np.ndarray | None
    left_hand_landmarks: np.ndarray | None
    right_hand_landmarks: np.ndarray | None
    keypoints: np.ndarray | None = None


def _landmarks_to_array(landmarks, include_visibility=False) -> np.ndarray | None:
    if not landmarks:
        return None
    dims = 4 if include_visibility else 3
    arr = np.empty((len(landmarks), dims), dtype=np.float32)
    for i, lm in enumerate(landmarks):
        arr[i, 0] = lm.x
        arr[i, 1] = lm.y
        arr[i, 2] = lm.z
        if include_visibility:
            arr[i, 3] = getattr(lm, "visibility", 0.0)
    return arr


def _landmark_list_to_arrays(landmarks, include_visibility=False):
    return _landmarks_to_array(landmarks, include_visibility)


def extract_keypoints_from_arrays(
    pose: np.ndarray | None,
    left_hand: np.ndarray | None,
    right_hand: np.ndarray | None,
) -> np.ndarray:
    """258-dim vector: pose (132) + left hand (63) + right hand (63)."""
    pose_out = np.zeros(POSE_DIM, dtype=np.float32)
    if pose is not None:
        flat = pose.reshape(-1)
        if flat.size >= POSE_DIM:
            pose_out[:] = flat[:POSE_DIM]
        elif flat.size >= 99:
            pose_out[: flat.size] = flat
            pose_out[flat.size : flat.size + flat.size // 3] = 1.0

    lh = np.zeros(LH_DIM, dtype=np.float32)
    if left_hand is not None:
        flat = left_hand.reshape(-1)
        lh[: min(flat.size, LH_DIM)] = flat[:LH_DIM]

    rh = np.zeros(RH_DIM, dtype=np.float32)
    if right_hand is not None:
        flat = right_hand.reshape(-1)
        rh[: min(flat.size, RH_DIM)] = flat[:RH_DIM]

    return np.concatenate((pose_out, lh, rh))


def extract_keypoints_from_output(output: HolisticOutput) -> np.ndarray:
    return extract_keypoints_from_arrays(
        output.pose_landmarks,
        output.left_hand_landmarks,
        output.right_hand_landmarks,
    )


def _download_holistic_model(dest: Path) -> Path:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if not dest.exists():
        print(f"Downloading holistic landmarker model to {dest}...")
        urllib.request.urlretrieve(HOLISTIC_MODEL_URL, dest)
    return dest


def _draw_landmark_set(
    image: np.ndarray,
    landmarks: np.ndarray | None,
    connections,
    joint_color,
    line_color,
    line_thickness: int = 2,
    joint_radius: int = 4,
):
    if landmarks is None or landmarks.size == 0:
        return
    h, w = image.shape[:2]
    xs = np.clip(landmarks[:, 0], 0.0, 1.0) * w
    ys = np.clip(landmarks[:, 1], 0.0, 1.0) * h
    points = np.stack((xs, ys), axis=1).astype(np.int32)
    for i, j in connections:
        if i < len(points) and j < len(points):
            cv2.line(
                image,
                tuple(points[i]),
                tuple(points[j]),
                line_color,
                line_thickness,
                cv2.LINE_8,
            )
    for x, y in points:
        cv2.circle(image, (int(x), int(y)), joint_radius, joint_color, -1, cv2.LINE_8)


class HolisticTracker:
    """Holistic landmark tracking via MediaPipe Tasks API."""

    def __init__(self, model_path: Path | None = None, process_width: int = 640):
        import mediapipe as mp
        from mediapipe.tasks.python.core import base_options as base_options_module
        from mediapipe.tasks.python.vision import (
            HolisticLandmarker,
            HolisticLandmarkerOptions,
            RunningMode,
        )

        self._mp = mp
        self._frame_ms = 0
        self._process_width = process_width
        self._rgb_buffer: np.ndarray | None = None
        resolved = _download_holistic_model(model_path or DEFAULT_MODEL_PATH)
        options = HolisticLandmarkerOptions(
            base_options=base_options_module.BaseOptions(model_asset_path=str(resolved)),
            running_mode=RunningMode.VIDEO,
            min_pose_detection_confidence=0.5,
            min_pose_landmarks_confidence=0.5,
            min_hand_landmarks_confidence=0.5,
        )
        self._landmarker = HolisticLandmarker.create_from_options(options)

    def _prepare_rgb(self, bgr_image: np.ndarray) -> np.ndarray:
        h, w = bgr_image.shape[:2]
        if self._process_width and w > self._process_width:
            scale = self._process_width / w
            new_w = self._process_width
            new_h = max(1, int(h * scale))
            bgr_image = cv2.resize(bgr_image, (new_w, new_h), interpolation=cv2.INTER_AREA)

        if (
            self._rgb_buffer is None
            or self._rgb_buffer.shape[:2] != bgr_image.shape[:2]
        ):
            self._rgb_buffer = np.empty_like(bgr_image)
        cv2.cvtColor(bgr_image, cv2.COLOR_BGR2RGB, dst=self._rgb_buffer)
        return self._rgb_buffer

    def process(self, bgr_image: np.ndarray) -> HolisticOutput:
        rgb = self._prepare_rgb(bgr_image)
        mp_image = self._mp.Image(image_format=self._mp.ImageFormat.SRGB, data=rgb)
        self._frame_ms += 33
        result = self._landmarker.detect_for_video(mp_image, self._frame_ms)

        pose = _landmarks_to_array(result.pose_landmarks, True)
        left_hand = _landmarks_to_array(result.left_hand_landmarks)
        right_hand = _landmarks_to_array(result.right_hand_landmarks)
        keypoints = extract_keypoints_from_arrays(pose, left_hand, right_hand)

        return HolisticOutput(
            pose_landmarks=pose,
            left_hand_landmarks=left_hand,
            right_hand_landmarks=right_hand,
            keypoints=keypoints,
        )

    def draw_landmarks(self, rgb_image: np.ndarray, output: HolisticOutput, inplace: bool = True) -> np.ndarray:
        """Draw pose + hand bones (original app colors, OpenCV)."""
        if not any([output.pose_landmarks is not None, output.left_hand_landmarks is not None, output.right_hand_landmarks is not None]):
            return rgb_image

        annotated = rgb_image if inplace else rgb_image.copy()
        _draw_landmark_set(
            annotated, output.pose_landmarks, POSE_CONNECTIONS,
            POSE_JOINT_COLOR, POSE_LINE_COLOR,
        )
        _draw_landmark_set(
            annotated, output.left_hand_landmarks, HAND_CONNECTIONS,
            LEFT_HAND_JOINT_COLOR, LEFT_HAND_LINE_COLOR,
        )
        _draw_landmark_set(
            annotated, output.right_hand_landmarks, HAND_CONNECTIONS,
            RIGHT_HAND_JOINT_COLOR, RIGHT_HAND_LINE_COLOR,
        )
        return annotated

    def close(self):
        if self._landmarker is not None:
            self._landmarker.close()
