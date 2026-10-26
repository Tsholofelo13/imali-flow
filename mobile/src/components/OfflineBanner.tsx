import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { subscribeOffline } from '../api/status';
import { useT } from '../context/SettingsContext';
import Banner from './Banner';
import { colors } from '../theme';

// Shown when a request fails for network reasons. Goes away after the next success.
export default function OfflineBanner() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const [off, setOff] = useState(false);
  useEffect(() => subscribeOffline(setOff), []);
  if (!off) return null;
  return (
    <View style={[s.wrap, { top: insets.top + 8 }]} pointerEvents="none">
      <Banner color={colors.muted} icon="cloud-offline-outline" text={t('offlineBanner')} />
    </View>
  );
}

const s = StyleSheet.create({ wrap: { position: 'absolute', left: 12, right: 12 } });
