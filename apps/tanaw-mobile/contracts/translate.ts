/** Translate tab data contract (Phase 0 — types only). */
export interface TranslateSession {
  mode: 'fsl-to-tagalog';
  liveSignKey: string | null;
  liveSignTagalog: string;
  transcript: string;
  signsDetected: string[];
  isSpeaking: boolean;
}

export function createEmptyTranslateSession(): TranslateSession {
  return {
    mode: 'fsl-to-tagalog',
    liveSignKey: null,
    liveSignTagalog: '—',
    transcript: '',
    signsDetected: [],
    isSpeaking: false,
  };
}
