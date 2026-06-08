import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 8000;

/** Host of the machine running Expo + uvicorn (same dev session). */
function getExpoDevHost(): string | null {
  const debuggerHost =
    Constants.expoGoConfig?.debuggerHost ??
    (
      Constants.manifest2 as
        | { extra?: { expoGo?: { debuggerHost?: string } } }
        | undefined
    )?.extra?.expoGo?.debuggerHost;

  if (debuggerHost) {
    return debuggerHost.split(':')[0] ?? null;
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    return hostUri.split(':')[0] ?? null;
  }

  return null;
}

/**
 * Candidate API URLs, ordered by preference.
 * Uses the same host as the Expo dev server so mobile + API stay in sync.
 */
export function getApiBaseUrlCandidates(): string[] {
  const candidates: string[] = [];

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    candidates.push(`http://${window.location.hostname}:${API_PORT}`);
  }

  const devHost = getExpoDevHost();
  if (devHost) {
    candidates.push(`http://${devHost}:${API_PORT}`);
  }

  if (Platform.OS === 'android') {
    candidates.push(`http://10.0.2.2:${API_PORT}`);
  }

  candidates.push(`http://localhost:${API_PORT}`);

  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (fromEnv) {
    candidates.unshift(fromEnv);
  }

  return [...new Set(candidates)];
}

export function getApiBaseUrl(): string {
  return getApiBaseUrlCandidates()[0] ?? `http://localhost:${API_PORT}`;
}
