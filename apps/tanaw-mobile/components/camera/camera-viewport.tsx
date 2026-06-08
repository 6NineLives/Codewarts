import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

export type CameraViewportRef = {
  /** Sample the live preview as base64 JPEG for backend bones processing. */
  captureVideoFrameBase64: () => Promise<string | null>;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  toggleFacing: () => void;
  getFacing: () => CameraType;
  isReady: () => boolean;
};

type CameraViewportProps = {
  defaultFacing?: CameraType;
  /** Release the native camera session when false (tab blur). */
  isActive?: boolean;
  /** Recording uses video mode (Create tab). */
  mode?: 'picture' | 'video';
  /**
   * Translate tab: sample frames from the live preview for bones overlay.
   * Android expo-camera only binds ImageCapture in picture pipeline — preview stays live.
   */
  enableBonesCapture?: boolean;
  showFlipButton?: boolean;
  overlayUri?: string | null;
  onCameraReady?: () => void;
};

export const CameraViewport = forwardRef<CameraViewportRef, CameraViewportProps>(
  function CameraViewport(
    {
      defaultFacing = 'front',
      isActive = true,
      mode = 'video',
      enableBonesCapture = false,
      showFlipButton = false,
      overlayUri,
      onCameraReady,
    },
    ref,
  ) {
    const cameraRef = useRef<CameraView>(null);
    const recordingPromiseRef = useRef<Promise<{ uri: string } | undefined> | null>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const [facing, setFacing] = useState<CameraType>(defaultFacing);
    const [isRecording, setIsRecording] = useState(false);
    const [isCameraReady, setIsCameraReady] = useState(false);

    // Bones need frame sampling; Android video mode skips ImageCapture (ExpoCameraView.kt).
    // Picture pipeline still shows a live preview — same UX as desktop process_video.
    const cameraMode = enableBonesCapture ? 'picture' : mode;

    const toggleFacing = useCallback(() => {
      setFacing((current) => (current === 'front' ? 'back' : 'front'));
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        captureVideoFrameBase64: async () => {
          if (!cameraRef.current || !isCameraReady || !isActive) return null;
          try {
            const frame = await cameraRef.current.takePictureAsync({
              base64: true,
              quality: 0.25,
              shutterSound: false,
              skipProcessing: false,
            });
            return frame?.base64 ?? null;
          } catch (error) {
            if (__DEV__) {
              // Keep one concise log line; high-frequency logs can freeze JS on device.
              console.warn('[camera] frame capture failed');
            }
            return null;
          }
        },
        isReady: () => isActive && isCameraReady,
        startRecording: async () => {
          if (!cameraRef.current || isRecording) return;
          setIsRecording(true);
          recordingPromiseRef.current = cameraRef.current.recordAsync({
            maxDuration: 60,
          });
        },
        stopRecording: async () => {
          if (!cameraRef.current || !isRecording) return null;
          try {
            cameraRef.current.stopRecording();
            const video = await recordingPromiseRef.current;
            recordingPromiseRef.current = null;
            setIsRecording(false);
            return video?.uri ?? null;
          } catch {
            recordingPromiseRef.current = null;
            setIsRecording(false);
            return null;
          }
        },
        toggleFacing,
        getFacing: () => facing,
      }),
      [facing, isActive, isCameraReady, isRecording, toggleFacing],
    );

    if (!permission) {
      return (
        <View className="absolute inset-0 bg-charcoal items-center justify-center">
          <ActivityIndicator color="#F9FFE3" />
        </View>
      );
    }

    if (!permission.granted) {
      return (
        <View className="absolute inset-0 bg-charcoal items-center justify-center px-8">
          <Text className="text-cream font-jua text-lg text-center mb-4">
            Camera access is required for sign language translation and recording.
          </Text>
          <Pressable
            onPress={requestPermission}
            className="bg-forestGreen rounded-full px-6 py-3"
            accessibilityRole="button"
            accessibilityLabel="Grant camera permission"
          >
            <Text className="text-cream font-jua text-base">Allow Camera</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View className="absolute inset-0">
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          active={isActive}
          mode={cameraMode}
          mirror={facing === 'front'}
          animateShutter={false}
          videoQuality="720p"
          videoStabilizationMode="off"
          onCameraReady={() => {
            setIsCameraReady(true);
            onCameraReady?.();
          }}
        />
        {overlayUri ? (
          <Image
            key={overlayUri}
            source={{ uri: overlayUri }}
            style={styles.bonesOverlay}
            resizeMode="cover"
          />
        ) : null}
        {showFlipButton ? (
          <View className="absolute top-28 right-5 z-20">
            <Pressable
              onPress={toggleFacing}
              className="w-12 h-12 rounded-full bg-charcoal/70 items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="Flip camera"
            >
              <Text className="text-cream text-xl">⟳</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  bonesOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
});
