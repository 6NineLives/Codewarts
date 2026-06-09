/**
 * Shared metrics for TanawBottomNav — keep tab bar styles aligned with these values.
 */
export const TAB_BAR_LAYOUT = {
  paddingTop: 12,
  iconSlotSize: 50,
  iconMarginBottom: 6,
  labelLineHeight: 15,
  tabPressablePaddingBottom: 2,
  minBottomInset: 12,
} as const;

/** Space between floating controls and the top edge of the tab bar. */
export const FLOATING_CONTROLS_GAP = 16;

export function getTabBarHeight(bottomSafeInset: number): number {
  const {
    paddingTop,
    iconSlotSize,
    iconMarginBottom,
    labelLineHeight,
    tabPressablePaddingBottom,
    minBottomInset,
  } = TAB_BAR_LAYOUT;

  return (
    paddingTop +
    iconSlotSize +
    iconMarginBottom +
    labelLineHeight +
    tabPressablePaddingBottom +
    Math.max(bottomSafeInset, minBottomInset)
  );
}
