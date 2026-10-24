import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { colors, radius } from '../theme';

type Props = { color: string; icon: keyof typeof Ionicons.glyphMap; text: string; big?: boolean };

// Always icon + words, never colour alone.
export default function Banner({ color, icon, text, big }: Props) {
  return (
    <View style={[s.box, { backgroundColor: color }]} accessibilityRole="alert">
      <Ionicons name={icon} size={big ? 34 : 24} color={colors.white} />
      <AppText variant={big ? 'title' : 'label'} bold color={colors.white} style={{ flex: 1 }}>{text}</AppText>
    </View>
  );
}

const s = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: radius },
});
