import type { Contribution, ContributionCategory } from '@/contracts/contribution';

export const DISCOVER_FILTERS: Array<{ id: ContributionCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'phrases', label: 'Phrases' },
  { id: 'greetings', label: 'Greetings' },
];

const BASE_CONTRIBUTION: Omit<Contribution, 'id'> = {
  signKey: 'NICE_TO_MEET_YOU',
  signLabelTagalog: 'I Love You!',
  contributorName: 'Jodimeer Ammang',
  category: 'phrases',
  fslDefinition: 'FSL Sign: "I Love You"',
};

export const DISCOVER_CONTRIBUTIONS: Contribution[] = [
  { id: '1', ...BASE_CONTRIBUTION },
  { id: '2', ...BASE_CONTRIBUTION, category: 'greetings' },
  { id: '3', ...BASE_CONTRIBUTION, signLabelTagalog: 'Salamat', signKey: 'THANK_YOU' },
  { id: '4', ...BASE_CONTRIBUTION, signLabelTagalog: 'Magandang hapon', signKey: 'GOOD_AFTERNOON' },
];

/** Immersive feed — 3 vertical videos for Phase 1 swipe mock. */
export const IMMERSIVE_FEED: Contribution[] = DISCOVER_CONTRIBUTIONS.slice(0, 3);

export function getContributionById(id: string): Contribution | undefined {
  return DISCOVER_CONTRIBUTIONS.find((item) => item.id === id);
}

export function getImmersiveStartIndex(id: string): number {
  const index = IMMERSIVE_FEED.findIndex((item) => item.id === id);
  return index >= 0 ? index : 0;
}
