import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { colors, radius } from '../theme';

type Props = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
};

export default function Button({ title, onPress, variant = 'primary', icon, loading, disabled }: Props) {
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.red : colors.white;
  const fg = variant === 'secondary' ? colors.primary : colors.white;
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={off}
      onPress={onPress}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: bg, opacity: off ? 0.55 : pressed ? 0.85 : 1 },
        variant === 'secondary' && { borderWidth: 2, borderColor: colors.primary },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={s.row}>
          {icon ? <Ionicons name={icon} size={22} color={fg} /> : null}
          <AppText variant="label" bold color={fg}>{title}</AppText>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: { minHeight: 56, borderRadius: radius, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
