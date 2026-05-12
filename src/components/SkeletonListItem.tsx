import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';

function Pulse({ style, delay = 0 }: { style: object; delay?: number }) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    const timeout = setTimeout(() => {
      opacity.value = withRepeat(
        withTiming(0.85, { duration: 950, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    }, delay);
    return () => clearTimeout(timeout);
  }, [opacity, delay]);

  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.pulse, style, anim]} />;
}

export default function SkeletonListItem() {
  return (
    <View style={styles.card}>
      <Pulse style={styles.image} />
      <View style={styles.info}>
        <Pulse style={styles.titleLine1} delay={60} />
        <Pulse style={styles.titleLine2} delay={120} />
        <Pulse style={styles.badgeLine} delay={180} />
        <Pulse style={styles.seasonLine} delay={240} />
        <Pulse style={styles.epsLine} delay={300} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  image: {
    width: 88,
    height: 124,
    backgroundColor: colors.accent + '44',
    borderRadius: 0,
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 7,
  },
  titleLine1: {
    height: 14,
    width: '90%',
    backgroundColor: colors.accent + '44',
    borderRadius: 7,
  },
  titleLine2: {
    height: 14,
    width: '65%',
    backgroundColor: colors.accent + '33',
    borderRadius: 7,
  },
  badgeLine: {
    height: 20,
    width: '40%',
    backgroundColor: colors.accent + '33',
    borderRadius: 5,
  },
  seasonLine: {
    height: 11,
    width: '55%',
    backgroundColor: colors.accent + '28',
    borderRadius: 5,
  },
  epsLine: {
    height: 10,
    width: '45%',
    backgroundColor: colors.accent + '22',
    borderRadius: 5,
  },
  pulse: {},
});
