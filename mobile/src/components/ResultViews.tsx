import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import * as Speech from 'expo-speech';
import AppText from './AppText';
import Banner from './Banner';
import Button from './Button';
import Card from './Card';
import { colors } from '../theme';
import { useSettings, useT } from '../context/SettingsContext';
import { VOICE } from '../i18n';
import { levelOf, rand } from '../utils/format';
import type { AiResult, OfferResult } from '../types';

const COLOR = { high: colors.red, medium: colors.amber, low: colors.green } as const;
const ICON = { high: 'alert-circle', medium: 'warning', low: 'checkmark-circle' } as const;

export function Verdict({ level, kind }: { level: 'low' | 'medium' | 'high'; kind: 'scam' | 'risk' }) {
  const t = useT();
  const text = kind === 'scam'
    ? t(level === 'high' ? 'verdictHigh' : level === 'low' ? 'verdictLow' : 'verdictMedium')
    : t(level === 'high' ? 'riskHigh' : level === 'low' ? 'riskLow' : 'riskMedium');
  return <Banner big color={COLOR[level]} icon={ICON[level]} text={text} />;
}

function List({ title, items }: { title: string; items?: string[] | null }) {
  if (!items || items.length === 0) return null;
  return (
    <Card>
      <AppText variant="label" bold>{title}</AppText>
      {items.map((x, i) => <AppText key={i}>{'\u2022 ' + x}</AppText>)}
    </Card>
  );
}

// Generic key/value view for fields whose exact shape is not fixed (quote, cost).
function flatten(v: unknown, prefix = ''): [string, string][] {
  if (v === null || v === undefined) return [];
  if (typeof v === 'object' && !Array.isArray(v)) {
    return Object.entries(v as Record<string, unknown>).flatMap(([k, x]) => flatten(x, prefix ? `${prefix} ${k}` : k));
  }
  if (Array.isArray(v)) return [[prefix, v.map(String).join(', ')]];
  return [[prefix, String(v)]];
}
const humanise = (k: string) => k.replace(/([A-Z])/g, ' $1').replace(/[_.]/g, ' ').trim().replace(/^./, (c) => c.toUpperCase());

function Detail({ value }: { value: unknown }) {
  const t = useT();
  const rows = flatten(value).filter(([, v]) => v !== '');
  if (rows.length === 0) return null;
  return (
    <Card>
      <AppText variant="label" bold>{t('moreDetail')}</AppText>
      {rows.map(([k, v], i) => <AppText key={i} variant="small">{`${humanise(k)}: ${v}`}</AppText>)}
    </Card>
  );
}

export function AiResultView({ r }: { r: AiResult }) {
  const t = useT();
  const { language } = useSettings();
  const [speaking, setSpeaking] = useState(false);
  const level = levelOf(r.scam_likelihood as string);
  const cost = r.total_cost;
  const hasCost = !!cost && cost.principal != null && cost.total_repayment != null;

  useEffect(() => () => { Speech.stop(); }, []);

  const speak = () => {
    if (speaking) { Speech.stop(); setSpeaking(false); return; }
    const text = [r.summary, ...(r.red_flags ?? []), ...(r.advice ?? [])].filter(Boolean).join('. ');
    if (!text) return;
    setSpeaking(true);
    Speech.speak(text, {
      language: VOICE[language] ?? 'en-ZA',
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  return (
    <View style={{ gap: 14 }}>
      <Verdict level={level} kind="scam" />
      {r.summary ? <Card><AppText>{r.summary}</AppText></Card> : null}
      {hasCost ? (
        <Card>
          <AppText variant="label" bold>{t('youBorrow', { a: rand(cost!.principal), b: rand(cost!.total_repayment) })}</AppText>
          {cost!.extra_cost != null ? <AppText bold color={colors.red}>{t('extraYouPay', { x: rand(cost!.extra_cost) })}</AppText> : null}
        </Card>
      ) : null}
      <List title={t('redFlags')} items={r.red_flags} />
      <List title={t('whatToDo')} items={r.advice} />
      <Button variant="secondary" icon={speaking ? 'stop-circle-outline' : 'volume-high-outline'} title={speaking ? t('stopReading') : t('readAloud')} onPress={speak} />
      <AppText variant="small" color={colors.muted}>{t('aiLabel')}</AppText>
    </View>
  );
}

export function OfferResultView({ r }: { r: OfferResult }) {
  const t = useT();
  const { language } = useSettings();
  const level = levelOf(r.risk);
  return (
    <View style={{ gap: 14 }}>
      <Verdict level={level} kind="risk" />
      <List title={t('redFlags')} items={r.flags} />
      {/* Backend rule messages are English only, so hide them in other languages. */}
      {language === 'en' && r.explanation ? <Card><AppText>{r.explanation}</AppText></Card> : null}
      <Detail value={r.cost} />
      <Detail value={r.quote} />
      <AppText variant="small" color={colors.muted}>{t('rulesLabel')}</AppText>
    </View>
  );
}
