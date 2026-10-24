import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearToken, getToken, saveToken, setUnauthorizedHandler } from '../api/client';
import * as api from '../api/services';
import type { Profile } from '../types';
import { useSettings } from './SettingsContext';

type Ctx = {
  ready: boolean;
  token: string | null;
  profile: Profile | null;
  profileError: boolean;
  signIn: (mode: 'login' | 'register', email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
  setProfile: (p: Profile) => void;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { language, setLanguage } = useSettings();
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState(false);

  const signOut = useCallback(async () => {
    await clearToken();
    setToken(null);
    setProfile(null);
    setProfileError(false);
  }, []);

  // Any 401 on a logged-in request (for example after 2 hours) sends the user back to login.
  useEffect(() => {
    setUnauthorizedHandler(() => { void signOut(); });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const loadProfile = useCallback(async () => {
    setProfileError(false);
    try {
      const p = await api.getProfile();
      setProfile(p);
      if (p.language && p.language !== language) await setLanguage(p.language);
    } catch (e) {
      if (!(e instanceof api.ApiError) || e.status !== 401) setProfileError(true);
    }
  }, [language, setLanguage]);

  useEffect(() => {
    (async () => {
      const t = await getToken();
      if (t) setToken(t);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (token && !profile) void loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const signIn = useCallback(async (mode: 'login' | 'register', email: string, password: string, displayName?: string) => {
    const res = mode === 'register'
      ? await api.register(email.trim(), password, displayName?.trim() || undefined, language)
      : await api.login(email.trim(), password);
    await saveToken(res.token);
    setProfile(null);
    setToken(res.token);
  }, [language]);

  const value = useMemo(() => ({
    ready, token, profile, profileError, signIn, signOut, loadProfile, setProfile,
  }), [ready, token, profile, profileError, signIn, signOut, loadProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const c = useContext(AuthContext);
  if (!c) throw new Error('useAuth must be inside AuthProvider');
  return c;
}
