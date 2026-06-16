import type { BonesFrameMeta } from '@/types/bones-frame-meta';

export type BonesCameraRef = {
  /** Sample current video frame as base64 JPEG for backend bones overlay. */
  captureFrameBase64: () => Promise<string | null>;
  /** How the captured frame relates to the on-screen preview. */
  getBonesFrameMeta: () => BonesFrameMeta;
  isReady: () => boolean;
  toggleFacing: () => void;
};

import type { BonesLandmarks } from '@/types/bones-landmarks';

export type BonesCameraProps = {
  landmarks?: BonesLandmarks | null;
  frameAspect?: number;
  /** Release the native camera session when false (tab blur / errors). */
  isActive?: boolean;
  onCameraReady?: () => void;
  onCameraError?: (message: string) => void;
};
