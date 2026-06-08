import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

type CameraFlipButtonProps = {
  onPress?: () => void;
};

export function CameraFlipButton({ onPress }: CameraFlipButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Flip camera"
      className="w-14 h-14 rounded-full border-2 border-white/80 bg-charcoal/60 items-center justify-center"
    >
      <MaterialCommunityIcons name="camera-flip-outline" size={26} color="#FAF1EA" />
    </Pressable>
  );
}
