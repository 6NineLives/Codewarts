import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';

import type { Contribution } from '@/contracts/contribution';

type ContributionCardProps = {
  item: Contribution;
  onPress: () => void;
};

export function ContributionCard({ item, onPress }: ContributionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="w-[47%] rounded-[20px] overflow-hidden bg-charcoal"
      style={{ aspectRatio: 165 / 270 }}
    >
      <View className="flex-1 items-center justify-center bg-charcoal/90">
        <Text className="text-5xl">🤟</Text>
      </View>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <View className="absolute bottom-3 left-3 right-3">
        <Text className="text-white font-jua text-xs mb-0.5">{item.signLabelTagalog}</Text>
        <Text className="text-white/80 font-jua text-[8px]">{item.contributorName}</Text>
      </View>
    </Pressable>
  );
}

export function ImmersiveVideoSlide({ item }: { item: Contribution }) {
  return (
    <View className="flex-1 bg-charcoal items-center justify-center">
      <View className="absolute inset-0 items-center justify-center bg-charcoal">
        <Text className="text-6xl">🤟</Text>
      </View>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <View className="absolute bottom-28 left-7 right-7">
        <Text className="text-white font-jua text-xl mb-1">{item.contributorName}</Text>
        <Text className="text-white font-jua text-base">
          {item.fslDefinition ?? `FSL Sign: "${item.signLabelTagalog}"`}
        </Text>
      </View>
    </View>
  );
}
