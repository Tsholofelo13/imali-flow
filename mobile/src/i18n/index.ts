import en from './en';
import zu from './zu';
import st from './st';

export type Key = keyof typeof en;

// The 11 official language codes the backend accepts.
export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'zu', name: 'isiZulu' },
  { code: 'xh', name: 'isiXhosa' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'st', name: 'Sesotho' },
  { code: 'tn', name: 'Setswana' },
  { code: 'nso', name: 'Sepedi' },
  { code: 'ts', name: 'Xitsonga' },
  { code: 'ss', name: 'siSwati' },
  { code: 've', name: 'Tshivenda' },
  { code: 'nr', name: 'isiNdebele' },
] as const;

export type LangCode = (typeof LANGUAGES)[number]['code'];

const packs: Record<string, Record<string, string>> = { en, zu, st };

export function translate(lang: string, key: Key, vars?: Record<string, string | number>): string {
  let s = packs[lang]?.[key] ?? en[key];
  if (vars) for (const k of Object.keys(vars)) s = s.split(`{${k}}`).join(String(vars[k]));
  return s;
}

// Text-to-speech locale per language. Many phones have no voice for the smaller languages.
export const VOICE: Record<string, string> = {
  en: 'en-ZA', zu: 'zu-ZA', xh: 'xh-ZA', af: 'af-ZA', st: 'st-ZA', tn: 'tn-ZA',
  nso: 'nso-ZA', ts: 'ts-ZA', ss: 'ss-ZA', ve: 've-ZA', nr: 'nr-ZA',
};
