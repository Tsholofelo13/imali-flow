import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AppText from '../components/AppText';
import Banner from '../components/Banner';
import Button from '../components/Button';
import Card from '../components/Card';
import Screen from '../components/Screen';
import { useSettings, useT } from '../context/SettingsContext';
import { getForecast } from '../api/services';
import { errorText } from '../utils/errors';
import { rand, shortDate } from '../utils/format';
import { colors } from '../theme';
import type { Key } from '../i18n';
import type { Forecast } from '../types';

export default function DaysLeftScreen() {
  const t = useT();
  const { language } = useSettings();
  const [f, setF] = useState<Forecast | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setF(await getForecast()); } catch (e) { setError(errorText(e, t)); } finally { setLoading(false); }
  }, [t]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const short = !!f && f.projectedShortfall != null; // null shortfall = green
  const color = short ? colors.red : colors.green;
  const conf = f ? (`conf${String(f.confidence).toUpperCase()}` as Key) : null;

  return (
    <Screen refreshing={loading} onRefresh={() => void load()}>
      <AppText variant="title">{t('daysLeftTitle')}</AppText>
      {error ? <Banner color={colors.red} icon="alert-circle" text={error} /> : null}
      {error ? <Button variant="secondary" title={t('retry')} onPress={() => void load()} /> : null}
      {!f && !error ? <AppText color={colors.muted}>{t('loading')}</AppText> : null}

      {f ? (
        <>
          <Card style={{ borderColor: color, borderWidth: 3, alignItems: 'center' }}>
            <AppText variant="big" color={color} style={{ fontSize: 72 }}>{f.daysCovered}</AppText>
            <AppText variant="title" color={color}>{t('daysUnit')}</AppText>
          </Card>

          <Banner
            color={color}
            icon={short ? 'warning' : 'checkmark-circle'}
            text={short ? t('shortfallSentence', { n: f.daysUntilShortfall ?? '?' }) : t('allGood')}
          />

          {/* Backend message is English only. Other languages get sentences built from the numbers. */}
          {language === 'en' && f.message ? <Card><AppText>{f.message}</AppText></Card> : (
            <Card><AppText>{t('daysSentence', { n: f.daysCovered })}</AppText></Card>
          )}

          <Card>
            <AppText>{t('coveredUntil', { date: shortDate(f.coveredUntil) })}</AppText>
            {f.expectedNextIncome ? (
              <AppText>{t('nextIncome', { date: shortDate(f.expectedNextIncome), amount: f.expectedNextAmount != null ? rand(f.expectedNextAmount) : '' })}</AppText>
            ) : null}
          </Card>

          {conf ? (
            <>
              <AppText variant="small" color={colors.muted}>{t('confidence', { level: t(conf) })}</AppText>
              <AppText variant="small" color={colors.muted}>{t('confHint')}</AppText>
            </>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}
