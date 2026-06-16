import { Pressable, Text } from 'react-native';

type TrackBonesToggleProps = {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export function TrackBonesToggle({ enabled, onToggle, disabled }: TrackBonesToggleProps) {
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled, disabled: !!disabled }}
      accessibilityLabel="Track bones"
      className={`self-start flex-row items-center rounded-full px-4 py-2 border ${
        enabled ? 'bg-sageGreen/90 border-sageGreen' : 'bg-charcoal/50 border-white/30'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <Text className="text-cream font-jua text-xs mr-2">🦴</Text>
      <Text className="text-cream font-jua text-xs">{enabled ? 'Bones on' : 'Track bones'}</Text>
    </Pressable>
  );
}
