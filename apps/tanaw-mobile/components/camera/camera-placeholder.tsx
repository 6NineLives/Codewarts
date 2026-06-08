import { ActivityIndicator, View } from 'react-native';

type CameraPlaceholderProps = {
  /** Show a spinner while waiting for the other tab's camera to release. */
  showLoading?: boolean;
};

export function CameraPlaceholder({ showLoading = false }: CameraPlaceholderProps) {
  return (
    <View className="absolute inset-0 bg-charcoal items-center justify-center">
      {showLoading ? <ActivityIndicator color="#F9FFE3" /> : null}
    </View>
  );
}
