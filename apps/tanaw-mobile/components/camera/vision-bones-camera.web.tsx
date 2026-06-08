import { forwardRef } from 'react';
import { Text, View } from 'react-native';

import type { BonesCameraProps, BonesCameraRef } from '@/components/camera/bones-camera-types';

/** Web fallback — bones tracking is device-only with VisionCamera. */
export const VisionBonesCamera = forwardRef<BonesCameraRef, BonesCameraProps>(
  function VisionBonesCameraWeb(_props) {
    return (
      <View className="flex-1 bg-charcoal items-center justify-center px-8">
        <Text className="text-cream font-jua text-center">
          Live bone tracking is available on Android/iOS development builds.
        </Text>
      </View>
    );
  },
);
