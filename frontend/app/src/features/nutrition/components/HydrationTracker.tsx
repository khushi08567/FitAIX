// ─── Hydration Tracker ────────────────────────────────────────────────────────
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { GlassCard } from './GlassCard';
import { SectionTitle } from './Header';
import { formatMillilitres, getHydrationPercentage } from '../utils/nutritionUtils';
import type { HydrationData } from '../types/nutrition.types';

const AnimatedRect = Animated.createAnimatedComponent(Rect);

interface HydrationTrackerProps {
  hydration: HydrationData | null;
  onAddWater: (amount: number) => void;
  isAdding?: boolean;
}

const BOTTLE_WIDTH = 64;
const BOTTLE_HEIGHT = 110;
const INNER_HEIGHT = 90;

export const HydrationTracker: React.FC<HydrationTrackerProps> = ({
  hydration,
  onAddWater,
}) => {
  const current = hydration?.currentIntake ?? 0;
  const goal = hydration?.goal ?? 3000;
  const percentage = getHydrationPercentage(current, goal);

  const fillHeight = useSharedValue(0);

  useEffect(() => {
    const targetHeight = (INNER_HEIGHT * percentage) / 100;
    fillHeight.value = withTiming(targetHeight, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
  }, [current, goal]);

  const animatedProps = useAnimatedProps(() => ({
    height: fillHeight.value,
    y: BOTTLE_HEIGHT - 10 - fillHeight.value,
  }));

  const quickButtons = [
    { label: '+250ml', amount: 250 },
    { label: '+500ml', amount: 500 },
    { label: '+1L', amount: 1000 },
  ];

  return (
    <View style={styles.wrapper}>
      <SectionTitle title="Hydration Tracker" icon="water" iconColor="#2F80FF" />
      <GlassCard style={styles.card} padding={20}>
        <View style={styles.content}>
          {/* Animated Water Bottle */}
          <View style={styles.bottleContainer}>
            <Svg width={BOTTLE_WIDTH} height={BOTTLE_HEIGHT}>
              <Defs>
                <LinearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <Stop offset="0%" stopColor="#00C6FF" />
                  <Stop offset="100%" stopColor="#2F80FF" />
                </LinearGradient>
              </Defs>
              {/* Bottle Cap */}
              <Rect x={24} y={2} width={16} height={6} rx={3} fill="#7C8DB5" />
              {/* Bottle Neck */}
              <Rect x={27} y={8} width={10} height={6} fill="rgba(255,255,255,0.15)" />
              {/* Bottle Body Outer */}
              <Rect
                x={4} y={14} width={56} height={92} rx={16}
                fill="rgba(255,255,255,0.04)" stroke="rgba(47,128,255,0.3)" strokeWidth={2}
              />
              {/* Water Liquid Fill */}
              <AnimatedRect
                x={6} width={52} rx={12}
                fill="url(#waterGrad)"
                animatedProps={animatedProps}
              />
            </Svg>
            <View style={styles.pctBadge}>
              <Text style={styles.pctText}>{Math.round(percentage)}%</Text>
            </View>
          </View>

          {/* Intake Info */}
          <View style={styles.infoCol}>
            <Text style={styles.currentText}>{formatMillilitres(current)}</Text>
            <Text style={styles.goalText}>
              Goal: <Text style={styles.goalVal}>{formatMillilitres(goal)}</Text>
            </Text>

            {/* Quick Add Buttons */}
            <View style={styles.quickRow}>
              {quickButtons.map((btn) => (
                <TouchableOpacity
                  key={btn.label}
                  style={styles.quickBtn}
                  onPress={() => onAddWater(btn.amount)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.quickText}>{btn.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
    gap: 20,
  },
  bottleContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  pctBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#2F80FF',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  pctText: { fontSize: 10, color: '#FFFFFF', fontWeight: '700' },
  infoCol: { flex: 1, gap: 4 },
  currentText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  goalText: { fontSize: 13, color: '#7C8DB5' },
  goalVal: { color: '#2F80FF', fontWeight: '600' },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(47,128,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(47,128,255,0.3)',
    alignItems: 'center',
  },
  quickText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2F80FF',
  },
});
