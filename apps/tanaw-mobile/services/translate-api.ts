import { apiRequest } from '@/services/api-client';
import type { BonesLandmarks } from '@/types/bones-landmarks';

export type BonesFrameResult = {
  overlayImageBase64: string | null;
  landmarks: BonesLandmarks | null;
  bonesReady: boolean;
  hasLandmarks: boolean;
  frameAspect: number;
  error: string | null;
};

export type HealthStatus = {
  status: string;
  bonesReady: boolean;
  bonesError: string | null;
  semanticReady: boolean;
  ttsReady: boolean;
};

export type TtsResult = {
  audioBase64: string;
  mimeType: string;
};

export async function checkHealth(): Promise<HealthStatus> {
  return apiRequest<HealthStatus>('/health');
}

export type BonesFrameOptions = {
  cameraFacing?: 'front' | 'back';
  captureKind?: 'preview-snapshot' | 'still-photo';
  frameMirrored?: boolean;
};

export async function sendBonesFrame(
  imageBase64: string,
  signal?: AbortSignal,
  options?: BonesFrameOptions,
): Promise<BonesFrameResult> {
  return apiRequest<BonesFrameResult>('/inference/frame', {
    method: 'POST',
    body: {
      imageBase64,
      drawBones: false,
      cameraFacing: options?.cameraFacing,
      captureKind: options?.captureKind,
      frameMirrored: options?.frameMirrored ?? false,
    },
    timeoutMs: 8000,
    signal,
  });
}

export async function translateSigns(signs: string[]): Promise<string> {
  const result = await apiRequest<{ transcript: string }>('/inference/translate', {
    method: 'POST',
    body: { signs },
  });
  return result.transcript;
}

export async function fetchTtsAudio(text: string): Promise<TtsResult> {
  return apiRequest<TtsResult>('/tts', {
    method: 'POST',
    body: { text },
    timeoutMs: 30000,
  });
}
