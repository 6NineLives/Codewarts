from __future__ import annotations

from pydantic import BaseModel, Field


class SessionCreateResponse(BaseModel):
    sessionId: str


class FrameRequest(BaseModel):
    imageBase64: str = Field(..., description="JPEG frame from live video feed")
    drawBones: bool = False
    cameraFacing: str | None = Field(None, description="'front' or 'back'")
    captureKind: str | None = Field(
        None,
        description="'preview-snapshot' (Vision Camera) or 'still-photo' (Expo takePicture)",
    )
    frameMirrored: bool = Field(
        False,
        description="True when the JPEG already matches the mirrored selfie preview",
    )


class LandmarkPoint(BaseModel):
    x: float
    y: float
    v: float = 1.0


class BonesLandmarksPayload(BaseModel):
    pose: list[LandmarkPoint] | None = None
    leftHand: list[LandmarkPoint] | None = None
    rightHand: list[LandmarkPoint] | None = None


class FrameResponse(BaseModel):
    overlayImageBase64: str | None = None
    landmarks: BonesLandmarksPayload | None = None
    bonesReady: bool = False
    hasLandmarks: bool = False
    frameAspect: float = 9 / 16
    error: str | None = None


class TtsRequest(BaseModel):
    text: str


class TtsResponse(BaseModel):
    audioBase64: str
    mimeType: str = "audio/mpeg"


class TranslateRequest(BaseModel):
    signs: list[str]


class TranslateResponse(BaseModel):
    transcript: str


class HealthResponse(BaseModel):
    status: str
    bonesReady: bool
    bonesError: str | None = None
    semanticReady: bool
    ttsReady: bool = True


class LabelsResponse(BaseModel):
    keys: list[str]
    tagalogByKey: dict[str, str]
