import React, { useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from '../components/AppText';
import Button from '../components/Button';
import { useT } from '../context/SettingsContext';
import { colors } from '../theme';
import type { Key } from '../i18n';

const CARDS: { icon: keyof typeof Ionicons.glyphMap; text: Key; color: string }[] = [
  { icon: 'cash-outline', text: 'w1', color: colors.primary },
  { icon: 'shield-checkmark-outline', text: 'w2', color: colors.amber },
  { icon: 'calendar-outline', text: 'w3', color: colors.green },
];

// Three swipe cards, shown once before sign-up.
export default function WelcomeScreen({ onDone }: { onDone: () => void }) {
  const t = useT();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const ref = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const last = page === CARDS.length - 1;

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  const next = () => { if (last) onDone(); else ref.current?.scrollTo({ x: (page + 1) * width, animated: true }); };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 20 }}>
      <Pressable accessibilityRole="button" onPress={onDone} style={s.skip}>
        <AppText variant="label" bold color={colors.muted}>{t('skip')}</AppText>
      </Pressable>
      <ScrollView ref={ref} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={onEnd} style={{ flex: 1 }}>
        {CARDS.map((c) => (
          <View key={c.text} style={[s.page, { width }]}>
            <View style={[s.circle, { backgroundColor: c.color }]}><Ionicons name={c.icon} size={80} color={colors.white} /></View>
            <AppText variant="title" style={{ textAlign: 'center' }}>{t(c.text)}</AppText>
          </View>
        ))}
      </ScrollView>
      <View style={s.dots}>
        {CARDS.map((c, i) => <View key={c.text} style={[s.dot, i === page && { backgroundColor: colors.primary, width: 26 }]} />)}
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        <Button title={last ? t('getStarted') : t('next')} icon="arrow-forward" onPress={next} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  skip: { alignSelf: 'flex-end', paddingHorizontal: 20, minHeight: 44, justifyContent: 'center' },
  page: { alignItems: 'center', justifyContent: 'center', gap: 28, paddingHorizontal: 32 },
  circle: { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 20 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.border },
});
