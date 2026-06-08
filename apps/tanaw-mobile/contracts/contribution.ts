export type ContributionCategory = 'all' | 'phrases' | 'greetings';

export interface Contribution {
  id: string;
  signKey: string;
  signLabelTagalog: string;
  contributorName: string;
  category: ContributionCategory;
  thumbnailUrl?: string;
  videoUrl?: string;
  fslDefinition?: string;
}
