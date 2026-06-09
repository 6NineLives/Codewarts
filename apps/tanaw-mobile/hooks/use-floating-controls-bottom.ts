import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FLOATING_CONTROLS_GAP, getTabBarHeight } from '@/constants/shell-layout';

/**
 * Bottom offset for absolutely positioned controls sitting above the tab bar.
 * Uses the measured tab bar height (includes Android 3-button nav inset) with a
 * calculated fallback until the first layout pass.
 */
export function useFloatingControlsBottom(gap = FLOATING_CONTROLS_GAP): number {
  const insets = useSafeAreaInsets();
  const measuredTabBarHeight = useBottomTabBarHeight();
  const estimatedTabBarHeight = getTabBarHeight(insets.bottom);
  const tabBarHeight = Math.max(measuredTabBarHeight, estimatedTabBarHeight);

  return tabBarHeight + gap;
}
