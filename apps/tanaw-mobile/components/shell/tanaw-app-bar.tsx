import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TanawAppBarProps = {
  variant?: 'default' | 'overlay' | 'transparent';
};

export function TanawAppBar({ variant = 'default' }: TanawAppBarProps) {
  const insets = useSafeAreaInsets();
  const isOverlay = variant === 'overlay';
  const isTransparent = variant === 'transparent';

  return (
    <View
      className={isOverlay ? 'absolute left-0 right-0 z-10' : isTransparent ? 'bg-transparent' : 'bg-cream'}
      style={{ paddingTop: insets.top + 8, paddingHorizontal: 19, paddingBottom: 8 }}
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
