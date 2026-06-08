import { Pressable, ScrollView, Text, View } from 'react-native';

import type { ContributionCategory } from '@/contracts/contribution';
import { DISCOVER_FILTERS } from '@/mocks/discover-demo';

type FilterPillsProps = {
  active: ContributionCategory | 'all';
  onChange: (category: ContributionCategory | 'all') => void;
};

export function FilterPills({ active, onChange }: FilterPillsProps) {
  return (
    <View className="flex-row items-center justify-between mb-4 px-1">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
        {DISCOVER_FILTERS.map((filter) => {
          const isActive = filter.id === active;
          return (
            <Pressable
              key={filter.id}
              onPress={() => onChange(filter.id)}
              className={`mr-2 rounded-[30px] px-4 py-1.5 ${
                isActive ? 'bg-sageGreen' : 'bg-filterInactive'
              }`}
            >
              <Text
                className={`font-jua text-xs ${isActive ? 'text-white' : 'text-forestGreen'}`}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Text className="text-forestGreen font-jua text-xs ml-2">Explore Reels</Text>
    </View>
  );
}

export function SectionHeader() {
  return (
    <Text className="text-forestGreen font-jua text-[25px] mb-3 px-1">
      COMMUNITY CONTRIBUTIONS
    </Text>
  );
}
