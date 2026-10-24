import React, { useState } from 'react';
import AppText from '../components/AppText';
import Button from '../components/Button';
import LanguageList from '../components/LanguageList';
import Screen from '../components/Screen';
import { useSettings, useT } from '../context/SettingsContext';

// First screen, shown once before login. Language is saved to the profile after sign-in.
export default function LanguageScreen() {
  const t = useT();
  const { language, setLanguage } = useSettings();
  const [pick, setPick] = useState(language);
  return (
    <Screen>
      <AppText variant="title">Sawubona / Dumela / Hello</AppText>
      <AppText variant="label">{t('chooseLanguage')}</AppText>
      <LanguageList selected={pick} onSelect={(c) => setPick(c)} />
      <AppText variant="small">{t('changeLater')}</AppText>
      <Button title={t('continue')} icon="arrow-forward" onPress={() => void setLanguage(pick)} />
    </Screen>
  );
}
