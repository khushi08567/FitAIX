// ─── MetricCard — Stat Display Card ──────────────────────────────────────────
import React from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';

interface MetricCardProps {
  icon: string;
  iconColor?: string;
  label: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  style?: ViewStyle;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  icon,
  iconColor = '#7C4DFF',
  label,
  value,
  unit,
  trend,
  style,
}) => {
  const trendColor = trend === 'up' ? '#31D67B' : trend === 'down' ? '#FF4757' : '#A0AEC0';
  const trendIcon = trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : undefined;

  return (
    <GlassCard style={{ ...styles.card, ...style }} padding={14}>
      <View style={styles.iconRow}>
        <View style={[styles.iconBg, { backgroundColor: `${iconColor}22` }]}>
          <MaterialCommunityIcons name={icon as any} size={18} color={iconColor} />
        </View>
        {trendIcon && (
          <MaterialCommunityIcons name={trendIcon as any} size={14} color={trendColor} />
        )}
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      <Text style={styles.label}>{label}</Text>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    minWidth: 90,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  unit: {
    fontSize: 11,
    color: '#7C8DB5',
    fontWeight: '500',
  },
  label: {
    fontSize: 11,
    color: '#7C8DB5',
    marginTop: 2,
    fontWeight: '500',
  },
});
