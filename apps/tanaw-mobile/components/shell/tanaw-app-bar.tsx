import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TanawAppBarProps = {
  variant?: 'default' | 'overlay';
};

export function TanawAppBar({ variant = 'default' }: TanawAppBarProps) {
  const insets = useSafeAreaInsets();
  const isOverlay = variant === 'overlay';

  return (
    <View
      className={isOverlay ? 'absolute left-0 right-0 z-10' : 'bg-cream'}
      style={{ paddingTop: insets.top + 8, paddingHorizontal: 19 }}
    >
      <Text
        className="text-forestGreen font-barrio text-4xl tracking-[-1px]"
        accessibilityRole="header"
      >
        TANAW
      </Text>
    </View>
  );
}
