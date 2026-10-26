import React, { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import AppText from './AppText';

type Props = Omit<React.ComponentProps<typeof AppText>, 'children'> & {
  value: number;
  format?: (n: number) => string;
  duration?: number;
};

// Counts up to the value, so numbers feel alive.
export default function AnimatedNumber({ value, format = (n) => String(Math.round(n)), duration = 700, ...rest }: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = anim.addListener(({ value: v }) => setShown(v));
    anim.setValue(0);
    Animated.timing(anim, { toValue: value, duration, useNativeDriver: false }).start();
    return () => anim.removeListener(id);
  }, [value, duration, anim]);
  return <AppText {...rest}>{format(shown)}</AppText>;
}
