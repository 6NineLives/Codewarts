import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ContributionCard } from '@/components/discover/contribution-card';
import { FilterPills, SectionHeader } from '@/components/discover/filter-pills';
import { TanawAppBar } from '@/components/shell/tanaw-app-bar';
import type { ContributionCategory } from '@/contracts/contribution';
import { DISCOVER_CONTRIBUTIONS } from '@/mocks/discover-demo';

export default function DiscoverGridScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<ContributionCategory | 'all'>('all');

  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return DISCOVER_CONTRIBUTIONS;
    return DISCOVER_CONTRIBUTIONS.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  return (
    <View className="flex-1 bg-cream">
      <TanawAppBar />
      <ScrollView className="flex-1" contentContainerClassName="px-5 pb-8 pt-2">
        <SectionHeader />
        <FilterPills active={activeFilter} onChange={setActiveFilter} />

        <View className="flex-row flex-wrap justify-between gap-y-3">
          {filteredItems.map((item) => (
            <ContributionCard
              key={item.id}
              item={item}
              onPress={() => router.push(`/discover/${item.id}`)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
