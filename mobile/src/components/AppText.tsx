import React from 'react';
import { Text, TextProps } from 'react-native';
import { colors } from '../theme';
import { useSettings } from '../context/SettingsContext';

type Variant = 'body' | 'small' | 'label' | 'title' | 'big';
const SIZE: Record<Variant, number> = { body: 17, small: 14, label: 16, title: 24, big: 44 };

type Props = TextProps & { variant?: Variant; color?: string; bold?: boolean };

export default function AppText({ variant = 'body', color, bold, style, ...rest }: Props) {
  const { fontScale } = useSettings();
  const heavy = bold || variant === 'title' || variant === 'big';
  return (
    <Text
      {...rest}
      style={[{ fontSize: SIZE[variant] * fontScale, color: color ?? colors.text, fontWeight: heavy ? '700' : '400' }, style]}
    />
  );
}
