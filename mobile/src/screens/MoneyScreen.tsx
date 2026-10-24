import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AppText from '../components/AppText';
import Banner from '../components/Banner';
import Button from '../components/Button';
import Card from '../components/Card';
import Field from '../components/Field';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/SettingsContext';
import { listIncome, logIncome, getProfile } from '../api/services';
import { errorText } from '../utils/errors';
import { rand, shortDate, toNum } from '../utils/format';
import { colors, radius } from '../theme';
import type { Key } from '../i18n';
import type { IncomeResult } from '../types';

const SOURCES: { key: Key; value: string }[] = [
  { key: 'srcStall', value: 'Stall sales' },
  { key: 'srcEwallet', value: 'eWallet' },
  { key: 'srcWages', value: 'Wages' },
  { key: 'srcOther', value: 'Other' },
];

function Amount({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card style={{ borderColor: color, borderWidth: 2 }}>
      <AppText variant="label" color={colors.muted}>{label}</AppText>
      <AppText variant="big" color={color}>{rand(value)}</AppText>
    </Card>
  );
}

export default function MoneyScreen() {
  const t = useT();
  const { setProfile } = useAuth();
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState(SOURCES[0].value);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<IncomeResult | null>(null);
  const [recent, setRecent] = useState<IncomeResult[]>([]);

  const loadRecent = useCallback(async () => {
    try { setRecent((await listIncome()).slice(0, 5)); } catch { /* list is optional */ }
  }, []);
  useFocusEffect(useCallback(() => { void loadRecent(); }, [loadRecent]));

  const submit = async () => {
    const n = toNum(amount);
    if (Number.isNaN(n) || n < 1) { setError(t('errAmount')); return; }
    setBusy(true); setError('');
    try {
      setResult(await logIncome(n, source));
      setAmount('');
      void loadRecent();
      try { setProfile(await getProfile()); } catch { /* balance refresh is optional */ }
    } catch (e) { setError(errorText(e, t)); } finally { setBusy(false); }
  };

  return (
    <Screen>
      <AppText variant="title">{t('moneyCameIn')}</AppText>
      <Field label={t('howMuch')} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="1500" />
      <AppText variant="label" bold>{t('whereFrom')}</AppText>
      <View style={s.chips}>
        {SOURCES.map((x) => {
          const on = x.value === source;
          return (
            <Pressable key={x.value} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => setSource(x.value)}
              style={[s.chip, on && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
              <AppText variant="label" bold color={on ? colors.white : colors.text}>{t(x.key)}</AppText>
            </Pressable>
          );
        })}
      </View>
      {error ? <Banner color={colors.red} icon="alert-circle" text={error} /> : null}
      <Button title={t('splitIt')} icon="git-branch-outline" loading={busy} onPress={() => void submit()} />

      {result ? (
        <View style={{ gap: 12 }}>
          <Amount label={t('spendNow')} value={result.spendNow} color={colors.primary} />
          <Amount label={t('bills')} value={result.bills} color={colors.amber} />
          <Amount label={t('keep')} value={result.savings} color={colors.green} />
          <Card>
            <AppText variant="label" color={colors.muted}>{t('newBalance')}</AppText>
            <AppText variant="title">{rand(result.newBalance)}</AppText>
          </Card>
        </View>
      ) : null}

      <Card>
        <AppText>{t('splitRule')}</AppText>
        <AppText variant="small" color={colors.muted}>{t('smallNote')}</AppText>
      </Card>

      <AppText variant="label" bold>{t('recent')}</AppText>
      {recent.length === 0 ? <AppText color={colors.muted}>{t('noPayments')}</AppText> : recent.map((p) => (
        <View key={p.id} style={s.row}>
          <AppText>{shortDate(p.receivedOn)}</AppText>
          <AppText bold>{rand(p.amount)}</AppText>
        </View>
      ))}
    </Screen>
  );
}

const s = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { minHeight: 48, paddingHorizontal: 16, borderRadius: radius, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.white, justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
});
