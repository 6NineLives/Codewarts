export interface SignChallenge {
  id: string;
  key: string;
  labelTagalog: string;
  meaningDisplay: string;
  illustrationUrl?: string;
  illustrationFormat?: 'image' | 'video';
  /** @deprecated Use illustrationUrl from config/media.yml */
  illustrationEmoji?: string;
}
