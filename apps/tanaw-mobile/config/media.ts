import type { ImageSourcePropType } from 'react-native';

import { mediaConfig } from '@/config/media.generated';
import { normalizeRemoteMediaUri } from '@/config/normalize-media-uri';
import type { MediaConfig, MediaSource, RemoteMediaFormat } from '@/config/media.types';

export type { MediaConfig, MediaSource } from '@/config/media.types';
export { mediaConfig };

export type ResolvedRemoteMedia = {
  uri: string;
  format: RemoteMediaFormat;
};

/** Resolve a manifest entry to a React Native image source. */
export function resolveMediaSource(source: MediaSource | null | undefined): ImageSourcePropType | null {
  const resolved = resolveRemoteMedia(source);
  if (!resolved || resolved.format === 'video') return null;
  return { uri: resolved.uri };
}

/** Resolve remote media with Imgur normalization and format metadata. */
export function resolveRemoteMedia(
  source: MediaSource | null | undefined,
): ResolvedRemoteMedia | null {
  if (!source || source.type !== 'remote') return null;

  const uri = normalizeRemoteMediaUri(source);
  if (!uri) return null;

  const format: RemoteMediaFormat =
    source.format ??
    (uri.endsWith('.mp4') || uri.endsWith('.webm') ? 'video' : 'image');

  return { uri, format };
}

export function getCreateChallengeIllustration(signKey: string) {
  const challenge = mediaConfig.create.challenges.find((item) => item.signKey === signKey);
  return challenge?.illustration ?? mediaConfig.create.defaults.illustration;
}

export function getDiscoverContributionMedia(id: string) {
  const contribution = mediaConfig.discover.contributions.find((item) => item.id === id);
  const contributionVideo =
    contribution && 'video' in contribution ? contribution.video : undefined;

  return {
    thumbnail: contribution?.thumbnail ?? mediaConfig.discover.defaults.thumbnail,
    video: contributionVideo ?? mediaConfig.discover.defaults.video ?? null,
  };
}
