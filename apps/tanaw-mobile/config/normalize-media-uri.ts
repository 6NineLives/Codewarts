import type { RemoteMediaSource } from '@/config/media.types';

const IMGUR_PAGE_HOSTS = new Set(['imgur.com', 'www.imgur.com']);

/**
 * React Native Image/Video need direct file URLs — not Imgur gallery pages.
 * @see https://imgur.com/hjWXPHA → https://i.imgur.com/hjWXPHA.mp4
 */
export function normalizeRemoteMediaUri(source: RemoteMediaSource): string | null {
  if (!source.uri) return null;

  try {
    const url = new URL(source.uri.trim());

    if (!IMGUR_PAGE_HOSTS.has(url.hostname) && url.hostname !== 'i.imgur.com') {
      return source.uri;
    }

    if (IMGUR_PAGE_HOSTS.has(url.hostname) && url.pathname.startsWith('/a/')) {
      if (__DEV__) {
        console.warn(
          `[media] Imgur album URLs are not supported (${source.uri}). ` +
            'Open the post and use its direct i.imgur.com link instead.',
        );
      }
      return null;
    }

    if (url.hostname === 'i.imgur.com') {
      return source.uri;
    }

    const id = url.pathname.replace(/^\//, '').split(/[./]/)[0];
    if (!id) return source.uri;

    if (source.format === 'video') {
      return `https://i.imgur.com/${id}.mp4`;
    }

    if (source.format === 'image') {
      return `https://i.imgur.com/${id}.jpg`;
    }

    // Page link without format — default to image poster for thumbnails.
    return `https://i.imgur.com/${id}.jpg`;
  } catch {
    return source.uri;
  }
}
