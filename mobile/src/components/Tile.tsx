import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { colors, radius } from '../theme';

type Props = { icon: keyof typeof Ionicons.glyphMap; title: string; onPress: () => void; color?: string };

// Big tappable tile for quick actions. Shrinks a little when pressed.
export default function Tile({ icon, title, onPress, color = colors.primary }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [s.tile, pressed && { transform: [{ scale: 0.96 }], opacity: 0.9 }]}
    >
      <Ionicons name={icon} size={34} color={color} />
      <AppText variant="label" bold style={{ textAlign: 'center' }}>{title}</AppText>
    </Pressable>
  );
}

const s = StyleSheet.create({
  tile: {
    width: '48%', minHeight: 110, borderRadius: radius, backgroundColor: colors.white, borderWidth: 1,
    borderColor: colors.border, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12,
  },
});
