// ─── MacroProgress — Apex Noir Theme ─────────────────────────────────────────
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { GlassCard } from './GlassCard';
import { SectionTitle } from './Header';
import { getMacroPercentage } from '../utils/nutritionUtils';
import type { MacroField } from '../types/nutrition.types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_SIZE = 88;
const STROKE_WIDTH = 10;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface MacroRingProps {
  label: string;
  consumed: number;
  goal: number;
  color1: string;
  color2: string;
  unit: string;
  gradientId: string;
  delay?: number;
}

const MacroRing: React.FC<MacroRingProps> = ({
  label,
  consumed,
  goal,
  color1,
  color2,
  unit,
  gradientId,
  delay = 0,
}) => {
  const progress = useSharedValue(0);
  const pct = getMacroPercentage(consumed, goal);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(pct / 100, { duration: 1000, easing: Easing.out(Easing.cubic) }),
    );
  }, [consumed, goal]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  return (
    <View style={styles.ringItem}>
      <View style={styles.ringContainer}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Defs>
            <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={color1} />
              <Stop offset="100%" stopColor={color2} />
            </LinearGradient>
          </Defs>
          <Circle
            cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS}
            stroke="rgba(255,255,255,0.06)" strokeWidth={STROKE_WIDTH} fill="none"
          />
          <AnimatedCircle
            cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RADIUS}
            stroke={`url(#${gradientId})`} strokeWidth={STROKE_WIDTH}
            fill="none" strokeDasharray={CIRCUMFERENCE}
            animatedProps={animatedProps} strokeLinecap="round"
            transform={`rotate(-90, ${RING_SIZE / 2}, ${RING_SIZE / 2})`}
          />
        </Svg>
        <View style={styles.ringCenter}>
          <Text style={[styles.pctText, { color: color1 }]}>{pct}%</Text>
        </View>
      </View>
      <Text style={styles.ringLabel}>{label}</Text>
      <Text style={styles.ringValue}>
        <Text style={{ color: color1, fontWeight: '700' }}>{consumed}</Text>
        <Text style={styles.ringGoal}>/{goal}{unit}</Text>
      </Text>
    </View>
  );
};

interface MacroProgressProps {
  protein: MacroField;
  carbs: MacroField;
  fat: MacroField;
}

export const MacroProgress: React.FC<MacroProgressProps> = ({ protein, carbs, fat }) => (
  <View style={styles.wrapper}>
    <SectionTitle title="Macronutrients" icon="chart-donut" iconColor="#FFD60A" />
    <GlassCard style={styles.card} padding={20}>
      <View style={styles.row}>
        <MacroRing
          label="Protein" consumed={protein.consumed} goal={protein.goal}
          color1="#FFD60A" color2="#F5C400" unit="g" gradientId="proteinGrad" delay={0}
        />
        <View style={styles.separator} />
        <MacroRing
          label="Carbs" consumed={carbs.consumed} goal={carbs.goal}
          color1="#00F0FC" color2="#00B8D4" unit="g" gradientId="carbsGrad" delay={150}
        />
        <View style={styles.separator} />
        <MacroRing
          label="Fat" consumed={fat.consumed} goal={fat.goal}
          color1="#7C7767" color2="#A6A090" unit="g" gradientId="fatGrad" delay={300}
        />
      </View>
    </GlassCard>
  </View>
);

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  card: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  ringItem: {
    alignItems: 'center',
    gap: 6,
  },
  ringContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
  },
  pctText: {
    fontSize: 13,
    fontWeight: '700',
  },
  ringLabel: {
    fontSize: 13,
    color: '#F2EFE9',
    fontWeight: '600',
  },
  ringValue: {
    fontSize: 12,
    color: '#A6A090',
  },
  ringGoal: {
    fontSize: 11,
    color: '#A6A090',
  },
  separator: {
    width: 1,
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
