import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { colors } from '../theme';

type Props = { progress: number; color?: string; height?: number };

export default function ProgressBar({ progress, color = colors.primary, height = 14 }: Props) {
  const w = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(w, { toValue: Math.max(0, Math.min(1, progress)), duration: 800, useNativeDriver: false }).start();
  }, [progress, w]);
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: colors.border, overflow: 'hidden' }} accessibilityRole="progressbar">
      <Animated.View style={{ height, backgroundColor: color, width: w.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
    </View>
  );
}
