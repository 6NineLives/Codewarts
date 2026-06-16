import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

type CameraFlipButtonProps = {
  onPress?: () => void;
  disabled?: boolean;
};

export function CameraFlipButton({ onPress, disabled }: CameraFlipButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Flip camera"
      className={`w-14 h-14 rounded-full border-2 border-white/80 items-center justify-center ${
        disabled ? 'bg-charcoal/30 opacity-50' : 'bg-charcoal/60'
      }`}
    >
      <MaterialCommunityIcons name="camera-flip-outline" size={26} color="#FAF1EA" />
    </Pressable>
  );
}
