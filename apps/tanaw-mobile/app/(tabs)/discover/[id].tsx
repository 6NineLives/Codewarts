import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  Text,
  View,
  type ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ImmersiveVideoSlide } from '@/components/discover/contribution-card';
import { TanawAppBar } from '@/components/shell/tanaw-app-bar';
import type { Contribution } from '@/contracts/contribution';
import { useContributions } from '@/contexts/contributions-context';
import { getImmersiveFeed, getImmersiveStartIndex } from '@/mocks/discover-demo';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function DiscoverImmersiveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const listRef = useRef<FlatList<Contribution>>(null);
  const insets = useSafeAreaInsets();
  const { userContributions } = useContributions();

  const immersiveFeed = useMemo(
    () => getImmersiveFeed(userContributions),
    [userContributions],
  );
  const initialIndex = useMemo(
    () => getImmersiveStartIndex(id ?? '1', userContributions),
    [id, userContributions],
  );

  return (
    <View className="flex-1 bg-charcoal">
      <TanawAppBar variant="overlay" />

      <Pressable
        onPress={() => router.back()}
        className="absolute left-4 z-20 bg-black/40 rounded-full px-4 py-2"
        style={{ top: insets.top + 60 }}
      >
        <Text className="text-cream font-jua text-sm">← Back</Text>
      </Pressable>

      <FlatList
        ref={listRef}
        data={immersiveFeed}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ height: SCREEN_HEIGHT }}>
            <ImmersiveVideoSlide item={item} />
          </View>
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        onScrollToIndexFailed={() => {
          listRef.current?.scrollToOffset({
            offset: SCREEN_HEIGHT * initialIndex,
            animated: false,
          });
        }}
        onViewableItemsChanged={({ viewableItems }: { viewableItems: ViewToken[] }) => {
          // Phase 1: swipe tracking hook for Phase 2 video playback
          void viewableItems;
        }}
      />
    </View>
  );
}
