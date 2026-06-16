/**
 * Mirrors fsl_translator_app_demo.py on the mobile client.
 * Demo sign reveals + transcript timing live here; backend provides bones + TTS + Gemini.
 */

import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

import type { BonesCameraRef } from '@/components/camera/bones-camera-types';
import {
  DEMO_LABEL_DELAY_MS,
  DEMO_SCENARIOS,
  DEMO_TRANSCRIPT_OVERRIDES,
  demoFallbackTranscript,
  demoSignsKey,
  getDemoScenarios,
  nextDemoScenarioIndex,
} from '@/mocks/translate-demo';
import { sendBonesFrame, translateSigns } from '@/services/translate-api';
import type { BonesLandmarks } from '@/types/bones-landmarks';
import { landmarksEqual } from '@/utils/landmarks-equal';
import { PORTRAIT_FRAME_ASPECT } from '@/utils/cover-landmarks';
import { prefetchTtsAudio, speakTts, stopTtsPlayback, warmDemoTtsCache } from '@/utils/tts-player';

/**
 * Adaptive capture pacing — high FPS when the pipeline keeps up,
 * backs off when inference is busy so the preview stays smooth.
 */
const CAPTURE_CATCHUP_MS = 45;
const CAPTURE_IDLE_MS = 68;
const CAPTURE_BUSY_MS = 95;
const BONES_FAIL_BACKOFF_MS = 320;

export type TranslateDemoState = {
  isTranslating: boolean;
  transcript: string;
  landmarks: BonesLandmarks | null;
  hasLandmarks: boolean;
  frameAspect: number;
  toggleTranslating: () => void;
  onCameraReady: () => void;
  onCameraError: () => void;
};

export function useTranslateDemo(
  cameraRef: RefObject<BonesCameraRef | null>,
  trackBones: boolean,
): TranslateDemoState {
  const [isTranslating, setIsTranslating] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [landmarks, setLandmarks] = useState<BonesLandmarks | null>(null);
  const [hasLandmarks, setHasLandmarks] = useState(false);
  const [frameAspect, setFrameAspect] = useState(PORTRAIT_FRAME_ASPECT);

  const demoIndexRef = useRef(0);
  const isTranslatingRef = useRef(false);
  const detectedSignsRef = useRef<string[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
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
  const lastSpokenRef = useRef('');
  const soundRef = useRef<Audio.Sound | null>(null);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

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

  const speakTranscript = useCallback(async (text: string) => {
    if (!text || text === lastSpokenRef.current) return;
    lastSpokenRef.current = text;
    await speakTts(text, soundRef);
  }, []);

  const scheduleTimer = useCallback((delayMs: number, fn: () => void) => {
    const id = setTimeout(fn, delayMs);
    timersRef.current.push(id);
  }, []);

  const revealSign = useCallback(
    (signs: string[], index: number) => {
      if (!isTranslatingRef.current || index >= signs.length) return;

      const sign = signs[index]!;
      detectedSignsRef.current = [...detectedSignsRef.current, sign];
      if (index + 1 < signs.length) {
        scheduleTimer(DEMO_LABEL_DELAY_MS, () => revealSign(signs, index + 1));
        return;
      }

      const signsCopy = [...detectedSignsRef.current];
      const transcriptText = demoFallbackTranscript(signsCopy);
      setTranscript(transcriptText);
      void speakTranscript(transcriptText);

      if (!DEMO_TRANSCRIPT_OVERRIDES[demoSignsKey(signsCopy)]) {
        void translateSigns(signsCopy).then((geminiText) => {
          if (geminiText && isTranslatingRef.current) {
            setTranscript(geminiText);
          }
        });
      }
    },
    [scheduleTimer, speakTranscript],
  );

  const playDemoScenario = useCallback(
    (signs: string[]) => {
      clearTimers();
      detectedSignsRef.current = [];
      setTranscript('Nakikinig…');
      lastSpokenRef.current = '';
      prefetchTtsAudio(demoFallbackTranscript(signs));
      scheduleTimer(DEMO_LABEL_DELAY_MS, () => revealSign(signs, 0));
    },
    [clearTimers, revealSign, scheduleTimer],
  );

  const startTranslating = useCallback(() => {
    const signs = [...DEMO_SCENARIOS[demoIndexRef.current]!];
    demoIndexRef.current = nextDemoScenarioIndex(demoIndexRef.current);
    isTranslatingRef.current = true;
    setIsTranslating(true);
    playDemoScenario(signs);
  }, [playDemoScenario]);

  const stopTranslating = useCallback(() => {
    clearTimers();
    isTranslatingRef.current = false;
    setIsTranslating(false);
    setTranscript('');
    lastSpokenRef.current = '';
    void stopTtsPlayback(soundRef.current);
    soundRef.current = null;
  }, [clearTimers]);

  const toggleTranslating = useCallback(() => {
    if (isTranslatingRef.current) {
      stopTranslating();
    } else {
      startTranslating();
    }
  }, [startTranslating, stopTranslating]);

  const scheduleBonesPumpRef = useRef<(delayMs?: number) => void>(() => {});

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
        setHasLandmarks((prev) =>
          prev === result.hasLandmarks ? prev : result.hasLandmarks,
        );
        if (__DEV__ && result.error) {
          console.warn('[bones]', result.error);
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
    void cameraRef.current.captureFrameBase64().then((base64) => {
      captureInFlightRef.current = false;
      if (!base64) {
        // Only backoff on real snapshot errors — not when the camera is paused between tabs.
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

  scheduleBonesPumpRef.current = (delayMs?: number) => {
    if (!bonesPumpActiveRef.current) return;
    if (bonesPumpTimerRef.current) {
      clearTimeout(bonesPumpTimerRef.current);
    }
    bonesPumpTimerRef.current = setTimeout(() => tickBonesLoop(delayMs), delayMs ?? 0);
  };

  const startBonesLoop = useCallback(() => {
    if (!trackBones || !cameraReadyRef.current) return;
    stopBonesLoop();
    bonesPumpActiveRef.current = true;
    tickBonesLoop();
  }, [stopBonesLoop, tickBonesLoop, trackBones]);

  const onCameraReady = useCallback(() => {
    cameraReadyRef.current = true;
    if (trackBones) {
      startBonesLoop();
    }
  }, [startBonesLoop, trackBones]);

  const onCameraError = useCallback(() => {
    consecutiveCaptureFailRef.current += 3;
    stopBonesLoop();
  }, [stopBonesLoop]);

  useEffect(() => {
    if (trackBones && cameraReadyRef.current) {
      startBonesLoop();
      return;
    }
    stopBonesLoop();
    if (!trackBones) {
      latestLandmarksRef.current = null;
      setLandmarks(null);
      setHasLandmarks(false);
      setFrameAspect(PORTRAIT_FRAME_ASPECT);
    }
  }, [startBonesLoop, stopBonesLoop, trackBones]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        stopBonesLoop();
      };
    }, [stopBonesLoop]),
  );

  useEffect(() => {
    warmDemoTtsCache(getDemoScenarios().map((scenario) => scenario.transcript));
    void Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

    return () => {
      stopBonesLoop();
      clearTimers();
      isTranslatingRef.current = false;
      void stopTtsPlayback(soundRef.current);
      soundRef.current = null;
    };
  }, [clearTimers, stopBonesLoop]);

  return {
    isTranslating,
    transcript,
    landmarks,
    hasLandmarks,
    frameAspect,
    toggleTranslating,
    onCameraReady,
    onCameraError,
  };
}
