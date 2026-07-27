// ─── CaloriesCard — Apex Noir Theme ─────────────────────────────────────────
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { GlassCard } from './GlassCard';
import { SectionTitle } from './Header';
import { formatCalories, getCaloriesRemaining } from '../utils/nutritionUtils';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CaloriesCardProps {
  consumed: number;
  goal: number;
  protein: number;
  carbs: number;
  fat: number;
}

const RING_SIZE = 180;
const STROKE_WIDTH = 16;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const CaloriesCard: React.FC<CaloriesCardProps> = ({
  consumed,
  goal,
  protein,
  carbs,
  fat,
}) => {
  const progress = useSharedValue(0);
  const targetProgress = Math.min(consumed / goal, 1);

  useEffect(() => {
    progress.value = withTiming(targetProgress, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [consumed, goal]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const remaining = getCaloriesRemaining(consumed, goal);
  const percentage = Math.round(targetProgress * 100);

  return (
    <View style={styles.wrapper}>
      <SectionTitle title="Daily Calories" icon="fire" iconColor="#FFD60A" />
      <GlassCard style={styles.card} padding={20}>
        <View style={styles.content}>
          {/* Ring */}
          <View style={styles.ringWrapper}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Defs>
                <LinearGradient id="calGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#FFD60A" />
                  <Stop offset="100%" stopColor="#F5C400" />
                </LinearGradient>
              </Defs>
              {/* Track */}
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={STROKE_WIDTH}
                fill="none"
              />
              {/* Progress */}
              <AnimatedCircle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                stroke="url(#calGrad)"
                strokeWidth={STROKE_WIDTH}
                fill="none"
                strokeDasharray={CIRCUMFERENCE}
                animatedProps={animatedProps}
                strokeLinecap="round"
                transform={`rotate(-90, ${RING_SIZE / 2}, ${RING_SIZE / 2})`}
              />
            </Svg>
            {/* Center Text */}
            <View style={styles.centerText}>
              <Text style={styles.percentageText}>{percentage}%</Text>
              <Text style={styles.consumedText}>{formatCalories(consumed)}</Text>
              <Text style={styles.kcalLabel}>kcal</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <View style={[styles.dot, { backgroundColor: '#FFD60A' }]} />
              <View>
                <Text style={styles.statValue}>{formatCalories(consumed)}</Text>
                <Text style={styles.statLabel}>Consumed</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <View style={[styles.dot, { backgroundColor: '#00F0FC' }]} />
              <View>
                <Text style={styles.statValue}>{formatCalories(remaining)}</Text>
                <Text style={styles.statLabel}>Remaining</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <View style={[styles.dot, { backgroundColor: '#7C7767' }]} />
              <View>
                <Text style={styles.statValue}>{formatCalories(goal)}</Text>
                <Text style={styles.statLabel}>Goal</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Macro Pills */}
        <View style={styles.macroPills}>
          {[
            { label: 'Protein', value: protein, color: '#FFD60A', unit: 'g' },
            { label: 'Carbs', value: carbs, color: '#00F0FC', unit: 'g' },
            { label: 'Fat', value: fat, color: '#F5C400', unit: 'g' },
          ].map((m) => (
            <View key={m.label} style={[styles.pill, { borderColor: `${m.color}44` }]}>
              <Text style={[styles.pillValue, { color: m.color }]}>{m.value}g</Text>
              <Text style={styles.pillLabel}>{m.label}</Text>
            </View>
          ))}
        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  card: {},
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  ringWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 12,
    color: '#A6A090',
    fontWeight: '600',
    marginBottom: -2,
  },
  consumedText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F2EFE9',
    letterSpacing: -1,
  },
  kcalLabel: {
    fontSize: 11,
    color: '#A6A090',
    marginTop: -2,
  },
  stats: {
    flex: 1,
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F2EFE9',
  },
  statLabel: {
    fontSize: 11,
    color: '#A6A090',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  macroPills: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  pill: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  pillValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  pillLabel: {
    fontSize: 10,
    color: '#A6A090',
    marginTop: 1,
  },
});
