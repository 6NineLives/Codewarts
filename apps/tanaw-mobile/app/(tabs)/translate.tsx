import { memo, useRef, type RefObject } from 'react';
import { Text, View } from 'react-native';

import type { BonesCameraRef } from '@/components/camera/bones-camera-types';
import { CameraPlaceholder } from '@/components/camera/camera-placeholder';
import { VisionBonesCamera } from '@/components/camera/vision-bones-camera';
import { TanawAppBar } from '@/components/shell/tanaw-app-bar';
import { TranslateActionRow } from '@/components/translate/speak-button';
import { TranslationCard } from '@/components/translate/translation-card';
import { useDeferredCameraMount } from '@/hooks/use-deferred-camera-mount';
import { useScreenFocus } from '@/hooks/use-screen-focus';
import { useTranslateDemo } from '@/hooks/use-translate-demo';
import type { BonesLandmarks } from '@/types/bones-landmarks';

/** Clearance above the bottom tab bar for floating controls. */
const CONTROLS_BOTTOM = 112;

type TranslateControlsProps = {
  isTranslating: boolean;
  transcript: string;
  hasLandmarks: boolean;
  onToggleTranslating: () => void;
  onToggleCamera: () => void;
};

const TranslateControls = memo(function TranslateControls({
  isTranslating,
  transcript,
  hasLandmarks,
  onToggleTranslating,
  onToggleCamera,
}: TranslateControlsProps) {
  return (
    <>
      <View className="absolute right-4 z-20 bg-charcoal/70 rounded-full px-3 py-1" style={{ top: 88 }}>
        <Text className="text-cream text-xs font-jua">
          {hasLandmarks ? 'Bones: tracking' : 'Bones: no landmarks'}
        </Text>
      </View>

      <View
        className="absolute left-0 right-0 z-20"
        style={{ bottom: CONTROLS_BOTTOM }}
      >
        <TranslationCard transcript={transcript} isTranslating={isTranslating} />
        <View className="mt-4">
          <TranslateActionRow
            isTranslating={isTranslating}
            onToggleTranslating={onToggleTranslating}
            onToggleCamera={onToggleCamera}
          />
        </View>
      </View>
    </>
  );
});

type TranslateCameraPaneProps = {
  cameraRef: RefObject<BonesCameraRef | null>;
  landmarks: BonesLandmarks | null;
  onCameraReady: () => void;
  onCameraError: () => void;
};

const TranslateCameraPane = memo(function TranslateCameraPane({
  cameraRef,
  landmarks,
  onCameraReady,
  onCameraError,
}: TranslateCameraPaneProps) {
  return (
    <VisionBonesCamera
      ref={cameraRef}
      landmarks={landmarks}
      onCameraReady={onCameraReady}
      onCameraError={onCameraError}
    />
  );
});

export default function TranslateScreen() {
  const cameraRef = useRef<BonesCameraRef>(null);
  const isScreenFocused = useScreenFocus();
  const mountCamera = useDeferredCameraMount(isScreenFocused);
  const {
    isTranslating,
    transcript,
    landmarks,
    hasLandmarks,
    toggleTranslating,
    onCameraReady,
    onCameraError,
  } = useTranslateDemo(cameraRef);

  return (
    <View className="flex-1">
      {mountCamera ? (
        <TranslateCameraPane
          cameraRef={cameraRef}
          landmarks={landmarks}
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
        hasLandmarks={hasLandmarks}
        onToggleTranslating={toggleTranslating}
        onToggleCamera={() => cameraRef.current?.toggleFacing()}
      />
    </View>
  );
}
