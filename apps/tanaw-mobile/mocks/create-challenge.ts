import { getCreateChallengeIllustration, resolveRemoteMedia } from '@/config/media';
import type { SignChallenge } from '@/contracts/create';
import { toTagalog } from '@/mocks/translate-demo';

const SIGN_KEY = 'GOOD_AFTERNOON';
const illustration = resolveRemoteMedia(getCreateChallengeIllustration(SIGN_KEY));

/** First vocabulary entry styled like the Figma Create screen. */
export const CREATE_DEMO_CHALLENGE: SignChallenge = {
  id: 'challenge-1',
  key: SIGN_KEY,
  labelTagalog: toTagalog(SIGN_KEY),
  meaningDisplay: `Meaning: "${toTagalog(SIGN_KEY)}"`,
  illustrationUrl: illustration?.uri,
  illustrationFormat: illustration?.format,
};
