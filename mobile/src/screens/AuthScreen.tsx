import React, { useState } from 'react';
import AppText from '../components/AppText';
import Banner from '../components/Banner';
import Button from '../components/Button';
import Field from '../components/Field';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/SettingsContext';
import { ApiError } from '../api/client';
import { errorText } from '../utils/errors';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../config';
import { colors } from '../theme';

export default function AuthScreen() {
  const t = useT();
  const { signIn } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});

  const go = async (m: 'login' | 'register', e: string, p: string, n?: string) => {
    setBusy(true); setError(''); setFields({});
    try {
      await signIn(m, e, p, n);
    } catch (err) {
      if (err instanceof ApiError && err.fields) setFields(err.fields);
      setError(errorText(err, t));
    } finally { setBusy(false); }
  };

  const demoOn = !!DEMO_EMAIL && !!DEMO_PASSWORD;

  return (
    <Screen>
      <AppText variant="title">{t('appName')}</AppText>
      <Field label={t('email')} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" error={fields.email} />
      {mode === 'register' ? <Field label={t('yourName')} value={name} onChangeText={setName} error={fields.displayName} /> : null}
      <Field label={t('password')} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" error={fields.password} />
      {mode === 'register' ? <AppText variant="small" color={colors.muted}>{t('passwordHint')}</AppText> : null}
      {error ? <Banner color={colors.red} icon="alert-circle" text={error} /> : null}
      <Button
        title={mode === 'login' ? t('logIn') : t('signUp')}
        icon="log-in-outline"
        loading={busy}
        onPress={() => void go(mode, email, password, name)}
      />
      <Button
        variant="secondary"
        title={mode === 'login' ? t('noAccount') : t('haveAccount')}
        onPress={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setFields({}); }}
      />
      {demoOn ? <Button variant="secondary" icon="flash-outline" title={t('tryDemo')} onPress={() => void go('login', DEMO_EMAIL, DEMO_PASSWORD)} /> : null}
      <AppText variant="small" color={colors.muted}>{t('privacyLine')}</AppText>
    </Screen>
  );
}
