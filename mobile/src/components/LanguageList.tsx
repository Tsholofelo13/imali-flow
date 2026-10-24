import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppText from './AppText';
import { LANGUAGES } from '../i18n';
import { colors, radius } from '../theme';

type Props = { selected: string; onSelect: (code: string) => void };

export default function LanguageList({ selected, onSelect }: Props) {
  return (
    <View style={{ gap: 10 }}>
      {LANGUAGES.map((l) => {
        const on = l.code === selected;
        return (
          <Pressable
            key={l.code}
            accessibilityRole="button"
            accessibilityLabel={l.name}
            accessibilityState={{ selected: on }}
            onPress={() => onSelect(l.code)}
            style={[s.row, on && { borderColor: colors.primary, backgroundColor: '#E6F4EC' }]}
          >
            <AppText variant="label" bold>{l.name}</AppText>
            {on ? <Ionicons name="checkmark-circle" size={26} color={colors.primary} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    minHeight: 56, borderRadius: radius, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.white,
    paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
});
