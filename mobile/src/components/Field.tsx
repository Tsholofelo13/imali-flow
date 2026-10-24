import React from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import AppText from './AppText';
import { colors, radius } from '../theme';
import { useSettings } from '../context/SettingsContext';

type Props = TextInputProps & { label: string; error?: string };

export default function Field({ label, error, style, ...rest }: Props) {
  const { fontScale } = useSettings();
  return (
    <View style={{ gap: 6 }}>
      <AppText variant="label" bold>{label}</AppText>
      <TextInput
        {...rest}
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        style={[s.input, { fontSize: 18 * fontScale }, error ? { borderColor: colors.red } : null, style]}
      />
      {error ? <AppText variant="small" color={colors.red}>{error}</AppText> : null}
    </View>
  );
}

const s = StyleSheet.create({
  input: {
    minHeight: 56, borderWidth: 2, borderColor: colors.border, borderRadius: radius,
    paddingHorizontal: 14, backgroundColor: colors.white, color: colors.text,
  },
});
