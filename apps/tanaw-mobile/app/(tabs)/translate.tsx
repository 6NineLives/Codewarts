import { memo, useRef, type RefObject } from 'react';
import { Text, View } from 'react-native';

import type { BonesCameraRef } from '@/components/camera/bones-camera-types';
import { VisionBonesCamera } from '@/components/camera/vision-bones-camera';
import { TanawAppBar } from '@/components/shell/tanaw-app-bar';
import { TranslateActionRow } from '@/components/translate/speak-button';
import { TranslationCard } from '@/components/translate/translation-card';
import { CameraPlaceholder } from '@/components/camera/camera-placeholder';
import { useDeferredCameraMount } from '@/hooks/use-deferred-camera-mount';
import { useScreenFocus } from '@/hooks/use-screen-focus';
import { useTranslateDemo } from '@/hooks/use-translate-demo';
import type { BonesLandmarks } from '@/types/bones-landmarks';

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
      <View className="absolute top-4 right-4 z-10 bg-charcoal/70 rounded-full px-3 py-1">
        <Text className="text-cream text-xs font-jua">
          {hasLandmarks ? 'Bones: tracking' : 'Bones: no landmarks'}
        </Text>
      </View>

      <View className="absolute left-0 right-0 bottom-6 z-10">
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
    <View className="flex-1 bg-black">
      <TanawAppBar variant="transparent" />

      <View className="flex-1 mb-28 rounded-[32px] overflow-hidden bg-charcoal">
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
        <TranslateControls
          isTranslating={isTranslating}
          transcript={transcript}
          hasLandmarks={hasLandmarks}
          onToggleTranslating={toggleTranslating}
          onToggleCamera={() => cameraRef.current?.toggleFacing()}
        />
      </View>
    </View>
  );
}
