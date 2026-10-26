import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AnimatedNumber from '../components/AnimatedNumber';
import AppText from '../components/AppText';
import Banner from '../components/Banner';
import Button from '../components/Button';
import Card from '../components/Card';
import FadeIn from '../components/FadeIn';
import ProgressBar from '../components/ProgressBar';
import Screen from '../components/Screen';
import Tile from '../components/Tile';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/SettingsContext';
import { getForecast, listIncome } from '../api/services';
import { TIPS } from '../content/learn';
import { errorText } from '../utils/errors';
import { daysUntil, rand, shortDate } from '../utils/format';
import { colors } from '../theme';
import type { Forecast, IncomeResult } from '../types';

function Pot({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[s.pot, { borderColor: color }]}>
      <AppText variant="small" color={colors.muted}>{label}</AppText>
      <AnimatedNumber variant="label" bold color={color} value={value} format={(n) => rand(Math.round(n))} />
    </View>
  );
}

export default function HomeScreen() {
  const t = useT();
  const nav = useNavigation<any>();
  const { profile } = useAuth();
  const [f, setF] = useState<Forecast | null>(null);
  const [pay, setPay] = useState<IncomeResult[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tip, setTip] = useState(0);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const [fr, pr] = await Promise.allSettled([getForecast(), listIncome()]);
    if (fr.status === 'fulfilled') setF(fr.value); else setError(errorText(fr.reason, t));
    if (pr.status === 'fulfilled') setPay(pr.value);
    setLoading(false);
  }, [t]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const last = pay[0];
  const kept = pay.reduce((sum, p) => sum + (p.savings || 0), 0);
  const short = !!f && f.projectedShortfall != null;
  const color = short ? colors.red : colors.green;
  const daysNext = daysUntil(f?.expectedNextIncome);
  const progress = f ? (daysNext ? Math.min(1, f.daysCovered / daysNext) : 1) : 0;
  const name = profile?.displayName;

  return (
    <Screen refreshing={loading} onRefresh={() => void load()}>
      <AppText variant="title">{name ? t('hello', { name }) : t('helloNoName')}</AppText>

      {error ? <Banner color={colors.red} icon="alert-circle" text={error} /> : null}
      {error ? <Button variant="secondary" title={t('retry')} onPress={() => void load()} /> : null}

      {f ? (
        <FadeIn>
          <Pressable accessibilityRole="button" onPress={() => nav.navigate('Runway')}>
            <Card style={{ borderColor: color, borderWidth: 3, gap: 10 }}>
              <AppText variant="label" color={colors.muted}>{t('homeLasts')}</AppText>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                <AnimatedNumber variant="big" color={color} style={{ fontSize: 64 }} value={f.daysCovered} />
                <AppText variant="title" color={color}>{t('daysUnit')}</AppText>
              </View>
              <ProgressBar progress={progress} color={color} height={16} />
              <AppText>
                {daysNext ? t('lastsVsNext', { n: f.daysCovered, m: daysNext }) : t('daysSentence', { n: f.daysCovered })}
              </AppText>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name={short ? 'warning' : 'checkmark-circle'} size={22} color={color} />
                <AppText bold color={color} style={{ flex: 1 }}>
                  {short ? t('shortfallSentence', { n: f.daysUntilShortfall ?? '?' }) : t('allGood')}
                </AppText>
                <Ionicons name="chevron-forward" size={22} color={colors.muted} />
              </View>
            </Card>
          </Pressable>
        </FadeIn>
      ) : null}

      <Button title={t('moneyCameIn')} icon="add-circle-outline" onPress={() => nav.navigate('MoneyIn')} />

      <AppText variant="label" bold>{t('quickActions')}</AppText>
      <View style={s.grid}>
        <Tile icon="shield-checkmark-outline" title={t('actCheck')} onPress={() => nav.navigate('Check')} color={colors.amber} />
        <Tile icon="calculator-outline" title={t('tabLoan')} onPress={() => nav.navigate('Loan')} />
        <Tile icon="school-outline" title={t('tabLearn')} onPress={() => nav.navigate('Learn')} color={colors.green} />
        <Tile icon="calendar-outline" title={t('tabDays')} onPress={() => nav.navigate('Runway')} color={colors.red} />
      </View>

      <AppText variant="label" bold>{last ? t('lastPlan', { date: shortDate(last.receivedOn) }) : t('recent')}</AppText>
      {last ? (
        <FadeIn>
          <View style={s.pots}>
            <Pot label={t('spendNow')} value={last.spendNow} color={colors.primary} />
            <Pot label={t('bills')} value={last.bills} color={colors.amber} />
            <Pot label={t('keep')} value={last.savings} color={colors.green} />
          </View>
        </FadeIn>
      ) : <AppText color={colors.muted}>{t('noPayments')}</AppText>}

      {pay.length > 0 ? (
        <Card>
          <AppText variant="label" color={colors.muted}>{t('keptSoFar')}</AppText>
          <AnimatedNumber variant="title" color={colors.green} value={kept} format={(n) => rand(Math.round(n))} />
        </Card>
      ) : null}

      <Pressable accessibilityRole="button" accessibilityLabel={t('tapForMore')} onPress={() => setTip((tip + 1) % TIPS.length)}>
        <FadeIn key={tip}>
          <Card style={{ backgroundColor: '#FFF6E5', borderColor: colors.amber }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="bulb-outline" size={24} color={colors.amber} />
              <AppText variant="label" bold>{t('tipTitle')}</AppText>
            </View>
            <AppText>{TIPS[tip]}</AppText>
            <AppText variant="small" color={colors.muted}>{t('tapForMore')}</AppText>
          </Card>
        </FadeIn>
      </Pressable>
    </Screen>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  pots: { flexDirection: 'row', gap: 10 },
  pot: { flex: 1, borderWidth: 2, borderRadius: 16, padding: 12, backgroundColor: colors.white, gap: 4 },
});
