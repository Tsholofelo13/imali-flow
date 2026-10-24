import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors, radius } from '../theme';

export default function Card({ style, ...rest }: ViewProps) {
  return <View {...rest} style={[s.card, style]} />;
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.card, borderRadius: radius, padding: 16, gap: 8,
    borderWidth: 1, borderColor: colors.border,
  },
});
