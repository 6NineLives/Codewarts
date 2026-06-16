import { LinearGradient } from 'expo-linear-gradient';
import { ResizeMode, Video } from 'expo-av';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { RemoteMedia } from '@/components/media/remote-media';
import type { Contribution } from '@/contracts/contribution';

function isLocalVideoUri(uri: string): boolean {
  return uri.startsWith('file:') || uri.endsWith('.mp4') || uri.endsWith('.mov');
}

function CardPreview({ item }: { item: Contribution }) {
  const previewUri = item.thumbnailUrl ?? item.videoUrl;

  if (previewUri && (item.isUserRecording || isLocalVideoUri(previewUri))) {
    return (
      <Video
        source={{ uri: previewUri }}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay={false}
        isMuted
      />
    );
  }

  if (previewUri) {
    return <Image source={{ uri: previewUri }} className="w-full h-full" resizeMode="cover" />;
  }

  return <Text className="text-5xl">🤟</Text>;
}

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
        <CardPreview item={item} />
      </View>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <View className="absolute bottom-3 left-3 right-3">
        <Text className="text-white font-jua text-xs mb-0.5">{item.signLabelTagalog}</Text>
        <Text className="text-white/80 font-jua text-[8px]" numberOfLines={1}>
          {item.description ?? item.contributorName}
        </Text>
      </View>
    </Pressable>
  );
}

export function ImmersiveVideoSlide({ item }: { item: Contribution }) {
  const detailText = item.description ?? item.fslDefinition ?? `FSL Sign: "${item.signLabelTagalog}"`;

  return (
    <View className="flex-1 bg-charcoal items-center justify-center">
      <View className="absolute inset-0 items-center justify-center bg-charcoal">
        {item.videoUrl ? (
          <RemoteMedia
            uri={item.videoUrl}
            format="video"
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : item.thumbnailUrl ? (
          <Image source={{ uri: item.thumbnailUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <Text className="text-6xl">🤟</Text>
        )}
      </View>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <View className="absolute bottom-28 left-7 right-7">
        <Text className="text-white font-jua text-xl mb-1">{item.signLabelTagalog}</Text>
        <Text className="text-white/80 font-jua text-sm mb-2">{item.contributorName}</Text>
        <Text className="text-white font-jua text-base">{detailText}</Text>
      </View>
    </View>
  );
}
