import { useIsFocused } from '@react-navigation/native';

/** True while this tab/screen is focused — use to release the camera on blur. */
export function useScreenFocus(): boolean {
  return useIsFocused();
}
