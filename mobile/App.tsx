import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider, useSettings, useT } from './src/context/SettingsContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import LanguageScreen from './src/screens/LanguageScreen';
import AuthScreen from './src/screens/AuthScreen';
import SetupScreen from './src/screens/SetupScreen';
import WakingBanner from './src/components/WakingBanner';
import Button from './src/components/Button';
import AppText from './src/components/AppText';
import { wakeServer } from './src/api/services';
import { colors } from './src/theme';
import type { Profile } from './src/types';

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

  if (!ready || !settingsReady) return <Splash />;
  if (!languageChosen) return <LanguageScreen />;
  if (!token) return <AuthScreen />;
  if (!profile) return <Splash retry={profileError ? () => void loadProfile() : undefined} />;
  if (needsSetup(profile)) return <SetupScreen />;
  return (
    <NavigationContainer>
      <AppNavigator />
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
          </View>
          <StatusBar style="dark" />
        </AuthProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
