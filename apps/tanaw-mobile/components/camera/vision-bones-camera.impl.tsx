import { File } from 'expo-file-system';
import { forwardRef, useCallback, useImperativeHandle, useRef, useState, type RefObject } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  type CameraPosition,
  type CameraRef,
} from 'react-native-vision-camera';

import { BonesSvgOverlay } from '@/components/camera/bones-svg-overlay';
import type { BonesCameraProps, BonesCameraRef } from '@/components/camera/bones-camera-types';

async function readTempImageBase64(path: string): Promise<string | null> {
  try {
    const file = new File(path.startsWith('file://') ? path : `file://${path}`);
    const base64 = await file.base64();
    if (file.exists) {
      file.delete();
    }
    return base64;
  } catch {
    return null;
  }
}

/** Grab a low-res preview snapshot — does not interrupt the live video stream. */
async function capturePreviewSnapshot(cameraRef: RefObject<CameraRef | null>): Promise<string | null> {
  if (!cameraRef.current) return null;
  try {
    const image = await cameraRef.current.takeSnapshot();
    const path = await image.saveToTemporaryFileAsync('jpg', 35);
    image.dispose();
    return await readTempImageBase64(path);
  } catch {
    return null;
  }
}

export const VisionBonesCameraImpl = forwardRef<BonesCameraRef, BonesCameraProps>(
  function VisionBonesCameraImpl({ landmarks, onCameraReady }, ref) {
    const cameraRef = useRef<CameraRef>(null);
    const [facing, setFacing] = useState<CameraPosition>('front');
    const [isReady, setIsReady] = useState(false);
    const [viewport, setViewport] = useState({ width: 0, height: 0 });
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice(facing);

    const toggleFacing = useCallback(() => {
      setFacing((current) => (current === 'front' ? 'back' : 'front'));
      setIsReady(false);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        captureFrameBase64: () => capturePreviewSnapshot(cameraRef),
        isReady: () => isReady,
        toggleFacing,
      }),
      [isReady, toggleFacing],
    );

    if (!hasPermission) {
      return (
        <View className="flex-1 bg-charcoal items-center justify-center px-8">
          <Text className="text-cream font-jua text-lg text-center mb-4">
            Camera permission is required for live sign tracking.
          </Text>
          <Pressable
            onPress={requestPermission}
            className="bg-forestGreen rounded-full px-6 py-3"
          >
            <Text className="text-cream font-jua text-base">Allow Camera</Text>
          </Pressable>
        </View>
      );
    }

    if (!device) {
      return (
        <View className="flex-1 bg-charcoal items-center justify-center">
          <ActivityIndicator color="#F9FFE3" />
        </View>
      );
    }

    return (
      <View
        className="flex-1 bg-black"
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          setViewport({ width, height });
        }}
      >
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive
          onPreviewStarted={() => {
            setIsReady(true);
            onCameraReady?.();
          }}
          onPreviewStopped={() => {
            setIsReady(false);
          }}
        />
        <BonesSvgOverlay
          landmarks={landmarks ?? null}
          width={viewport.width}
          height={viewport.height}
        />
      </View>
    );
  },
);
