import { getDiscoverContributionMedia, resolveRemoteMedia } from '@/config/media';
import type { Contribution, ContributionCategory } from '@/contracts/contribution';
import { toTagalog } from '@/mocks/translate-demo';

export const DISCOVER_FILTERS: Array<{ id: ContributionCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'phrases', label: 'Phrases' },
  { id: 'greetings', label: 'Greetings' },
];

function mediaUrlsForId(id: string) {
  const media = getDiscoverContributionMedia(id);
  const thumbnail = resolveRemoteMedia(media.thumbnail);
  const video = resolveRemoteMedia(media.video);
  return {
    thumbnailUrl: thumbnail?.uri,
    videoUrl: video?.uri,
  };
}

function contribution(
  id: string,
  signKey: string,
  category: ContributionCategory,
  contributorName: string,
  signLabelTagalog?: string,
  fslDefinition?: string,
): Contribution {
  const label = signLabelTagalog ?? toTagalog(signKey);
  return {
    id,
    signKey,
    signLabelTagalog: label,
    contributorName,
    category,
    fslDefinition: fslDefinition ?? `FSL Sign: "${label}"`,
    ...mediaUrlsForId(id),
  };
}

export const DISCOVER_CONTRIBUTIONS: Contribution[] = [
  contribution('1', 'GOOD_AFTERNOON', 'greetings', 'Maria Santos'),
  contribution('2', 'NICE_TO_MEET_YOU', 'greetings', 'Jomari Cruz'),
  contribution('3', 'HOW_ARE_YOU', 'greetings', 'Ana Reyes'),
  contribution('4', 'IM_FINE', 'greetings', 'Paolo Mendoza'),
  contribution('5', 'THANK_YOU', 'phrases', 'Liza Torres'),
  contribution('6', 'YES', 'phrases', 'Ken Villanueva'),
  contribution('7', 'UNDERSTAND', 'phrases', 'Sofia Ramos'),
  contribution(
    '8',
    'ONE',
    'phrases',
    'Diego Flores',
    'Isa, Dalawa, Tatlo',
    'FSL Signs: "Isa" · "Dalawa" · "Tatlo"',
  ),
];

/** Immersive feed — vertical swipe through community clips. */
export const IMMERSIVE_FEED: Contribution[] = DISCOVER_CONTRIBUTIONS;

export function getContributionById(id: string): Contribution | undefined {
  return DISCOVER_CONTRIBUTIONS.find((item) => item.id === id);
}

export function getImmersiveStartIndex(id: string): number {
  const index = IMMERSIVE_FEED.findIndex((item) => item.id === id);
  return index >= 0 ? index : 0;
}
