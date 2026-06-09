import { useRef } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CameraPlaceholder } from '@/components/camera/camera-placeholder';
import { CameraViewport, type CameraViewportRef } from '@/components/camera/camera-viewport';
import { CameraFlipButton } from '@/components/create/camera-flip-button';
import { ChallengeCard } from '@/components/create/challenge-card';
import { RecordShutter } from '@/components/create/record-shutter';
import { TanawAppBar } from '@/components/shell/tanaw-app-bar';
import { useDeferredCameraMount } from '@/hooks/use-deferred-camera-mount';
import { useFloatingControlsBottom } from '@/hooks/use-floating-controls-bottom';
import { useScreenFocus } from '@/hooks/use-screen-focus';
import { useVideoRecorder } from '@/hooks/use-video-recorder';
import { CREATE_DEMO_CHALLENGE } from '@/mocks/create-challenge';
/** Space below the cream header before the challenge card. */
const CHALLENGE_BELOW_HEADER = 28;
/** Horizontal inset so the card sits inside the preview frame. */
const PREVIEW_HORIZONTAL_MARGIN = 20;

function formatRecordingTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const controlsBottom = useFloatingControlsBottom();
  const cameraRef = useRef<CameraViewportRef>(null);
  const isScreenFocused = useScreenFocus();
  const mountCamera = useDeferredCameraMount(isScreenFocused);
  const { isRecording, recordingSeconds, toggleRecording } = useVideoRecorder(cameraRef);

  // Header: safe area + padding + logo (~36) + padding
  const headerHeight = insets.top + 52;
  const challengeTop = headerHeight + CHALLENGE_BELOW_HEADER;

  return (
    <View className="flex-1">
      {mountCamera ? (
        <CameraViewport ref={cameraRef} defaultFacing="front" />
      ) : (
        <CameraPlaceholder showLoading={isScreenFocused} />
      )}

      <TanawAppBar variant="overlay" />

      <View
        className="absolute left-0 right-0 z-20"
        style={{
          top: challengeTop,
          paddingHorizontal: PREVIEW_HORIZONTAL_MARGIN,
        }}
      >
        <ChallengeCard challenge={CREATE_DEMO_CHALLENGE} />
      </View>

      {isRecording ? (
        <View
          className="absolute self-center z-20 flex-row items-center bg-recordRed/90 rounded-full px-4 py-2"
          style={{ top: challengeTop + 108 }}
        >
          <View className="w-2 h-2 rounded-full bg-white mr-2" />
          <Text className="text-white font-jua text-sm">{formatRecordingTime(recordingSeconds)}</Text>
        </View>
      ) : null}

      <View
        className="absolute left-0 right-0 flex-row items-center z-20"
        style={{
          bottom: controlsBottom,
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
        }}
      >
        <View className="flex-1" />
        <View className="flex-1 items-center">
          <RecordShutter onPress={toggleRecording} isRecording={isRecording} />
        </View>
        <View className="flex-1 items-center">
          <CameraFlipButton onPress={() => cameraRef.current?.toggleFacing()} />
        </View>
      </View>
    </View>
  );
}
