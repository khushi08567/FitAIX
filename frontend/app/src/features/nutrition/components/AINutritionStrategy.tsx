// ─── AI Nutrition Strategy ────────────────────────────────────────────────────
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { SectionTitle } from './Header';
import { formatMillilitres } from '../utils/nutritionUtils';
import type { NutritionStrategy } from '../types/nutrition.types';

interface AINutritionStrategyProps {
  strategy: NutritionStrategy | null;
}

interface StrategyMetric {
  icon: string;
  label: string;
  value: string;
  color: string;
  bgColor: string;
}

export const AINutritionStrategy: React.FC<AINutritionStrategyProps> = ({ strategy }) => {
  const [explanationOpen, setExplanationOpen] = useState(false);

  const metrics: StrategyMetric[] = strategy
    ? [
        {
          icon: 'fire',
          label: 'Target Calories',
          value: `${strategy.targetCalories} kcal`,
          color: '#FFC542',
          bgColor: 'rgba(255,197,66,0.1)',
        },
        {
          icon: 'arm-flex',
          label: 'Protein Goal',
          value: `${strategy.proteinGoal}g`,
          color: '#7C4DFF',
          bgColor: 'rgba(124,77,255,0.1)',
        },
        {
          icon: 'water',
          label: 'Hydration Goal',
          value: formatMillilitres(strategy.hydrationGoal),
          color: '#2F80FF',
          bgColor: 'rgba(47,128,255,0.1)',
        },
        {
          icon: 'flag',
          label: 'Weekly Goal',
          value: strategy.weeklyGoal,
          color: '#31D67B',
          bgColor: 'rgba(49,214,123,0.1)',
        },
      ]
    : [];

  return (
    <View style={styles.wrapper}>
      <SectionTitle title="AI Nutrition Strategy" icon="robot-outline" iconColor="#7C4DFF" subtitle="Personalized by AI" />
      <GlassCard style={styles.card} padding={20}>
        {/* Strategy Grid */}
        <View style={styles.grid}>
          {metrics.map((m) => (
            <View key={m.label} style={[styles.metricTile, { backgroundColor: m.bgColor, borderColor: `${m.color}33` }]}>
              <View style={[styles.iconCircle, { backgroundColor: `${m.color}22` }]}>
                <MaterialCommunityIcons name={m.icon as any} size={18} color={m.color} />
              </View>
              <Text style={[styles.metricValue, { color: m.color }]} numberOfLines={1}>
                {m.value}
              </Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* AI Explanation Accordion */}
        <TouchableOpacity
          style={styles.explanationHeader}
          onPress={() => setExplanationOpen(!explanationOpen)}
          activeOpacity={0.7}
        >
          <View style={styles.explanationLeft}>
            <MaterialCommunityIcons name="brain" size={16} color="#7C4DFF" />
            <Text style={styles.explanationTitle}>AI Explanation</Text>
          </View>
          <MaterialCommunityIcons
            name={explanationOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#7C8DB5"
          />
        </TouchableOpacity>

        {explanationOpen && (
          <View style={styles.explanationBody}>
            <Text style={styles.explanationText}>
              {strategy?.aiExplanation ?? 'No explanation available.'}
            </Text>
            <View style={styles.confidenceBadge}>
              <MaterialCommunityIcons name="check-circle" size={12} color="#31D67B" />
              <Text style={styles.confidenceText}>95% confidence · Updated today</Text>
            </View>
          </View>
        )}
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  card: {},
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricTile: {
    width: '47%',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  metricLabel: {
    fontSize: 11,
    color: '#7C8DB5',
    fontWeight: '500',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(124,77,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(124,77,255,0.15)',
  },
  explanationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  explanationTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  explanationBody: {
    marginTop: 10,
    padding: 14,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 14,
  },
  explanationText: {
    fontSize: 13,
    color: '#A0AEC0',
    lineHeight: 20,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
  },
  confidenceText: {
    fontSize: 11,
    color: '#31D67B',
    fontWeight: '500',
  },
});
