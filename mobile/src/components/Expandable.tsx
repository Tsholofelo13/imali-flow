import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { animateNext } from '../utils/anim';
import { colors, radius } from '../theme';

type Props = { title: string; color?: string; children: React.ReactNode };

// Tap to open and close.
export default function Expandable({ title, color = colors.primary, children }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <View style={[s.box, { borderColor: open ? color : colors.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => { animateNext(); setOpen(!open); }}
        style={s.head}
      >
        <AppText variant="label" bold style={{ flex: 1 }}>{title}</AppText>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={24} color={color} />
      </Pressable>
      {open ? <View style={{ gap: 6, paddingTop: 8 }}>{children}</View> : null}
    </View>
  );
}

const s = StyleSheet.create({
  box: { backgroundColor: colors.white, borderRadius: radius, borderWidth: 2, padding: 16 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 32 },
});
