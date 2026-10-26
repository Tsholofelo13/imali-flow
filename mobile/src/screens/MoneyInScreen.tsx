import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AnimatedNumber from '../components/AnimatedNumber';
import AppText from '../components/AppText';
import Banner from '../components/Banner';
import Button from '../components/Button';
import Card from '../components/Card';
import FadeIn from '../components/FadeIn';
import NumberPad, { applyKey } from '../components/NumberPad';
import Screen from '../components/Screen';
import SplitBar from '../components/SplitBar';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/SettingsContext';
import { getProfile, logIncome } from '../api/services';
import { animateNext } from '../utils/anim';
import { errorText } from '../utils/errors';
import { groupDigits, rand, toNum } from '../utils/format';
import { colors, radius } from '../theme';
import type { Key } from '../i18n';
import type { IncomeResult } from '../types';

const SOURCES: { key: Key; value: string }[] = [
  { key: 'srcStall', value: 'Stall sales' },
  { key: 'srcEwallet', value: 'eWallet' },
  { key: 'srcWages', value: 'Wages' },
  { key: 'srcOther', value: 'Other' },
];

type PotKey = 'spend' | 'bills' | 'keep';

// The split is worked out by the backend, so the three pots are read-only. Tap one to see why.
function Pot({ label, value, color, why, open, onPress }: {
  label: string; value: number; color: string; why: string; open: boolean; onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={onPress}>
      <Card style={{ borderColor: color, borderWidth: 2 }}>
        <AppText variant="label" color={colors.muted}>{label}</AppText>
        <AnimatedNumber variant="big" color={color} value={value} format={(n) => rand(Math.round(n * 100) / 100)} />
        {open ? <AppText>{why}</AppText> : null}
      </Card>
    </Pressable>
  );
}

export default function MoneyInScreen() {
  const t = useT();
  const nav = useNavigation<any>();
  const { setProfile } = useAuth();
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState(SOURCES[0].value);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<IncomeResult | null>(null);
  const [open, setOpen] = useState<PotKey | null>(null);

  const n = toNum(amount);
  const valid = !Number.isNaN(n) && n >= 1;

  const submit = async () => {
    if (!valid) { setError(t('errAmount')); return; }
    setBusy(true); setError('');
    try {
      const r = await logIncome(n, source);
      animateNext();
      setResult(r);
      try { setProfile(await getProfile()); } catch { /* balance refresh is optional */ }
    } catch (e) { setError(errorText(e, t)); } finally { setBusy(false); }
  };

  const toggle = (k: PotKey) => { animateNext(); setOpen(open === k ? null : k); };
  const again = () => { animateNext(); setResult(null); setAmount(''); setOpen(null); };

  if (result) {
    return (
      <Screen back>
        <AppText variant="title">{t('planFor', { amount: rand(result.amount) })}</AppText>
        <FadeIn>
          <SplitBar parts={[
            { value: result.spendNow, color: colors.primary, label: t('spendNow') },
            { value: result.bills, color: colors.amber, label: t('bills') },
            { value: result.savings, color: colors.green, label: t('keep') },
          ]} />
        </FadeIn>
        <AppText variant="small" color={colors.muted}>{t('tapWhy')}</AppText>
        <FadeIn delay={100}><Pot label={t('spendNow')} value={result.spendNow} color={colors.primary} why={t('whySpend')} open={open === 'spend'} onPress={() => toggle('spend')} /></FadeIn>
        <FadeIn delay={200}><Pot label={t('bills')} value={result.bills} color={colors.amber} why={t('whyBills')} open={open === 'bills'} onPress={() => toggle('bills')} /></FadeIn>
        <FadeIn delay={300}><Pot label={t('keep')} value={result.savings} color={colors.green} why={t('whyKeep')} open={open === 'keep'} onPress={() => toggle('keep')} /></FadeIn>
        <Card>
          <AppText variant="label" color={colors.muted}>{t('newBalance')}</AppText>
          <AnimatedNumber variant="title" value={result.newBalance} format={(x) => rand(Math.round(x * 100) / 100)} />
        </Card>
        <Button title={t('done')} icon="checkmark" onPress={() => nav.goBack()} />
        <Button variant="secondary" title={t('addAnother')} icon="add" onPress={again} />
      </Screen>
    );
  }

  return (
    <Screen back>
      <AppText variant="title">{t('moneyCameIn')}</AppText>
      <Card style={{ alignItems: 'center' }}>
        <AppText variant="small" color={colors.muted}>{t('howMuch')}</AppText>
        <AppText variant="big" color={amount ? colors.text : colors.border} style={{ fontSize: 52 }}>
          {`R ${amount ? groupDigits(amount) : '0'}`}
        </AppText>
      </Card>
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
      <NumberPad onKey={(k) => setAmount(applyKey(amount, k))} />
      {error ? <Banner color={colors.red} icon="alert-circle" text={error} /> : null}
      <Button title={t('splitIt')} icon="git-branch-outline" loading={busy} disabled={!valid} onPress={() => void submit()} />
    </Screen>
  );
}

const s = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { minHeight: 48, paddingHorizontal: 16, borderRadius: radius, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.white, justifyContent: 'center' },
});
