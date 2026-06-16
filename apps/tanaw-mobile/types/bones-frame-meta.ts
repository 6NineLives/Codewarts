export type CameraFacing = 'front' | 'back';

export type BonesCaptureKind = 'preview-snapshot' | 'still-photo';

/** Metadata so the API can align inference with what the user sees on screen. */
export type BonesFrameMeta = {
  cameraFacing: CameraFacing;
  captureKind: BonesCaptureKind;
  /**
   * True when the JPEG already includes front-camera mirroring
   * (e.g. Vision Camera `takeSnapshot` of the preview).
   */
  frameMirrored: boolean;
};