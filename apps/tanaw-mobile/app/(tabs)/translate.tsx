import { useRef } from 'react';
import { Text, View } from 'react-native';

import type { BonesCameraRef } from '@/components/camera/bones-camera-types';
import { VisionBonesCamera } from '@/components/camera/vision-bones-camera';
import { TanawAppBar } from '@/components/shell/tanaw-app-bar';
import { TranslateActionRow } from '@/components/translate/speak-button';
import { TranslationCard } from '@/components/translate/translation-card';
import { useTranslateDemo } from '@/hooks/use-translate-demo';

export default function TranslateScreen() {
  const cameraRef = useRef<BonesCameraRef>(null);
  const { isTranslating, transcript, landmarks, hasLandmarks, toggleTranslating, onCameraReady } =
    useTranslateDemo(cameraRef);

  return (
    <View className="flex-1 bg-charcoal">
      <VisionBonesCamera
        ref={cameraRef}
        landmarks={landmarks}
        onCameraReady={onCameraReady}
      />

      <View className="absolute top-0 left-0 right-0 z-10">
        <TanawAppBar variant="overlay" />
      </View>

      <View className="absolute top-16 right-4 z-10 bg-charcoal/70 rounded-full px-3 py-1">
        <Text className="text-cream text-xs font-jua">
          {hasLandmarks ? 'Bones: tracking' : 'Bones: no landmarks'}
        </Text>
      </View>

      <View className="absolute left-0 right-0 bottom-6 z-10">
        <TranslationCard transcript={transcript} isTranslating={isTranslating} />
        <View className="mt-4">
          <TranslateActionRow
            isTranslating={isTranslating}
            onToggleTranslating={toggleTranslating}
            onToggleCamera={() => cameraRef.current?.toggleFacing()}
          />
        </View>
      </View>
    </View>
  );
}
