import Constants from 'expo-constants';
import { forwardRef } from 'react';

import type { BonesCameraProps, BonesCameraRef } from '@/components/camera/bones-camera-types';
import { DevBuildGate } from '@/components/camera/dev-build-gate';
import { VisionBonesCameraImpl } from '@/components/camera/vision-bones-camera.impl';

const isExpoGo = Constants.appOwnership === 'expo';

export const VisionBonesCamera = forwardRef<BonesCameraRef, BonesCameraProps>(
  function VisionBonesCameraNative(props, ref) {
    if (isExpoGo) {
      return <DevBuildGate feature="Real-time bone tracking" />;
    }

    return <VisionBonesCameraImpl ref={ref} {...props} />;
  },
);
