export type MediaSourceType = 'remote' | 'asset';

export type RemoteMediaFormat = 'image' | 'video';

export type RemoteMediaSource = {
  type: 'remote';
  uri: string | null;
  /** Required for Imgur page links (imgur.com/ID). Use `video` for GIFs/MP4 posts. */
  format?: RemoteMediaFormat;
  width?: number;
  height?: number;
};

export type AssetMediaSource = {
  type: 'asset';
  /** Path relative to the mobile app root, e.g. assets/media/create/sign.png */
  path: string;
  width?: number;
  height?: number;
};

export type MediaSource = RemoteMediaSource | AssetMediaSource;

export type CreateChallengeMedia = {
  id: string;
  signKey: string;
  illustration: MediaSource;
};

export type CreateMediaConfig = {
  defaults: {
    illustration: MediaSource;
  };
  challenges: CreateChallengeMedia[];
};

export type DiscoverContributionMedia = {
  id: string;
  thumbnail: MediaSource;
  video?: MediaSource | null;
};

export type DiscoverMediaConfig = {
  defaults: {
    thumbnail: MediaSource;
    video?: MediaSource | null;
  };
  contributions: DiscoverContributionMedia[];
};

export type MediaConfig = {
  create: CreateMediaConfig;
  discover: DiscoverMediaConfig;
};
