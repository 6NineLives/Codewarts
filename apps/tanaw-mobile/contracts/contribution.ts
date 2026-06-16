export type ContributionCategory = 'all' | 'phrases' | 'greetings';

export interface Contribution {
  id: string;
  signKey: string;
  /** Card title — user-provided or derived from sign label. */
  signLabelTagalog: string;
  contributorName: string;
  category: ContributionCategory;
  thumbnailUrl?: string;
  videoUrl?: string;
  /** User-provided description shown on Discover detail. */
  description?: string;
  fslDefinition?: string;
  /** True for clips recorded in-app (local file URI). */
  isUserRecording?: boolean;
}
