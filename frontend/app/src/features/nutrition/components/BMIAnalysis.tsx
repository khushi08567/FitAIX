// ─── BMI Analysis Section ─────────────────────────────────────────────────────
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { SectionTitle } from './Header';
import { ReusableButton } from './ReusableButton';
import { getBMICategoryColor } from '../utils/nutritionUtils';
import type { BMIData } from '../types/nutrition.types';

interface BMIAnalysisProps {
  data: BMIData | null;
  onUpdate: (weight: number, height: number) => Promise<void>;
  isUpdating: boolean;
}

const BMI_RANGE = { min: 16, max: 40 };

function getBMIPosition(bmi: number): number {
  const clamped = Math.min(Math.max(bmi, BMI_RANGE.min), BMI_RANGE.max);
  return ((clamped - BMI_RANGE.min) / (BMI_RANGE.max - BMI_RANGE.min)) * 100;
}

export const BMIAnalysis: React.FC<BMIAnalysisProps> = ({ data, onUpdate, isUpdating }) => {
  const [weight, setWeight] = useState(data?.weight?.toString() ?? '');
  const [height, setHeight] = useState(data?.height?.toString() ?? '');
  const [expanded, setExpanded] = useState(false);

  const handleUpdate = async () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid weight and height values.');
      return;
    }
    await onUpdate(w, h);
    setExpanded(false);
  };

  const categoryColor = data ? getBMICategoryColor(data.category) : '#7C4DFF';
  const bmiPos = data ? getBMIPosition(data.bmi) : 50;

  const zones = [
    { label: 'Under', color: '#2F80FF', flex: 2 },
    { label: 'Normal', color: '#31D67B', flex: 3 },
    { label: 'Over', color: '#FFC542', flex: 2 },
    { label: 'Obese', color: '#FF4757', flex: 3 },
  ];

  return (
    <View style={styles.wrapper}>
      <SectionTitle title="BMI Analysis" icon="scale-bathroom" iconColor="#31D67B" />
      <GlassCard style={styles.card} padding={20}>
        {/* BMI Value Row */}
        <View style={styles.bmiRow}>
          <View>
            <Text style={styles.bmiValue}>{data?.bmi ?? '--'}</Text>
            <Text style={styles.bmiSub}>BMI Score</Text>
          </View>
          <View style={styles.metrics}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{data?.weight ?? '--'} kg</Text>
              <Text style={styles.metricLabel}>Weight</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{data?.height ?? '--'} cm</Text>
              <Text style={styles.metricLabel}>Height</Text>
            </View>
          </View>
          <View style={[styles.categoryBadge, { borderColor: categoryColor }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {data?.category ?? 'N/A'}
            </Text>
          </View>
        </View>

        {/* Gauge */}
        <View style={styles.gaugeWrapper}>
          <View style={styles.gauge}>
            {zones.map((z) => (
              <View key={z.label} style={[styles.gaugeZone, { flex: z.flex, backgroundColor: z.color }]} />
            ))}
            {/* Indicator */}
            <View style={[styles.indicator, { left: `${bmiPos}%` as any }]}>
              <View style={[styles.indicatorLine, { backgroundColor: '#FFFFFF' }]} />
              <View style={styles.indicatorDot} />
            </View>
          </View>
          <View style={styles.gaugeLabels}>
            <Text style={styles.gaugeLabel}>16</Text>
            <Text style={styles.gaugeLabel}>18.5</Text>
            <Text style={styles.gaugeLabel}>25</Text>
            <Text style={styles.gaugeLabel}>30</Text>
            <Text style={styles.gaugeLabel}>40</Text>
          </View>
        </View>

        <Text style={styles.rangeText}>
          Healthy Range:{' '}
          <Text style={styles.rangeValue}>{data?.healthyRange.min} – {data?.healthyRange.max}</Text>
        </Text>

        {/* AI Suggestion */}
        <View style={styles.aiBox}>
          <View style={styles.aiHeader}>
            <MaterialCommunityIcons name="brain" size={14} color="#7C4DFF" />
            <Text style={styles.aiLabel}>AI Insight</Text>
          </View>
          <Text style={styles.aiText}>{data?.aiSuggestion ?? 'Loading AI suggestions...'}</Text>
        </View>

        {/* Update Toggle */}
        <ReusableButton
          label={expanded ? 'Cancel' : 'Update Measurements'}
          onPress={() => setExpanded(!expanded)}
          variant={expanded ? 'outline' : 'ghost'}
          icon={expanded ? 'close' : 'pencil'}
          style={styles.updateBtn}
        />

        {expanded && (
          <View style={styles.inputRow}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholderTextColor="#7C8DB5"
                placeholder="75"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                placeholderTextColor="#7C8DB5"
                placeholder="178"
              />
            </View>
            <ReusableButton
              label="Save"
              onPress={handleUpdate}
              loading={isUpdating}
              icon="check"
              style={styles.saveBtn}
              size="sm"
            />
          </View>
        )}
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  card: {},
  bmiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  bmiValue: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  bmiSub: { fontSize: 12, color: '#7C8DB5', marginTop: -4 },
  metrics: { gap: 8 },
  metricItem: { alignItems: 'center' },
  metricValue: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  metricLabel: { fontSize: 10, color: '#7C8DB5' },
  categoryBadge: {
    paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 20, borderWidth: 1.5,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  categoryText: { fontSize: 13, fontWeight: '700' },
  gaugeWrapper: { marginBottom: 10 },
  gauge: {
    flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden',
    position: 'relative', marginBottom: 4,
  },
  gaugeZone: { height: '100%' },
  indicator: {
    position: 'absolute', top: -4, transform: [{ translateX: -6 }],
    alignItems: 'center',
  },
  indicatorLine: { width: 2, height: 20, borderRadius: 1 },
  indicatorDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#FFFFFF', marginTop: 2,
    borderWidth: 2, borderColor: '#080B14',
  },
  gaugeLabels: {
    flexDirection: 'row', justifyContent: 'space-between',
  },
  gaugeLabel: { fontSize: 9, color: '#7C8DB5' },
  rangeText: { fontSize: 12, color: '#7C8DB5', marginBottom: 14 },
  rangeValue: { color: '#31D67B', fontWeight: '600' },
  aiBox: {
    backgroundColor: 'rgba(124,77,255,0.08)',
    borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: 'rgba(124,77,255,0.2)',
    marginBottom: 14,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  aiLabel: { fontSize: 11, color: '#7C4DFF', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  aiText: { fontSize: 13, color: '#A0AEC0', lineHeight: 20 },
  updateBtn: { width: '100%', marginBottom: 10 },
  inputRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  inputGroup: { flex: 1 },
  inputLabel: { fontSize: 12, color: '#7C8DB5', marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12, height: 42,
    paddingHorizontal: 12,
    color: '#FFFFFF', fontSize: 15, fontWeight: '600',
    borderWidth: 1, borderColor: 'rgba(124,77,255,0.2)',
  },
  saveBtn: { marginBottom: 0 },
});
