import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

export function TranslateToggleButton({
  isTranslating,
  onPress,
}: {
  isTranslating: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center rounded-[33px] px-6 py-4 flex-1 mr-3 ${
        isTranslating ? 'bg-recordRed' : 'bg-speakGreen'
      }`}
      accessibilityRole="button"
      accessibilityLabel={isTranslating ? 'Stop translating' : 'Start translating'}
    >
      <MaterialCommunityIcons
        name={isTranslating ? 'stop-circle-outline' : 'play-circle-outline'}
        size={22}
        color="#FAF1EA"
      />
      <Text className="text-cream font-jua text-lg ml-3">
        {isTranslating ? 'Stop translating' : 'Start translating'}
      </Text>
    </Pressable>
  );
}

export function CameraToggleButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="w-[53px] h-[53px] rounded-full bg-speakGreen items-center justify-center"
      accessibilityRole="button"
      accessibilityLabel="Switch camera"
    >
      <MaterialCommunityIcons name="camera-flip-outline" size={28} color="#FAF1EA" />
    </Pressable>
  );
}

export function TranslateActionRow({
  isTranslating,
  onToggleTranslating,
  onToggleCamera,
}: {
  isTranslating: boolean;
  onToggleTranslating: () => void;
  onToggleCamera?: () => void;
}) {
  return (
    <View className="flex-row items-center px-7">
      <TranslateToggleButton isTranslating={isTranslating} onPress={onToggleTranslating} />
      <CameraToggleButton onPress={onToggleCamera} />
    </View>
  );
}
