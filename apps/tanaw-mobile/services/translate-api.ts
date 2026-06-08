import { apiRequest } from '@/services/api-client';
import type { BonesLandmarks } from '@/types/bones-landmarks';

export type BonesFrameResult = {
  overlayImageBase64: string | null;
  landmarks: BonesLandmarks | null;
  bonesReady: boolean;
  hasLandmarks: boolean;
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

export async function sendBonesFrame(imageBase64: string): Promise<BonesFrameResult> {
  return apiRequest<BonesFrameResult>('/inference/frame', {
    method: 'POST',
    body: { imageBase64, drawBones: false },
    timeoutMs: 12000,
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
