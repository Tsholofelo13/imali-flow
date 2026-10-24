import { ApiError } from '../api/client';
import type { Key } from '../i18n';

// Turns an API error into a sentence in the user's language. Backend messages are used only if present.
export function errorText(e: unknown, t: (k: Key) => string): string {
  if (e instanceof ApiError) {
    if (e.status === 0) return t('errNetwork');
    if (e.status === 415 || e.status === 422) return t('photoUnclear');
    return e.message || t('errGeneric');
  }
  return t('errGeneric');
}
