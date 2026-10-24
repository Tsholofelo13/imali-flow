import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { subscribeSlow } from '../api/status';
import { useT } from '../context/SettingsContext';
import Banner from './Banner';
import { colors } from '../theme';

// Shows "waking up" (not an error) while the free-hosted server starts.
export default function WakingBanner() {
  const t = useT();
  const [slow, setSlow] = useState(false);
  useEffect(() => subscribeSlow(setSlow), []);
  if (!slow) return null;
  return (
    <View style={s.wrap} pointerEvents="none">
      <Banner color={colors.amber} icon="time-outline" text={t('wakingUp')} />
    </View>
  );
}

const s = StyleSheet.create({ wrap: { position: 'absolute', left: 12, right: 12, bottom: 90 } });
