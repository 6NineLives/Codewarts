import { useEffect, useState } from 'react';

/** Let the previous tab's camera stack fully release before opening another. */
const CAMERA_HANDOFF_MS = 250;

/**
 * Fully unmount the camera when the tab blurs, then remount after a short delay on focus.
 * Fixes black preview when switching Translate (Vision Camera) ↔ Create (expo-camera).
 */
export function useDeferredCameraMount(isFocused: boolean): boolean {
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setShouldMount(false);
      return;
    }

    const id = setTimeout(() => setShouldMount(true), CAMERA_HANDOFF_MS);
    return () => clearTimeout(id);
  }, [isFocused]);

  return shouldMount;
}
