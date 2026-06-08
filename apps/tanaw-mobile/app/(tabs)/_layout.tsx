import { Tabs } from 'expo-router';

import { TanawBottomNav, type TanawTabBarProps } from '@/components/shell/tanaw-bottom-nav';
import { TanawShell } from '@/components/shell/tanaw-shell';

export const unstable_settings = {
  initialRouteName: 'translate',
};

export default function TabLayout() {
  return (
    <TanawShell>
      <Tabs
        initialRouteName="translate"
        tabBar={(props) => (
          <TanawBottomNav
            state={props.state}
            navigation={props.navigation as TanawTabBarProps['navigation']}
          />
        )}
        screenOptions={{
          headerShown: false,
          sceneStyle: { flex: 1, backgroundColor: '#FAF1EA' },
        }}
      >
        <Tabs.Screen name="translate" options={{ title: 'Translate' }} />
        <Tabs.Screen name="create" options={{ title: 'Create' }} />
        <Tabs.Screen name="discover" options={{ title: 'Discover', headerShown: false }} />
      </Tabs>
    </TanawShell>
  );
}
