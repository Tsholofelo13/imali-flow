import React from 'react';
import { View } from 'react-native';
import { colors } from '../theme';

export type Part = { value: number; color: string; label: string };

// One bar showing how a payment was split.
export default function SplitBar({ parts }: { parts: Part[] }) {
  return (
    <View
      accessibilityLabel={parts.map((p) => `${p.label} ${Math.round(p.value)}`).join(', ')}
      style={{ flexDirection: 'row', height: 18, borderRadius: 9, overflow: 'hidden', backgroundColor: colors.border }}
    >
      {parts.map((p) => <View key={p.label} style={{ flex: Math.max(p.value, 0), backgroundColor: p.color }} />)}
    </View>
  );
}
