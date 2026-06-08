import { Pressable, View } from 'react-native';

type RecordShutterProps = {
  onPress?: () => void;
};

export function RecordShutter({ onPress }: RecordShutterProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Record sign video"
      className="w-[84px] h-[84px] rounded-full border-[6px] border-white items-center justify-center"
    >
      <View className="w-[64px] h-[64px] rounded-full bg-recordRed" />
    </Pressable>
  );
}
