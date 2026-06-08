/**
 * Mirrors fsl_translator_app_demo.py on the mobile client.
 * Demo sign reveals + transcript timing live here; backend provides bones + TTS + Gemini.
 */

import { useFocusEffect } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

import type { BonesCameraRef } from '@/components/camera/bones-camera-types';
import {
  DEMO_LABEL_DELAY_MS,
  DEMO_SCENARIOS,
  demoFallbackTranscript,
  nextDemoScenarioIndex,
} from '@/mocks/translate-demo';
import { fetchTtsAudio, sendBonesFrame, translateSigns } from '@/services/translate-api';
import type { BonesLandmarks } from '@/types/bones-landmarks';
import { landmarksEqual } from '@/utils/landmarks-equal';

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
  toggleTranslating: () => void;
  onCameraReady: () => void;
  onCameraError: () => void;
};

export function useTranslateDemo(
  cameraRef: RefObject<BonesCameraRef | null>,
): TranslateDemoState {
  const [isTranslating, setIsTranslating] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [landmarks, setLandmarks] = useState<BonesLandmarks | null>(null);
  const [hasLandmarks, setHasLandmarks] = useState(false);

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

    try {
      const audio = await fetchTtsAudio(text);
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mpeg;base64,${audio.audioBase64}` },
        { shouldPlay: true },
      );
      soundRef.current = sound;
    } catch {
      Speech.speak(text, { language: 'fil-PH' });
    }
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
      const interim = demoFallbackTranscript(signsCopy);
      setTranscript(interim);
      void speakTranscript(interim);

      void translateSigns(signsCopy).then((geminiText) => {
        if (geminiText && isTranslatingRef.current) {
          setTranscript(geminiText);
        }
      });
    },
    [scheduleTimer, speakTranscript],
  );

  const playDemoScenario = useCallback(
    (signs: string[]) => {
      clearTimers();
      detectedSignsRef.current = [];
      setTranscript('Nakikinig…');
      lastSpokenRef.current = '';
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
    void soundRef.current?.stopAsync();
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

    inferenceAbortRef.current?.abort();
    const controller = new AbortController();
    inferenceAbortRef.current = controller;
    inferenceInFlightRef.current = true;

    void sendBonesFrame(base64, controller.signal)
      .then((result) => {
        if (generation !== inferenceGenerationRef.current) return;
        if (result.landmarks) {
          if (!landmarksEqual(latestLandmarksRef.current, result.landmarks)) {
            latestLandmarksRef.current = result.landmarks;
            setLandmarks(result.landmarks);
          }
          setHasLandmarks((prev) =>
            prev === result.hasLandmarks ? prev : result.hasLandmarks,
          );
        } else if (__DEV__ && result.error) {
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
    if (!cameraReadyRef.current) return;
    stopBonesLoop();
    bonesPumpActiveRef.current = true;
    tickBonesLoop();
  }, [stopBonesLoop, tickBonesLoop]);

  const onCameraReady = useCallback(() => {
    cameraReadyRef.current = true;
    startBonesLoop();
  }, [startBonesLoop]);

  const onCameraError = useCallback(() => {
    consecutiveCaptureFailRef.current += 3;
    stopBonesLoop();
  }, [stopBonesLoop]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        stopBonesLoop();
      };
    }, [stopBonesLoop]),
  );

  useEffect(() => {
    void Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

    return () => {
      stopBonesLoop();
      clearTimers();
      isTranslatingRef.current = false;
      void soundRef.current?.unloadAsync();
    };
  }, [clearTimers, stopBonesLoop]);

  return {
    isTranslating,
    transcript,
    landmarks,
    hasLandmarks,
    toggleTranslating,
    onCameraReady,
    onCameraError,
  };
}
