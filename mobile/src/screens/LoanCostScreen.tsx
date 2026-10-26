import React, { useState } from 'react';
import AppText from '../components/AppText';
import Banner from '../components/Banner';
import Button from '../components/Button';
import Card from '../components/Card';
import Field from '../components/Field';
import Screen from '../components/Screen';
import { OfferResultView } from '../components/ResultViews';
import { useT } from '../context/SettingsContext';
import { analyseOffer } from '../api/services';
import { errorText } from '../utils/errors';
import { rand, toNum } from '../utils/format';
import { colors } from '../theme';
import type { OfferResult } from '../types';

export default function LoanCostScreen() {
  const t = useT();
  const [principal, setPrincipal] = useState('');
  const [total, setTotal] = useState('');
  const [days, setDays] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<OfferResult | null>(null);
  const [calc, setCalc] = useState<{ p: number; r: number; extra: number; per30: number } | null>(null);

  const submit = async () => {
    const p = toNum(principal), r = toNum(total), d = Math.round(toNum(days));
    if ([p, r, d].some((x) => Number.isNaN(x) || x <= 0)) { setError(t('errNumbers')); return; }
    if (r < p) { setError(t('errTotalLess')); return; }
    setBusy(true); setError(''); setResult(null);
    const extra = r - p;
    // Worked out here too, so the plain sentence works in every language.
    const per30 = Math.round(((extra / p) * (30 / d) * 100) * 10) / 10;
    try {
      // The backend takes text plus all three numbers. A short summary sentence is sent as the text.
      const res = await analyseOffer(`Borrow R${p}, pay back R${r} in ${d} days`, { principal: p, totalRepayable: r, termDays: d });
      setResult(res); setCalc({ p, r, extra, per30 });
    } catch (e) { setError(errorText(e, t)); } finally { setBusy(false); }
  };

  return (
    <Screen back>
      <AppText variant="title">{t('loanTitle')}</AppText>
      <Field label={t('amountBorrowed')} value={principal} onChangeText={setPrincipal} keyboardType="decimal-pad" placeholder="1000" />
      <Field label={t('totalToRepay')} value={total} onChangeText={setTotal} keyboardType="decimal-pad" placeholder="1600" />
      <Field label={t('daysToRepay')} value={days} onChangeText={setDays} keyboardType="number-pad" placeholder="30" />
      {error ? <Banner color={colors.red} icon="alert-circle" text={error} /> : null}
      <Button title={t('checkLoan')} icon="calculator-outline" loading={busy} onPress={() => void submit()} />

      {result && calc ? (
        <>
          <Card>
            <AppText variant="label" bold>{t('youBorrow', { a: rand(calc.p), b: rand(calc.r) })}</AppText>
            <AppText bold color={colors.red}>{t('extraYouPay', { x: rand(calc.extra) })}</AppText>
            <AppText>{t('percentPer30', { p: calc.per30 })}</AppText>
          </Card>
          <OfferResultView r={result} />
        </>
      ) : null}
    </Screen>
  );
}
