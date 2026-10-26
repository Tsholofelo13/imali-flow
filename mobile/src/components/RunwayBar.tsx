import React from 'react';
import { View } from 'react-native';
import AppText from './AppText';
import ProgressBar from './ProgressBar';
import { useT } from '../context/SettingsContext';
import { colors } from '../theme';

type Props = { daysCovered: number; daysToNext: number | null; color: string };

// Shows how far the money goes compared with when the next money is expected.
export default function RunwayBar({ daysCovered, daysToNext, color }: Props) {
  const t = useT();
  const total = Math.max(daysCovered, daysToNext ?? 0, 1);
  const markerLeft = daysToNext != null ? Math.min(100, (daysToNext / total) * 100) : null;
  return (
    <View style={{ gap: 6 }}>
      <View>
        <ProgressBar progress={daysCovered / total} color={color} height={18} />
        {markerLeft != null ? (
          <View style={{ position: 'absolute', top: -4, bottom: -4, left: `${markerLeft}%`, width: 3, backgroundColor: colors.text }} />
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <AppText variant="small" color={colors.muted}>{t('todayLabel')}</AppText>
        {daysToNext != null ? <AppText variant="small" color={colors.muted}>{`${t('nextMoneyLabel')}: ${daysToNext} ${t('daysUnit')}`}</AppText> : null}
      </View>
    </View>
  );
}
