import { File } from 'expo-file-system';
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type RefObject,
} from 'react';
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
    const path = await image.saveToTemporaryFileAsync('jpg', 72);
    image.dispose();
    return await readTempImageBase64(path);
  } catch {
    return null;
  }
}

const VisionBonesCameraInner = forwardRef<BonesCameraRef, BonesCameraProps>(
  function VisionBonesCameraInner(
    { landmarks, frameAspect, isActive = true, onCameraReady, onCameraError },
    ref,
  ) {
    const cameraRef = useRef<CameraRef>(null);
    const [facing, setFacing] = useState<CameraPosition>('front');
    const [isReady, setIsReady] = useState(false);
    const [viewport, setViewport] = useState({ width: 0, height: 0 });
    const [fatalError, setFatalError] = useState<string | null>(null);
    const [sessionKey, setSessionKey] = useState(0);
    const { hasPermission, requestPermission } = useCameraPermission();
    const device = useCameraDevice(facing);

    const handleFatalError = useCallback(
      (message: string) => {
        setIsReady(false);
        setFatalError(message);
        onCameraError?.(message);
      },
      [onCameraError],
    );

    const retryCamera = useCallback(() => {
      setFatalError(null);
      setIsReady(false);
      setSessionKey((key) => key + 1);
    }, []);

    const toggleFacing = useCallback(() => {
      setFacing((current) => (current === 'front' ? 'back' : 'front'));
      setIsReady(false);
      setFatalError(null);
    }, []);

    // Resume bones loop when tab refocuses and preview is already running.
    useEffect(() => {
      if (isActive && isReady && !fatalError) {
        onCameraReady?.();
      }
    }, [fatalError, isActive, isReady, onCameraReady]);

    useImperativeHandle(
      ref,
      () => ({
        captureFrameBase64: () => {
          if (!isActive || fatalError) return Promise.resolve(null);
          return capturePreviewSnapshot(cameraRef);
        },
        getBonesFrameMeta: () => ({
          cameraFacing: facing,
          captureKind: 'preview-snapshot' as const,
          frameMirrored: facing === 'front',
        }),
        isReady: () => isActive && isReady && !fatalError,
        toggleFacing,
      }),
      [fatalError, facing, isActive, isReady, toggleFacing],
    );

    const onLayout = useCallback(
      (event: { nativeEvent: { layout: { width: number; height: number } } }) => {
        const { width, height } = event.nativeEvent.layout;
        setViewport((prev) =>
          prev.width === width && prev.height === height ? prev : { width, height },
        );
      },
      [],
    );

    if (!hasPermission) {
      return (
        <View className="absolute inset-0 bg-charcoal items-center justify-center px-8">
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
        <View className="absolute inset-0 bg-charcoal items-center justify-center">
          <ActivityIndicator color="#F9FFE3" />
        </View>
      );
    }

    if (fatalError) {
      return (
        <View className="absolute inset-0 bg-charcoal items-center justify-center px-8">
          <Text className="text-cream font-jua text-lg text-center mb-2">Camera unavailable</Text>
          <Text className="text-cream/70 font-jua text-sm text-center mb-6 leading-5">
            {fatalError.includes('device policy')
              ? 'The camera may be in use by another app or restricted by your device. Close other camera apps, then retry.'
              : 'The camera session stopped unexpectedly. Tap retry to reopen it.'}
          </Text>
          <Pressable onPress={retryCamera} className="bg-forestGreen rounded-full px-6 py-3">
            <Text className="text-cream font-jua text-base">Retry camera</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View className="absolute inset-0" onLayout={onLayout}>
        <Camera
          key={`${sessionKey}-${facing}`}
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive}
          resizeMode="cover"
          mirrorMode={facing === 'front' ? 'on' : 'off'}
          onError={(error) => handleFatalError(error.message)}
          onPreviewStarted={() => {
            if (!isActive) return;
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
          sourceAspect={frameAspect}
        />
      </View>
    );
  },
);

export const VisionBonesCameraImpl = memo(VisionBonesCameraInner);
