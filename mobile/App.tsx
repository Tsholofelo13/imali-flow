import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider, useSettings, useT } from './src/context/SettingsContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import LanguageScreen from './src/screens/LanguageScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import AuthScreen from './src/screens/AuthScreen';
import SetupScreen from './src/screens/SetupScreen';
import WakingBanner from './src/components/WakingBanner';
import OfflineBanner from './src/components/OfflineBanner';
import Button from './src/components/Button';
import AppText from './src/components/AppText';
import { wakeServer } from './src/api/services';
import { colors } from './src/theme';
import type { Profile } from './src/types';

const WELCOMED_KEY = 'imali_welcomed';
const needsSetup = (p: Profile) => p.dailySpend == null || p.dailySpend <= 0 || p.currentBalance == null;

function Splash({ retry }: { retry?: () => void }) {
  const t = useT();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
      {retry ? (
        <>
          <AppText>{t('errNetwork')}</AppText>
          <Button title={t('retry')} onPress={retry} />
        </>
      ) : <ActivityIndicator size="large" color={colors.primary} />}
    </View>
  );
}

function Root() {
  const { ready, token, profile, profileError, loadProfile } = useAuth();
  const { ready: settingsReady, languageChosen } = useSettings();
  const [welcomed, setWelcomed] = useState<boolean | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync(WELCOMED_KEY).then((v) => setWelcomed(v === '1')).catch(() => setWelcomed(true));
  }, []);
  const finishWelcome = () => {
    setWelcomed(true);
    SecureStore.setItemAsync(WELCOMED_KEY, '1').catch(() => undefined);
  };

  if (!ready || !settingsReady || welcomed === null) return <Splash />;
  if (!languageChosen) return <LanguageScreen />;
  if (!welcomed && !token) return <WelcomeScreen onDone={finishWelcome} />;
  if (!token) return <AuthScreen />;
  if (!profile) return <Splash retry={profileError ? () => void loadProfile() : undefined} />;
  if (needsSetup(profile)) return <SetupScreen />;
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  // Wake the free-hosted server as early as possible.
  useEffect(() => { void wakeServer(); }, []);
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <AuthProvider>
          <View style={{ flex: 1 }}>
            <Root />
            <WakingBanner />
            <OfflineBanner />
          </View>
          <StatusBar style="dark" />
        </AuthProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
