import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState, type RefObject } from 'react';
import { Alert } from 'react-native';

import type { CameraViewportRef } from '@/components/camera/camera-viewport';

type UseVideoRecorderOptions = {
  onRecordingComplete?: (uri: string) => void;
};

export function useVideoRecorder(
  cameraRef: RefObject<CameraViewportRef | null>,
  options?: UseVideoRecorderOptions,
) {
  const [isRecording, setIsRecording] = useState(false);
  const [lastRecordingUri, setLastRecordingUri] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);
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
      if (uri) {
        setLastRecordingUri(uri);
        setRecordingError(null);
        options?.onRecordingComplete?.(uri);
      } else {
        setRecordingError('Recording could not be saved. Please try again.');
        Alert.alert('Recording failed', 'Your video could not be saved. Please try again.');
      }
      return;
    }

    if (!cameraRef.current.isReady()) {
      Alert.alert('Camera not ready', 'Wait for the camera preview to load, then try again.');
      return;
    }

    setRecordingError(null);
    setIsRecording(true);
    setRecordingSeconds(0);
    timerRef.current = setInterval(() => {
      setRecordingSeconds((seconds) => seconds + 1);
    }, 1000);

    try {
      await cameraRef.current.startRecording();
    } catch (error) {
      clearTimer();
      setIsRecording(false);
      setRecordingSeconds(0);
      const message =
        error instanceof Error ? error.message : 'Could not start recording. Please try again.';
      setRecordingError(message);
      Alert.alert('Recording failed', message);
    }
  }, [cameraRef, clearTimer, isRecording, options]);

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
    recordingError,
    toggleRecording,
    setLastRecordingUri,
  };
}
