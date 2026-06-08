import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState, type RefObject } from 'react';

import type { CameraViewportRef } from '@/components/camera/camera-viewport';

export function useVideoRecorder(cameraRef: RefObject<CameraViewportRef | null>) {
  const [isRecording, setIsRecording] = useState(false);
  const [lastRecordingUri, setLastRecordingUri] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRecordingRef = useRef(false);
  isRecordingRef.current = isRecording;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const toggleRecording = useCallback(async () => {
    if (!cameraRef.current) return;

    if (isRecording) {
      clearTimer();
      setRecordingSeconds(0);
      setIsRecording(false);
      const uri = await cameraRef.current.stopRecording();
      if (uri) setLastRecordingUri(uri);
      return;
    }

    setIsRecording(true);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((seconds) => seconds + 1);
    }, 1000);

    try {
      await cameraRef.current.startRecording();
    } catch {
      clearTimer();
      setIsRecording(false);
      setRecordingSeconds(0);
    }
  }, [cameraRef, clearTimer, isRecording]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (!isRecordingRef.current) return;
        clearTimer();
        setRecordingSeconds(0);
        setIsRecording(false);
        void cameraRef.current?.stopRecording();
      };
    }, [cameraRef, clearTimer]),
  );

  return {
    isRecording,
    lastRecordingUri,
    recordingSeconds,
    toggleRecording,
    setLastRecordingUri,
  };
}
