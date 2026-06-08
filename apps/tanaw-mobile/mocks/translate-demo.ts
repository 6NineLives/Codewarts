/**
 * Demo scenarios ported from fsl_translator_app_demo.py
 * Used for Translate tab UI testing without camera/API.
 */

export const DEMO_SCENARIOS: string[][] = [
  ['HELLO'],
  ['GOOD_AFTERNOON', 'NICE_TO_MEET_YOU'],
  ['YES'],
  ['NO'],
  ['ONE', 'TWO', 'THREE'],
  ['SIX', 'SEVEN'],
];

/** Demo-specific Tagalog overrides (matches Python DEMO_TAGALOG_OVERRIDES). */
export const DEMO_TAGALOG_OVERRIDES: Record<string, string> = {
  NICE_TO_MEET_YOU: 'Ikinagagalak ko kayo makilala',
};

/** Stagger delay between multi-sign reveals (ms). */
export const DEMO_LABEL_DELAY_MS = 5000;

/** Tagalog labels from sign_labels.py TAGALOG_BY_KEY */
export const TAGALOG_BY_KEY: Record<string, string> = {
  HELLO: 'Hello',
  GOOD_AFTERNOON: 'Magandang hapon',
  NICE_TO_MEET_YOU: 'Ikinagagalak kitang makilala',
  YES: 'Oo',
  NO: 'Hindi',
  THANK_YOU: 'Salamat',
  HOW_ARE_YOU: 'Kumusta ka?',
  ONE: 'Isa',
  TWO: 'Dalawa',
  THREE: 'Tatlo',
  SIX: 'Anim',
  SEVEN: 'Pito',
  CORRECT: 'Tama',
  WRONG: 'Mali',
  IM_FINE: 'Okay lang ako',
  UNDERSTAND: 'Naiintindihan ko',
};

export function toTagalog(key: string): string {
  if (!key) return '—';
  const normalized = key.trim().toUpperCase();
  return DEMO_TAGALOG_OVERRIDES[normalized] ?? TAGALOG_BY_KEY[normalized] ?? key.replace(/_/g, ' ');
}

export function demoSignsToTagalog(keys: string[]): string[] {
  return keys.filter(Boolean).map((k) => toTagalog(k));
}

/** Fallback transcript when Gemini is unavailable (matches DemoSemanticInterpreter._demo_fallback). */
export function demoFallbackTranscript(signs: string[]): string {
  const words = demoSignsToTagalog(signs);
  if (!words.length) return '';

  let sentence = words.join(' ');
  if (sentence && !'.?!'.includes(sentence[sentence.length - 1]!)) {
    sentence += '.';
  }
  return sentence ? sentence[0]!.toUpperCase() + sentence.slice(1) : '';
}

export interface DemoScenario {
  id: number;
  signs: string[];
  signLabelsTagalog: string[];
  transcript: string;
}

export function getDemoScenarios(): DemoScenario[] {
  return DEMO_SCENARIOS.map((signs, id) => ({
    id,
    signs,
    signLabelsTagalog: demoSignsToTagalog(signs),
    transcript: demoFallbackTranscript(signs),
  }));
}

/** Advance demo index cyclically (mirrors demo app _demo_index behavior). */
export function nextDemoScenarioIndex(current: number): number {
  return (current + 1) % DEMO_SCENARIOS.length;
}

export function getDemoScenario(index: number): DemoScenario | undefined {
  const signs = DEMO_SCENARIOS[index];
  if (!signs) return undefined;
  return {
    id: index,
    signs,
    signLabelsTagalog: demoSignsToTagalog(signs),
    transcript: demoFallbackTranscript(signs),
  };
}
