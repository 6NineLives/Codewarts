import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

type TranslationCardProps = {
  transcript: string;
  onPress?: () => void;
};

export function TranslationCard({ transcript, onPress }: TranslationCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-cream rounded-card px-7 py-5 mx-6"
      accessibilityRole="button"
      accessibilityHint="Tap to cycle demo scenarios"
    >
      <View className="flex-row items-center gap-2 mb-2">
        <MaterialCommunityIcons name="hexagon" size={16} color="#014421" />
        <Text className="text-forestGreen font-jua text-xs uppercase">FSL TO TAGALOG</Text>
      </View>
      <Text className="text-charcoal font-jua text-xl leading-7">"{transcript}"</Text>
    </Pressable>
  );
}
