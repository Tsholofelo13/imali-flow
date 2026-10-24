import React, { useState } from 'react';
import AppText from '../components/AppText';
import Banner from '../components/Banner';
import Button from '../components/Button';
import Field from '../components/Field';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/SettingsContext';
import { updateProfile } from '../api/services';
import { errorText } from '../utils/errors';
import { toNum } from '../utils/format';
import { colors } from '../theme';

// First-time setup: the three numbers the forecast needs.
export default function SetupScreen() {
  const t = useT();
  const { setProfile } = useAuth();
  const [bills, setBills] = useState('');
  const [daily, setDaily] = useState('');
  const [balance, setBalance] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    const b = toNum(bills), d = toNum(daily), m = toNum(balance);
    if ([b, d, m].some((x) => Number.isNaN(x) || x < 0) || d <= 0) { setError(t('errNumbers')); return; }
    setBusy(true); setError('');
    try {
      setProfile(await updateProfile({ monthlyObligations: b, dailySpend: d, currentBalance: m }));
    } catch (e) { setError(errorText(e, t)); } finally { setBusy(false); }
  };

  return (
    <Screen>
      <AppText variant="title">{t('setupTitle')}</AppText>
      <AppText>{t('setupIntro')}</AppText>
      <Field label={t('monthlyBills')} value={bills} onChangeText={setBills} keyboardType="decimal-pad" />
      <Field label={t('dailySpend')} value={daily} onChangeText={setDaily} keyboardType="decimal-pad" />
      <Field label={t('moneyNow')} value={balance} onChangeText={setBalance} keyboardType="decimal-pad" />
      {error ? <Banner color={colors.red} icon="alert-circle" text={error} /> : null}
      <Button title={t('save')} icon="checkmark" loading={busy} onPress={() => void submit()} />
    </Screen>
  );
}
