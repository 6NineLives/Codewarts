import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

import { fetchTtsAudio } from '@/services/translate-api';

const audioCache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();

let audioModeReady = false;

async function ensureAudioMode(): Promise<void> {
  if (audioModeReady) return;
  await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
  audioModeReady = true;
}

/** Start synthesizing in the background (idempotent per text). */
export function prefetchTtsAudio(text: string): void {
  const key = text.trim();
  if (!key || audioCache.has(key) || inflight.has(key)) return;

  const promise = fetchTtsAudio(key)
    .then((result) => {
      audioCache.set(key, result.audioBase64);
      return result.audioBase64;
    })
    .catch(() => null)
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);
}

export function warmDemoTtsCache(transcripts: string[]): void {
  for (const text of transcripts) {
    prefetchTtsAudio(text);
  }
}

export async function stopTtsPlayback(sound: Audio.Sound | null): Promise<void> {
  Speech.stop();
  if (sound) {
    try {
      await sound.stopAsync();
      await sound.unloadAsync();
    } catch {
      // ignore teardown races
    }
  }
}

/**
 * Play transcript audio with minimal latency:
 * cached server MP3 when ready, otherwise instant on-device speech.
 */
export async function speakTts(
  text: string,
  soundRef: { current: Audio.Sound | null },
): Promise<void> {
  const key = text.trim();
  if (!key) return;

  const cached = audioCache.get(key);
  if (cached) {
    await ensureAudioMode();
    const previous = soundRef.current;
    soundRef.current = null;
    void previous?.unloadAsync();

    const { sound } = await Audio.Sound.createAsync(
      { uri: `data:audio/mpeg;base64,${cached}` },
      { shouldPlay: true },
    );
    soundRef.current = sound;
    return;
  }

  Speech.speak(key, { language: 'fil-PH' });
  prefetchTtsAudio(key);
}
