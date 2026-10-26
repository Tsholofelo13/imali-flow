import React, { useContext } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, RefreshControl, ScrollView } from 'react-native';
import { NavigationContext } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from './AppText';
import { useT } from '../context/SettingsContext';
import { colors } from '../theme';

type Props = { children: React.ReactNode; refreshing?: boolean; onRefresh?: () => void; back?: boolean };

export default function Screen({ children, refreshing, onRefresh, back }: Props) {
  const insets = useSafeAreaInsets();
  const nav = useContext(NavigationContext);
  const t = useT();
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: 40, gap: 16 }}
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined}
      >
        {back && nav ? (
          <Pressable accessibilityRole="button" accessibilityLabel={t('back')} onPress={() => nav.goBack()}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 }}>
            <Ionicons name="arrow-back" size={26} color={colors.primary} />
            <AppText variant="label" bold color={colors.primary}>{t('back')}</AppText>
          </Pressable>
        ) : null}
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
