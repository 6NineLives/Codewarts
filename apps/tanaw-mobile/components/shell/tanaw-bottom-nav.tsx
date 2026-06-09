import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarHeightCallbackContext } from '@react-navigation/bottom-tabs';
import { useContext } from 'react';
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAB_BAR_LAYOUT } from '@/constants/shell-layout';

const TAB_CONFIG = [
  {
    name: 'translate',
    label: 'Translate',
    icon: 'hand-peace' as const,
    activeIcon: 'hand-peace' as const,
  },
  {
    name: 'create',
    label: 'Create',
    icon: 'plus-circle-outline' as const,
    activeIcon: 'plus-circle' as const,
  },
  {
    name: 'discover',
    label: 'Discover',
    icon: 'compass-outline' as const,
    activeIcon: 'compass' as const,
  },
] as const;

const CREAM = '#FAF1EA';
const SAGE_GREEN = '#A6B385';

const ICON_RING_SIZE = TAB_BAR_LAYOUT.iconSlotSize;

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
  const onTabBarHeightChange = useContext(BottomTabBarHeightCallbackContext);

  const handleLayout = (event: LayoutChangeEvent) => {
    onTabBarHeightChange?.(event.nativeEvent.layout.height);
  };

  return (
    <View
      onLayout={handleLayout}
      className="bg-forestGreen rounded-t-[30px] px-5 absolute bottom-0 left-0 right-0 z-50"
      style={{
        paddingTop: TAB_BAR_LAYOUT.paddingTop,
        paddingBottom: Math.max(insets.bottom, TAB_BAR_LAYOUT.minBottomInset),
      }}
    >
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const tab = TAB_CONFIG.find((t) => t.name === route.name);
          const label = tab?.label ?? route.name;
          const iconName = isFocused ? (tab?.activeIcon ?? tab?.icon) : (tab?.icon ?? 'circle-outline');

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
              style={styles.tabPressable}
            >
              <View style={styles.iconSlot}>
                {isFocused ? (
                  <>
                    <View style={styles.iconHalo} />
                    <View style={styles.iconRing}>
                      <MaterialCommunityIcons name={iconName} size={26} color={CREAM} />
                    </View>
                  </>
                ) : (
                  <MaterialCommunityIcons name={iconName} size={24} color="rgba(250, 241, 234, 0.55)" />
                )}
              </View>
              <Text style={[styles.tabLabel, isFocused ? styles.tabLabelActive : styles.tabLabelInactive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  tabPressable: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: TAB_BAR_LAYOUT.tabPressablePaddingBottom,
  },
  iconSlot: {
    width: ICON_RING_SIZE,
    height: ICON_RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: TAB_BAR_LAYOUT.iconMarginBottom,
  },
  iconHalo: {
    position: 'absolute',
    width: ICON_RING_SIZE,
    height: ICON_RING_SIZE,
    borderRadius: ICON_RING_SIZE / 2,
    backgroundColor: 'rgba(250, 241, 234, 0.14)',
  },
  iconRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: SAGE_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  tabLabel: {
    fontFamily: 'Jua_400Regular',
    fontSize: 11,
    lineHeight: TAB_BAR_LAYOUT.labelLineHeight,
    letterSpacing: 0.2,
  },
  tabLabelActive: {
    color: CREAM,
    opacity: 1,
  },
  tabLabelInactive: {
    color: CREAM,
    opacity: 0.5,
  },
});
