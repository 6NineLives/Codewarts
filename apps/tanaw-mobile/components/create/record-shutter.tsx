import { Pressable, View } from 'react-native';

type RecordShutterProps = {
  onPress?: () => void;
  isRecording?: boolean;
};

export function RecordShutter({ onPress, isRecording = false }: RecordShutterProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={isRecording ? 'Stop recording' : 'Record sign video'}
      className="w-[84px] h-[84px] rounded-full border-[6px] border-white items-center justify-center"
    >
      <View
        className={`bg-recordRed ${
          isRecording ? 'w-[32px] h-[32px] rounded-md' : 'w-[64px] h-[64px] rounded-full'
        }`}
      />
    </Pressable>
  );
}
