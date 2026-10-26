import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../components/AppText';
import Button from '../components/Button';
import Card from '../components/Card';
import Expandable from '../components/Expandable';
import FadeIn from '../components/FadeIn';
import Screen from '../components/Screen';
import { useT } from '../context/SettingsContext';
import { CREDIT_TIPS, INVESTMENT_SCAMS, QUIZ } from '../content/learn';
import { animateNext } from '../utils/anim';
import { colors, radius } from '../theme';

function BudgetVsSaving() {
  const t = useT();
  const [pick, setPick] = useState<'budget' | 'save' | null>(null);
  const choose = (p: 'budget' | 'save') => { animateNext(); setPick(pick === p ? null : p); };
  const Box = ({ id, icon, title }: { id: 'budget' | 'save'; icon: keyof typeof Ionicons.glyphMap; title: string }) => {
    const on = pick === id;
    return (
      <Pressable accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => choose(id)}
        style={[s.half, on && { borderColor: colors.primary, backgroundColor: '#E6F4EC' }]}>
        <Ionicons name={icon} size={36} color={colors.primary} />
        <AppText variant="label" bold>{title}</AppText>
      </Pressable>
    );
  };
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Box id="budget" icon="list-outline" title={t('budgeting')} />
        <Box id="save" icon="wallet-outline" title={t('saving')} />
      </View>
      {pick ? (
        <Card>
          <AppText variant="label" bold>{pick === 'budget' ? t('budgetingText') : t('savingText')}</AppText>
          <AppText>{pick === 'budget' ? t('budgetingEx') : t('savingEx')}</AppText>
        </Card>
      ) : null}
    </View>
  );
}

function ScamQuiz() {
  const t = useT();
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null); // true = user said "fake"
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = QUIZ[i];
  const right = picked !== null && picked === q.fake;

  const answer = (saysFake: boolean) => {
    if (picked !== null) return;
    animateNext();
    setPicked(saysFake);
    if (saysFake === q.fake) setScore(score + 1);
  };
  const next = () => {
    animateNext();
    if (i + 1 >= QUIZ.length) setDone(true); else { setI(i + 1); setPicked(null); }
  };
  const restart = () => { animateNext(); setI(0); setPicked(null); setScore(0); setDone(false); };

  if (done) {
    return (
      <Card style={{ alignItems: 'center' }}>
        <Ionicons name="trophy-outline" size={48} color={colors.amber} />
        <AppText variant="title">{t('quizDone', { s: score, n: QUIZ.length })}</AppText>
        <Button title={t('playAgain')} icon="refresh" onPress={restart} />
      </Card>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      <AppText variant="small" color={colors.muted}>{`${i + 1} / ${QUIZ.length}`}</AppText>
      <FadeIn key={i}>
        <Card style={{ backgroundColor: '#F1F1F1' }}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.muted} />
            <AppText variant="small" color={colors.muted}>SMS</AppText>
          </View>
          <AppText>{q.sms}</AppText>
        </Card>
      </FadeIn>
      {picked === null ? (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}><Button title={t('real')} icon="checkmark-circle-outline" onPress={() => answer(false)} /></View>
          <View style={{ flex: 1 }}><Button variant="danger" title={t('fake')} icon="close-circle-outline" onPress={() => answer(true)} /></View>
        </View>
      ) : (
        <FadeIn>
          <Card style={{ borderColor: right ? colors.green : colors.red, borderWidth: 2 }}>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <Ionicons name={right ? 'checkmark-circle' : 'close-circle'} size={28} color={right ? colors.green : colors.red} />
              <AppText variant="label" bold color={right ? colors.green : colors.red}>{right ? t('correct') : t('wrong')}</AppText>
            </View>
            <AppText>{q.why}</AppText>
            {q.signs.length > 0 ? <AppText variant="label" bold>{t('signs')}</AppText> : null}
            {q.signs.map((x, k) => <AppText key={k}>{'\u2022 ' + x}</AppText>)}
          </Card>
          <View style={{ height: 12 }} />
          <Button title={i + 1 >= QUIZ.length ? t('seeScore') : t('nextMsg')} icon="arrow-forward" onPress={next} />
        </FadeIn>
      )}
    </View>
  );
}

export default function LearnScreen() {
  const t = useT();
  const nav = useNavigation<any>();
  return (
    <Screen>
      <AppText variant="title">{t('learnTitle')}</AppText>

      <AppText variant="label" bold>{t('budgetVsSaving')}</AppText>
      <BudgetVsSaving />

      <AppText variant="label" bold>{t('quizTitle')}</AppText>
      <ScamQuiz />

      <AppText variant="label" bold>{t('fakeInvTitle')}</AppText>
      {INVESTMENT_SCAMS.map((x) => (
        <Expandable key={x.title} title={x.title} color={colors.red}>
          {x.signs.map((g, k) => <AppText key={k}>{'\u2022 ' + g}</AppText>)}
        </Expandable>
      ))}
      <AppText variant="small" color={colors.muted}>{t('fakeInvLine')}</AppText>

      <AppText variant="label" bold>{t('creditTitle')}</AppText>
      {CREDIT_TIPS.map((x) => (
        <Expandable key={x.title} title={x.title}>
          {x.signs.map((g, k) => <AppText key={k}>{'\u2022 ' + g}</AppText>)}
        </Expandable>
      ))}
      <Card style={{ backgroundColor: '#FFF6E5', borderColor: colors.amber }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Ionicons name="warning" size={24} color={colors.amber} />
          <AppText bold style={{ flex: 1 }}>{t('debtWarn')}</AppText>
        </View>
      </Card>
      <Button variant="secondary" icon="calculator-outline" title={t('openLoan')} onPress={() => nav.navigate('Loan')} />
    </Screen>
  );
}

const s = StyleSheet.create({
  half: {
    flex: 1, minHeight: 110, borderRadius: radius, borderWidth: 2, borderColor: colors.border,
    backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12,
  },
});
