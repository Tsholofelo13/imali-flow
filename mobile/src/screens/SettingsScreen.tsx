import React, { useState } from 'react';
import { Alert, Switch, View } from 'react-native';
import AppText from '../components/AppText';
import Banner from '../components/Banner';
import Button from '../components/Button';
import Card from '../components/Card';
import Field from '../components/Field';
import LanguageList from '../components/LanguageList';
import Screen from '../components/Screen';
import { useAuth } from '../context/AuthContext';
import { useSettings, useT } from '../context/SettingsContext';
import { deleteAccount, updateProfile } from '../api/services';
import { errorText } from '../utils/errors';
import { colors } from '../theme';

export default function SettingsScreen() {
  const t = useT();
  const { profile, signOut, setProfile } = useAuth();
  const { language, setLanguage, largeText, setLargeText } = useSettings();
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pickLanguage = async (code: string) => {
    await setLanguage(code);
    try { setProfile(await updateProfile({ language: code })); } catch { /* saved on the phone; profile syncs next time */ }
  };

  const confirmDelete = () => {
    if (!password) return;
    Alert.alert(t('areYouSure'), t('deleteWarn'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('deleteConfirmBtn'), style: 'destructive',
        onPress: async () => {
          setBusy(true); setError('');
          try { await deleteAccount(password); await signOut(); } // 403 = wrong password
          catch (e) { setError(errorText(e, t)); } finally { setBusy(false); }
        },
      },
    ]);
  };

  return (
    <Screen>
      <AppText variant="title">{t('settingsTitle')}</AppText>
      {profile ? <AppText color={colors.muted}>{profile.displayName ? `${profile.displayName} - ` : ''}{profile.email}</AppText> : null}

      <AppText variant="label" bold>{t('language')}</AppText>
      <LanguageList selected={language} onSelect={(c) => void pickLanguage(c)} />

      <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText variant="label" bold>{t('largeText')}</AppText>
        <Switch value={largeText} onValueChange={(v) => void setLargeText(v)} trackColor={{ true: colors.primary }} />
      </Card>

      <Button variant="secondary" icon="log-out-outline" title={t('logOut')} onPress={() => void signOut()} />

      <Card style={{ borderColor: colors.red }}>
        <AppText variant="label" bold color={colors.red}>{t('deleteTitle')}</AppText>
        <AppText variant="small">{t('deleteWarn')}</AppText>
        <Field label={t('password')} value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
        {error ? <Banner color={colors.red} icon="alert-circle" text={error} /> : null}
        <View style={{ height: 4 }} />
        <Button variant="danger" icon="trash-outline" title={t('deleteConfirmBtn')} loading={busy} disabled={!password} onPress={confirmDelete} />
      </Card>
    </Screen>
  );
}
