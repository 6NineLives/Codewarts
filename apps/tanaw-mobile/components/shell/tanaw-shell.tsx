import type { ReactNode } from 'react';
import { View } from 'react-native';

type TanawShellProps = {
  children: ReactNode;
  /** When true, content fills the screen (camera/video tabs). */
  fullBleed?: boolean;
};

/** App shell content slot. Bottom nav is rendered by tab layout. */
export function TanawShell({ children, fullBleed = false }: TanawShellProps) {
  return (
    <View className="flex-1 bg-cream">
      {children}
    </View>
  );
}
