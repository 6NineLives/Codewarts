/**
 * Mirrors fsl_translator_app_demo.py on the mobile client.
 * Demo sign reveals + transcript timing live here; backend provides bones + TTS + Gemini.
 */

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

/** How often we attempt a background preview snapshot (~8–10 fps). */
const BONES_TICK_MS = 120;
const BONES_FAIL_BACKOFF_MS = 400;

export type TranslateDemoState = {
  isTranslating: boolean;
  transcript: string;
  landmarks: BonesLandmarks | null;
  hasLandmarks: boolean;
  toggleTranslating: () => void;
  onCameraReady: () => void;
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

  const submitFrameForLandmarks = useCallback((base64: string) => {
    void sendBonesFrame(base64)
      .then((result) => {
        if (result.landmarks) {
          setLandmarks(result.landmarks);
          setHasLandmarks(result.hasLandmarks);
          if (__DEV__ && result.hasLandmarks) {
            console.log('[bones] landmarks updated');
          }
        } else if (__DEV__ && result.error) {
          console.warn('[bones]', result.error);
        }
      })
      .catch((error) => {
        if (__DEV__) {
          console.warn('[bones] request failed:', error);
        }
      });
  }, []);

  const tickBonesLoop = useCallback(() => {
    if (!bonesPumpActiveRef.current) return;

    if (
      !captureInFlightRef.current &&
      cameraReadyRef.current &&
      cameraRef.current?.isReady()
    ) {
      captureInFlightRef.current = true;
      void cameraRef.current.captureFrameBase64().then((base64) => {
        captureInFlightRef.current = false;
        if (!base64) {
          consecutiveCaptureFailRef.current += 1;
          return;
        }
        consecutiveCaptureFailRef.current = 0;
        submitFrameForLandmarks(base64);
      });
    }

    if (!bonesPumpActiveRef.current) return;
    const delayMs =
      consecutiveCaptureFailRef.current > 0 ? BONES_FAIL_BACKOFF_MS : BONES_TICK_MS;
    bonesPumpTimerRef.current = setTimeout(tickBonesLoop, delayMs);
  }, [cameraRef, submitFrameForLandmarks]);

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
  };
}
