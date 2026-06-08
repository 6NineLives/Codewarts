import { Text, View } from 'react-native';

type DevBuildGateProps = {
  feature: string;
};

export function DevBuildGate({ feature }: DevBuildGateProps) {
  return (
    <View className="flex-1 bg-charcoal items-center justify-center px-8">
      <Text className="text-cream font-jua text-lg text-center mb-3">{feature}</Text>
      <Text className="text-cream/70 font-jua text-sm text-center leading-6">
        Requires a custom development build (not Expo Go).{'\n\n'}
        Run:{'\n'}
        npx expo run:android{'\n'}
        or{'\n'}
        npx expo run:ios
      </Text>
    </View>
  );
}
