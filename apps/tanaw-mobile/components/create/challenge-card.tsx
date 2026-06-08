import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image, Text, View } from 'react-native';

import type { SignChallenge } from '@/contracts/create';

type ChallengeCardProps = {
  challenge: SignChallenge;
};

export function ChallengeCard({ challenge }: ChallengeCardProps) {
  return (
    <View className="bg-cream/60 rounded-card px-7 py-5">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <View className="flex-row items-center gap-2 mb-2">
            <MaterialCommunityIcons name="hexagon" size={16} color="#014421" />
            <Text className="text-forestGreen font-jua text-xs uppercase">DO THIS SIGN</Text>
          </View>
          <Text className="text-charcoal font-jua text-base">{challenge.meaningDisplay}</Text>
        </View>
        <View className="w-[75px] h-[75px] rounded-full border-2 border-forestGreen items-center justify-center bg-cream overflow-hidden">
          <Image 
            source={{ uri: 'https://picsum.photos/seed/tanaw/150/150' }} 
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );
}
