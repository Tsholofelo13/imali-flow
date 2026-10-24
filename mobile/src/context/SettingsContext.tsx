import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Key, translate } from '../i18n';

const LANG_KEY = 'imali_lang';
const LARGE_KEY = 'imali_large';

type Ctx = {
  ready: boolean;
  language: string;
  languageChosen: boolean;
  setLanguage: (code: string) => Promise<void>;
  largeText: boolean;
  setLargeText: (v: boolean) => Promise<void>;
  fontScale: number;
};

const SettingsContext = createContext<Ctx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [language, setLang] = useState('en');
  const [languageChosen, setChosen] = useState(false);
  const [largeText, setLarge] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const l = await SecureStore.getItemAsync(LANG_KEY);
        const big = await SecureStore.getItemAsync(LARGE_KEY);
        if (l) { setLang(l); setChosen(true); }
        if (big === '1') setLarge(true);
      } catch { /* use defaults */ }
      setReady(true);
    })();
  }, []);

  const setLanguage = useCallback(async (code: string) => {
    setLang(code);
    setChosen(true);
    try { await SecureStore.setItemAsync(LANG_KEY, code); } catch { /* ignore */ }
  }, []);

  const setLargeText = useCallback(async (v: boolean) => {
    setLarge(v);
    try { await SecureStore.setItemAsync(LARGE_KEY, v ? '1' : '0'); } catch { /* ignore */ }
  }, []);

  const value = useMemo(() => ({
    ready, language, languageChosen, setLanguage, largeText, setLargeText, fontScale: largeText ? 1.25 : 1,
  }), [ready, language, languageChosen, setLanguage, largeText, setLargeText]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const c = useContext(SettingsContext);
  if (!c) throw new Error('useSettings must be inside SettingsProvider');
  return c;
}

export function useT() {
  const { language } = useSettings();
  return useCallback((key: Key, vars?: Record<string, string | number>) => translate(language, key, vars), [language]);
}
