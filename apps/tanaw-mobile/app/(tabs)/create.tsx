import { useRef } from 'react';
import { Pressable, Text, View } from 'react-native';

import { CameraViewport, type CameraViewportRef } from '@/components/camera/camera-viewport';
import { ChallengeCard } from '@/components/create/challenge-card';
import { RecordShutter } from '@/components/create/record-shutter';
import { TanawAppBar } from '@/components/shell/tanaw-app-bar';
import { useVideoRecorder } from '@/hooks/use-video-recorder';
import { CREATE_DEMO_CHALLENGE } from '@/mocks/create-challenge';

function formatRecordingTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function CreateScreen() {
  const cameraRef = useRef<CameraViewportRef>(null);
  const { isRecording, recordingSeconds, toggleRecording } = useVideoRecorder(cameraRef);

  return (
    <View className="flex-1 bg-charcoal">
      <View className="absolute top-0 left-0 right-0 z-10">
        <TanawAppBar variant="overlay" />
      </View>

      <View className="absolute top-32 left-0 right-0 z-20">
        <ChallengeCard challenge={CREATE_DEMO_CHALLENGE} />
      </View>

      <CameraViewport ref={cameraRef} defaultFacing="front" />

      {isRecording ? (
        <View className="absolute top-56 self-center z-20 flex-row items-center bg-recordRed/90 rounded-full px-4 py-2">
          <View className="w-2 h-2 rounded-full bg-white mr-2" />
          <Text className="text-white font-jua text-sm">{formatRecordingTime(recordingSeconds)}</Text>
        </View>
      ) : null}

      <View className="absolute bottom-8 left-0 right-0 flex-row items-center justify-center z-20 px-8">
        <View className="flex-1" />
        <RecordShutter onPress={toggleRecording} isRecording={isRecording} />
        <View className="flex-1 items-start pl-8">
          <Pressable
            onPress={() => cameraRef.current?.toggleFacing()}
            className="w-12 h-12 rounded-full bg-charcoal/70 items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Flip camera"
          >
            <Text className="text-cream text-xl">⟳</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
