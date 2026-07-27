// ─── Budget Planner Section ───────────────────────────────────────────────────
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart } from 'react-native-gifted-charts';
import { GlassCard } from './GlassCard';
import { SectionTitle } from './Header';
import { formatCurrency } from '../utils/nutritionUtils';
import type { BudgetData } from '../types/nutrition.types';

interface BudgetPlannerProps {
  budget: BudgetData | null;
}

export const BudgetPlanner: React.FC<BudgetPlannerProps> = ({ budget }) => {
  const currency = budget?.currency ?? 'INR';
  const spent = budget?.spent ?? 0;
  const total = budget?.weeklyBudget ?? 3500;
  const remaining = budget?.remaining ?? Math.max(total - spent, 0);

  const barData = budget?.breakdown?.map((b) => ({
    value: b.amount,
    label: b.day,
    frontColor: b.amount > 500 ? '#FF4757' : b.amount > 0 ? '#7C4DFF' : 'rgba(255,255,255,0.1)',
  })) ?? [
    { value: 420, label: 'Mon', frontColor: '#7C4DFF' },
    { value: 380, label: 'Tue', frontColor: '#7C4DFF' },
    { value: 450, label: 'Wed', frontColor: '#7C4DFF' },
    { value: 310, label: 'Thu', frontColor: '#7C4DFF' },
    { value: 540, label: 'Fri', frontColor: '#FF4757' },
    { value: 0, label: 'Sat', frontColor: 'rgba(255,255,255,0.1)' },
    { value: 0, label: 'Sun', frontColor: 'rgba(255,255,255,0.1)' },
  ];

  return (
    <View style={styles.wrapper}>
      <SectionTitle title="Budget Planner" icon="wallet-outline" iconColor="#31D67B" />
      <GlassCard style={styles.card} padding={20}>
        {/* Badges */}
        <View style={styles.badgeRow}>
          <View style={styles.badgeItem}>
            <Text style={styles.badgeLabel}>Weekly Budget</Text>
            <Text style={styles.badgeVal}>{formatCurrency(total, currency)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.badgeItem}>
            <Text style={styles.badgeLabel}>Spent</Text>
            <Text style={[styles.badgeVal, { color: '#FFC542' }]}>
              {formatCurrency(spent, currency)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.badgeItem}>
            <Text style={styles.badgeLabel}>Remaining</Text>
            <Text style={[styles.badgeVal, { color: '#31D67B' }]}>
              {formatCurrency(remaining, currency)}
            </Text>
          </View>
        </View>

        {/* Mini Graph */}
        <View style={styles.chartContainer}>
          <BarChart
            data={barData}
            barWidth={18}
            spacing={14}
            roundedTop
            roundedBottom
            hideRules
            xAxisThickness={0}
            yAxisThickness={0}
            yAxisTextStyle={{ color: '#7C8DB5', fontSize: 9 }}
            xAxisLabelTextStyle={{ color: '#7C8DB5', fontSize: 10 }}
            height={90}
            noOfSections={3}
            maxValue={600}
          />
        </View>

        {/* AI Cost Suggestion */}
        <View style={styles.aiBox}>
          <View style={styles.aiHeader}>
            <MaterialCommunityIcons name="lightbulb-on" size={14} color="#FFC542" />
            <Text style={styles.aiTitle}>AI Cost Suggestion</Text>
          </View>
          <Text style={styles.aiText}>
            {budget?.aiSuggestion ?? 'Consider buying vegetables in bulk on weekends to save 15-20%.'}
          </Text>
        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  card: {},
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  badgeItem: { flex: 1, alignItems: 'center' },
  badgeLabel: { fontSize: 11, color: '#7C8DB5', marginBottom: 2 },
  badgeVal: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  divider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.08)' },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingRight: 10,
  },
  aiBox: {
    backgroundColor: 'rgba(255,197,66,0.08)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,197,66,0.2)',
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  aiTitle: { fontSize: 11, fontWeight: '700', color: '#FFC542', textTransform: 'uppercase' },
  aiText: { fontSize: 12, color: '#A0AEC0', lineHeight: 18 },
});
