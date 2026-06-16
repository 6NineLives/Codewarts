import { useCallback, useRef, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BonesSvgOverlay } from '@/components/camera/bones-svg-overlay';
import { CameraPlaceholder } from '@/components/camera/camera-placeholder';
import { CameraViewport, type CameraViewportRef } from '@/components/camera/camera-viewport';
import { TrackBonesToggle } from '@/components/camera/track-bones-toggle';
import { CameraFlipButton } from '@/components/create/camera-flip-button';
import { ChallengeCard } from '@/components/create/challenge-card';
import { RecordShutter } from '@/components/create/record-shutter';
import { SubmitRecordingModal } from '@/components/create/submit-recording-modal';
import { TanawAppBar } from '@/components/shell/tanaw-app-bar';
import { useContributions } from '@/contexts/contributions-context';
import { useBonesOverlay } from '@/hooks/use-bones-overlay';
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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const controlsBottom = useFloatingControlsBottom();
  const cameraRef = useRef<CameraViewportRef>(null);
  const isScreenFocused = useScreenFocus();
  const mountCamera = useDeferredCameraMount(isScreenFocused);
  const { addContribution } = useContributions();
  const [pendingVideoUri, setPendingVideoUri] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [trackBones, setTrackBones] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  const handleRecordingComplete = useCallback((uri: string) => {
    setPendingVideoUri(uri);
    setShowSubmitModal(true);
  }, []);

  const { isRecording, recordingSeconds, toggleRecording } = useVideoRecorder(cameraRef, {
    onRecordingComplete: handleRecordingComplete,
  });

  const bonesEnabled = trackBones && !isRecording && isScreenFocused;
  const { landmarks, frameAspect, onCameraReady } = useBonesOverlay(cameraRef, bonesEnabled);

  const headerHeight = insets.top + 52;
  const challengeTop = headerHeight + CHALLENGE_BELOW_HEADER;

  const handlePublish = useCallback(
    async (title: string, description: string) => {
      if (!pendingVideoUri) return;

      await addContribution({
        title,
        description,
        videoUri: pendingVideoUri,
        category: 'phrases',
      });

      setShowSubmitModal(false);
      setPendingVideoUri(null);
      Alert.alert('Published!', `"${title}" is now on Discover.`, [
        { text: 'Stay here', style: 'cancel' },
        {
          text: 'View Discover',
          onPress: () => router.push('/discover'),
        },
      ]);
    },
    [addContribution, pendingVideoUri, router],
  );

  const handleDiscard = useCallback(() => {
    setShowSubmitModal(false);
    setPendingVideoUri(null);
  }, []);

  const handleFlipCamera = useCallback(() => {
    setFacing((current) => (current === 'front' ? 'back' : 'front'));
    cameraRef.current?.toggleFacing();
  }, []);

  return (
    <View className="flex-1" onLayout={(e) => setViewport(e.nativeEvent.layout)}>
      {mountCamera ? (
        <CameraViewport
          ref={cameraRef}
          defaultFacing="front"
          isActive={isScreenFocused}
          enableBonesCapture={bonesEnabled}
          onCameraReady={onCameraReady}
        />
      ) : (
        <CameraPlaceholder showLoading={isScreenFocused} />
      )}

      {bonesEnabled && landmarks && viewport.width > 0 ? (
        <View className="absolute inset-0 z-10" pointerEvents="none">
          <BonesSvgOverlay
            landmarks={landmarks}
            width={viewport.width}
            height={viewport.height}
            sourceAspect={frameAspect}
          />
        </View>
      ) : null}

      <TanawAppBar variant="overlay" />

      <View
        className="absolute left-0 right-0 z-20"
        style={{
          top: challengeTop,
          paddingHorizontal: PREVIEW_HORIZONTAL_MARGIN,
        }}
      >
        <ChallengeCard challenge={CREATE_DEMO_CHALLENGE} />
        <View className="mt-3">
          <TrackBonesToggle
            enabled={trackBones}
            onToggle={() => setTrackBones((current) => !current)}
            disabled={isRecording}
          />
        </View>
      </View>

      {isRecording ? (
        <View
          className="absolute self-center z-20 flex-row items-center bg-recordRed/90 rounded-full px-4 py-2"
          style={{ top: challengeTop + 148 }}
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
          <CameraFlipButton onPress={handleFlipCamera} disabled={isRecording} />
        </View>
      </View>

      <SubmitRecordingModal
        visible={showSubmitModal}
        videoUri={pendingVideoUri}
        defaultTitle={CREATE_DEMO_CHALLENGE.labelTagalog}
        onCancel={handleDiscard}
        onSubmit={handlePublish}
      />
    </View>
  );
}
