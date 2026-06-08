import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_CONFIG = [
  { name: 'translate', label: 'Translate', icon: 'hand-peace' as const },
  { name: 'create', label: 'Create', icon: 'plus-circle-outline' as const },
  { name: 'discover', label: 'Discover', icon: 'compass-outline' as const },
] as const;

export type TanawTabBarProps = {
  state: {
    index: number;
    routes: Array<{ key: string; name: string; params?: object }>;
  };
  navigation: {
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault?: boolean }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string, params?: object) => void;
  };
};

export function TanawBottomNav({ state, navigation }: TanawTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-forestGreen rounded-t-[30px] px-6 pt-3"
      style={{
        paddingBottom: Math.max(insets.bottom, 12),
      }}
    >
      <View className="flex-row items-center justify-between">
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tab = TAB_CONFIG.find((t) => t.name === route.name);
          const label = tab?.label ?? route.name;
          const iconName = tab?.icon ?? 'circle-outline';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
              className="flex-1 items-center"
            >
              <View
                className={`items-center justify-center rounded-2xl px-5 py-1.5 ${
                  isFocused ? 'bg-sageGreen' : 'bg-transparent'
                }`}
              >
                <MaterialCommunityIcons
                  name={iconName}
                  size={28}
                  color="#FAF1EA"
                />
              </View>
              <Text className="text-cream font-jua text-xs mt-1">{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
