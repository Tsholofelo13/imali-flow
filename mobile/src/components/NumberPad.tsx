import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { colors, radius } from '../theme';

const ROWS = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['.', '0', 'del']];

// Works out the new text after a key press. Max 2 decimals and 8 digits.
export function applyKey(current: string, key: string): string {
  if (key === 'del') return current.slice(0, -1);
  if (key === '.') {
    if (current.includes('.')) return current;
    return current === '' ? '0.' : current + '.';
  }
  if (current.includes('.') && current.split('.')[1].length >= 2) return current;
  if (current === '0') return key;
  if (current.replace('.', '').length >= 8) return current;
  return current + key;
}

export default function NumberPad({ onKey }: { onKey: (k: string) => void }) {
  return (
    <View style={{ gap: 10 }}>
      {ROWS.map((row, i) => (
        <View key={i} style={s.row}>
          {row.map((k) => (
            <Pressable
              key={k}
              accessibilityRole="button"
              accessibilityLabel={k === 'del' ? 'Delete' : k === '.' ? 'Decimal point' : k}
              onPress={() => onKey(k)}
              style={({ pressed }) => [s.key, pressed && { transform: [{ scale: 0.93 }], backgroundColor: '#DDEFE5' }]}
            >
              {k === 'del' ? <Ionicons name="backspace-outline" size={28} color={colors.text} /> : <AppText variant="title">{k}</AppText>}
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  key: {
    flex: 1, height: 64, borderRadius: radius, backgroundColor: colors.white,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
});
