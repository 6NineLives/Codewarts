import { Text, View } from 'react-native';

import { ChallengeCard } from '@/components/create/challenge-card';
import { RecordShutter } from '@/components/create/record-shutter';
import { TanawAppBar } from '@/components/shell/tanaw-app-bar';
import { CREATE_DEMO_CHALLENGE } from '@/mocks/create-challenge';

export default function CreateScreen() {
  return (
    <View className="flex-1 bg-cream">
      <View className="absolute inset-0 bg-charcoal/90 items-center justify-center">
        <Text className="text-cream/50 font-jua text-sm">Camera preview (Phase 1 mock)</Text>
      </View>

      <View className="absolute top-0 left-0 right-0 z-10">
        <TanawAppBar variant="overlay" />
      </View>
      
      <View className="pt-24 z-20">
        <ChallengeCard challenge={CREATE_DEMO_CHALLENGE} />
      </View>

      <View className="absolute bottom-8 left-0 right-0 items-center z-20">
        <RecordShutter />
      </View>
    </View>
  );
}
