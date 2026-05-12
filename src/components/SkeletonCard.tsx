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

const CARD_WIDTH = 150;
const CARD_HEIGHT = 225;

function Pulse({ style }: { style: object }) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, { duration: 950, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[styles.pulse, style, anim]} />;
}

export default function SkeletonCard() {
  return (
    <View style={styles.card}>
      <Pulse style={styles.image} />
      <View style={styles.infoArea}>
        <Pulse style={styles.line1} />
        <Pulse style={styles.line2} />
        <Pulse style={styles.line3} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
    marginRight: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT * 0.66,
    backgroundColor: colors.accent + '44',
    borderRadius: 0,
  },
  infoArea: {
    padding: 10,
    gap: 6,
  },
  line1: {
    height: 12,
    width: '90%',
    backgroundColor: colors.accent + '44',
    borderRadius: 6,
  },
  line2: {
    height: 12,
    width: '65%',
    backgroundColor: colors.accent + '33',
    borderRadius: 6,
  },
  line3: {
    height: 10,
    width: '45%',
    backgroundColor: colors.accent + '28',
    borderRadius: 5,
    marginTop: 2,
  },
  pulse: {},
});
