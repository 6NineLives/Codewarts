import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

import type { CameraViewportRef } from '@/components/camera/camera-viewport';
import { sendBonesFrame } from '@/services/translate-api';
import type { BonesLandmarks } from '@/types/bones-landmarks';
import { landmarksEqual } from '@/utils/landmarks-equal';
import { PORTRAIT_FRAME_ASPECT } from '@/utils/cover-landmarks';

const CAPTURE_CATCHUP_MS = 45;
const CAPTURE_IDLE_MS = 68;
const CAPTURE_BUSY_MS = 95;
const BONES_FAIL_BACKOFF_MS = 320;

export function useBonesOverlay(
  cameraRef: RefObject<CameraViewportRef | null>,
  enabled: boolean,
) {
  const [landmarks, setLandmarks] = useState<BonesLandmarks | null>(null);
  const [frameAspect, setFrameAspect] = useState(PORTRAIT_FRAME_ASPECT);

  const bonesPumpActiveRef = useRef(false);
  const bonesPumpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captureInFlightRef = useRef(false);
  const inferenceInFlightRef = useRef(false);
  const pendingFrameRef = useRef<string | null>(null);
  const inferenceGenerationRef = useRef(0);
  const inferenceAbortRef = useRef<AbortController | null>(null);
  const latestLandmarksRef = useRef<BonesLandmarks | null>(null);
  const cameraReadyRef = useRef(false);
  const consecutiveCaptureFailRef = useRef(0);

  const stopBonesLoop = useCallback(() => {
    bonesPumpActiveRef.current = false;
    captureInFlightRef.current = false;
    pendingFrameRef.current = null;
    inferenceAbortRef.current?.abort();
    inferenceAbortRef.current = null;
    inferenceInFlightRef.current = false;
    if (bonesPumpTimerRef.current) {
      clearTimeout(bonesPumpTimerRef.current);
      bonesPumpTimerRef.current = null;
    }
  }, []);

  const clearLandmarks = useCallback(() => {
    latestLandmarksRef.current = null;
    setLandmarks(null);
    setFrameAspect(PORTRAIT_FRAME_ASPECT);
  }, []);

  const getAdaptiveCaptureDelay = useCallback(() => {
    if (consecutiveCaptureFailRef.current > 0) return BONES_FAIL_BACKOFF_MS;
    if (inferenceInFlightRef.current) return CAPTURE_BUSY_MS;
    if (!pendingFrameRef.current) return CAPTURE_CATCHUP_MS;
    return CAPTURE_IDLE_MS;
  }, []);

  const drainInferenceQueue = useCallback(() => {
    if (inferenceInFlightRef.current || !pendingFrameRef.current) return;

    const base64 = pendingFrameRef.current;
    pendingFrameRef.current = null;
    const generation = ++inferenceGenerationRef.current;
    const frameMeta = cameraRef.current?.getBonesFrameMeta();

    inferenceAbortRef.current?.abort();
    const controller = new AbortController();
    inferenceAbortRef.current = controller;
    inferenceInFlightRef.current = true;

    void sendBonesFrame(base64, controller.signal, frameMeta)
      .then((result) => {
        if (generation !== inferenceGenerationRef.current) return;
        if (result.frameAspect > 0) {
          setFrameAspect((prev) =>
            prev === result.frameAspect ? prev : result.frameAspect,
          );
        }
        if (result.hasLandmarks && result.landmarks) {
          if (!landmarksEqual(latestLandmarksRef.current, result.landmarks)) {
            latestLandmarksRef.current = result.landmarks;
            setLandmarks(result.landmarks);
          }
        } else {
          latestLandmarksRef.current = null;
          setLandmarks(null);
        }
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        if (__DEV__) {
          console.warn('[bones] request failed:', error);
        }
      })
      .finally(() => {
        if (generation === inferenceGenerationRef.current) {
          inferenceInFlightRef.current = false;
        }
        drainInferenceQueue();
        if (bonesPumpActiveRef.current) {
          scheduleBonesPumpRef.current(CAPTURE_CATCHUP_MS);
        }
      });
  }, []);

  const enqueueFrameForLandmarks = useCallback(
    (base64: string) => {
      pendingFrameRef.current = base64;
      drainInferenceQueue();
    },
    [drainInferenceQueue],
  );

  const attemptCapture = useCallback(() => {
    if (
      captureInFlightRef.current ||
      !bonesPumpActiveRef.current ||
      !cameraReadyRef.current ||
      !cameraRef.current?.isReady()
    ) {
      return;
    }

    captureInFlightRef.current = true;
    void cameraRef.current.captureVideoFrameBase64().then((base64) => {
      captureInFlightRef.current = false;
      if (!base64) {
        if (cameraRef.current?.isReady()) {
          consecutiveCaptureFailRef.current += 1;
        }
        return;
      }
      consecutiveCaptureFailRef.current = 0;
      enqueueFrameForLandmarks(base64);
    });
  }, [cameraRef, enqueueFrameForLandmarks]);

  const tickBonesLoop = useCallback(
    (overrideDelayMs?: number) => {
      if (!bonesPumpActiveRef.current) return;
      attemptCapture();
      const delayMs = overrideDelayMs ?? getAdaptiveCaptureDelay();
      bonesPumpTimerRef.current = setTimeout(() => tickBonesLoop(), delayMs);
    },
    [attemptCapture, getAdaptiveCaptureDelay],
  );

  const scheduleBonesPumpRef = useRef<(delayMs?: number) => void>(() => {});

  scheduleBonesPumpRef.current = (delayMs?: number) => {
    if (!bonesPumpActiveRef.current) return;
    if (bonesPumpTimerRef.current) {
      clearTimeout(bonesPumpTimerRef.current);
    }
    bonesPumpTimerRef.current = setTimeout(() => tickBonesLoop(delayMs), delayMs ?? 0);
  };

  const startBonesLoop = useCallback(() => {
    if (!cameraReadyRef.current || !enabled) return;
    stopBonesLoop();
    bonesPumpActiveRef.current = true;
    tickBonesLoop();
  }, [enabled, stopBonesLoop, tickBonesLoop]);

  useEffect(() => {
    if (enabled && cameraReadyRef.current) {
      startBonesLoop();
      return;
    }
    stopBonesLoop();
    if (!enabled) {
      clearLandmarks();
    }
  }, [clearLandmarks, enabled, startBonesLoop, stopBonesLoop]);

  useFocusEffect(
    useCallback(() => {
      cameraReadyRef.current = cameraRef.current?.isReady() ?? false;
      if (enabled && cameraReadyRef.current) {
        startBonesLoop();
      }
      return () => {
        stopBonesLoop();
      };
    }, [cameraRef, enabled, startBonesLoop, stopBonesLoop]),
  );

  const onCameraReady = useCallback(() => {
    cameraReadyRef.current = true;
    if (enabled) {
      startBonesLoop();
    }
  }, [enabled, startBonesLoop]);

  return { landmarks, frameAspect, onCameraReady };
}
