import type { SignChallenge } from '@/contracts/create';
import { toTagalog } from '@/mocks/translate-demo';

/** First vocabulary entry styled like the Figma Create screen. */
export const CREATE_DEMO_CHALLENGE: SignChallenge = {
  id: 'challenge-1',
  key: 'GOOD_AFTERNOON',
  labelTagalog: toTagalog('GOOD_AFTERNOON'),
  meaningDisplay: `Meaning: "${toTagalog('GOOD_AFTERNOON')}"`,
  illustrationEmoji: '🤟',
};
