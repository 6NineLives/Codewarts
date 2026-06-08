import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

type TranslationCardProps = {
  transcript: string;
  isTranslating: boolean;
};

export function TranslationCard({ transcript, isTranslating }: TranslationCardProps) {
  const displayText = transcript || (isTranslating ? 'Nakikinig…' : 'Press Start translating');
  const isFinalTranslation = Boolean(transcript && transcript !== 'Nakikinig…');

  return (
    <View className="bg-cream rounded-card px-7 py-5 mx-6">
      <View className="flex-row items-center gap-2 mb-2">
        <MaterialCommunityIcons name="hexagon" size={16} color="#014421" />
        <Text className="text-forestGreen font-jua text-xs uppercase">FSL TO TAGALOG</Text>
      </View>
      <Text className="text-charcoal font-jua text-xl leading-7">
        {isFinalTranslation ? `"${displayText}"` : displayText}
      </Text>
    </View>
  );
}
