import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

type SpeakTranslationButtonProps = {
  onPress: () => void;
  isSpeaking?: boolean;
  disabled?: boolean;
};

export function SpeakTranslationButton({
  onPress,
  isSpeaking = false,
  disabled = false,
}: SpeakTranslationButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || isSpeaking}
      className="flex-row items-center bg-speakGreen rounded-[33px] px-6 py-4 flex-1 mr-3"
      accessibilityRole="button"
      accessibilityLabel="Speak translation"
    >
      {isSpeaking ? (
        <ActivityIndicator color="#FAF1EA" size="small" />
      ) : (
        <MaterialCommunityIcons name="volume-high" size={22} color="#FAF1EA" />
      )}
      <Text className="text-cream font-jua text-lg ml-3">Speak Translation</Text>
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
  onSpeak,
  isSpeaking,
  onToggleCamera,
}: {
  onSpeak: () => void;
  isSpeaking?: boolean;
  onToggleCamera?: () => void;
}) {
  return (
    <View className="flex-row items-center px-7 mb-4">
      <SpeakTranslationButton onPress={onSpeak} isSpeaking={isSpeaking} />
      <CameraToggleButton onPress={onToggleCamera} />
    </View>
  );
}
