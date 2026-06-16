import { memo, useRef, useState, type RefObject } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { BonesCameraRef } from '@/components/camera/bones-camera-types';
import { CameraPlaceholder } from '@/components/camera/camera-placeholder';
import { TrackBonesToggle } from '@/components/camera/track-bones-toggle';
import { VisionBonesCamera } from '@/components/camera/vision-bones-camera';
import { TanawAppBar } from '@/components/shell/tanaw-app-bar';
import { TranslateActionRow } from '@/components/translate/speak-button';
import { TranslationCard } from '@/components/translate/translation-card';
import { useDeferredCameraMount } from '@/hooks/use-deferred-camera-mount';
import { useFloatingControlsBottom } from '@/hooks/use-floating-controls-bottom';
import { useScreenFocus } from '@/hooks/use-screen-focus';
import { useTranslateDemo } from '@/hooks/use-translate-demo';
import type { BonesLandmarks } from '@/types/bones-landmarks';

type TranslateControlsProps = {
  isTranslating: boolean;
  transcript: string;
  trackBones: boolean;
  onToggleBones: () => void;
  onToggleTranslating: () => void;
  onToggleCamera: () => void;
};

const TranslateControls = memo(function TranslateControls({
  isTranslating,
  transcript,
  trackBones,
  onToggleBones,
  onToggleTranslating,
  onToggleCamera,
}: TranslateControlsProps) {
  const insets = useSafeAreaInsets();
  const controlsBottom = useFloatingControlsBottom();

  return (
    <View
      className="absolute left-0 right-0 z-20"
      style={{
        bottom: controlsBottom,
        paddingLeft: Math.max(insets.left, 0),
        paddingRight: Math.max(insets.right, 0),
      }}
    >
      <View className="px-7 mb-3">
        <TrackBonesToggle enabled={trackBones} onToggle={onToggleBones} />
      </View>
      <TranslationCard transcript={transcript} isTranslating={isTranslating} />
      <View className="mt-4">
        <TranslateActionRow
          isTranslating={isTranslating}
          onToggleTranslating={onToggleTranslating}
          onToggleCamera={onToggleCamera}
        />
      </View>
    </View>
  );
});

type TranslateCameraPaneProps = {
  cameraRef: RefObject<BonesCameraRef | null>;
  landmarks: BonesLandmarks | null;
  frameAspect: number;
  onCameraReady: () => void;
  onCameraError: () => void;
};

const TranslateCameraPane = memo(function TranslateCameraPane({
  cameraRef,
  landmarks,
  frameAspect,
  onCameraReady,
  onCameraError,
}: TranslateCameraPaneProps) {
  return (
    <VisionBonesCamera
      ref={cameraRef}
      landmarks={landmarks}
      frameAspect={frameAspect}
      onCameraReady={onCameraReady}
      onCameraError={onCameraError}
    />
  );
});

export default function TranslateScreen() {
  const cameraRef = useRef<BonesCameraRef>(null);
  const isScreenFocused = useScreenFocus();
  const mountCamera = useDeferredCameraMount(isScreenFocused);
  const [trackBones, setTrackBones] = useState(true);
  const {
    isTranslating,
    transcript,
    landmarks,
    frameAspect,
    toggleTranslating,
    onCameraReady,
    onCameraError,
  } = useTranslateDemo(cameraRef, trackBones);

  return (
    <View className="flex-1">
      {mountCamera ? (
        <TranslateCameraPane
          cameraRef={cameraRef}
          landmarks={trackBones ? landmarks : null}
          frameAspect={frameAspect}
          onCameraReady={onCameraReady}
          onCameraError={onCameraError}
        />
      ) : (
        <CameraPlaceholder showLoading={isScreenFocused} />
      )}

      <TanawAppBar variant="overlay" />

      <TranslateControls
        isTranslating={isTranslating}
        transcript={transcript}
        trackBones={trackBones}
        onToggleBones={() => setTrackBones((current) => !current)}
        onToggleTranslating={toggleTranslating}
        onToggleCamera={() => cameraRef.current?.toggleFacing()}
      />
    </View>
  );
}
