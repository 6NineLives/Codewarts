/**
 * TANAW design tokens — aligned to Figma file HMdCplbVWx6qHXtE0CGSir.
 */
export const colors = {
  /** Figma screen background (#faf1ea) */
  cream: '#FAF1EA',
  forestGreen: '#014421',
  /** Active tab pill, active filter chip */
  sageGreen: '#A6B385',
  /** Speak Translation button */
  speakGreen: '#013B13',
  charcoal: '#1A1A1A',
  recordRed: '#DC2626',
  filterInactive: '#D3D3D3',
  white: '#FFFFFF',
  /** Legacy alias — prefer cream for Figma parity */
  pomeloWhite: '#FAF1EA',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  card: 28,
  nav: 30,
  pill: 999,
} as const;

export const typography = {
  brandSize: 45,
  brandTracking: -1.8,
  uiSize: 12,
  translationSize: 20,
  speakSize: 18,
} as const;

export type TanawColor = keyof typeof colors;
