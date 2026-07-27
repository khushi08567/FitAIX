// ─── AI Meal Recommendations ─────────────────────────────────────────────────
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { SectionTitle } from './Header';
import { ReusableButton } from './ReusableButton';
import type { AIMealRecommendation } from '../types/nutrition.types';

interface AIRecommendationsProps {
  meals: AIMealRecommendation[];
  onRegenerate: () => void;
  isRegenerating: boolean;
}

const MEAL_ICONS: Record<string, string> = {
  breakfast: 'weather-sunny',
  lunch: 'silverware-fork-knife',
  dinner: 'weather-night',
  snack: 'food-apple',
};

const MEAL_COLORS: Record<string, string> = {
  breakfast: '#FFC542',
  lunch: '#2F80FF',
  dinner: '#7C4DFF',
  snack: '#31D67B',
};

interface MealRecommendationCardProps {
  meal: AIMealRecommendation;
  onSwap: () => void;
}

const MealRecommendationCard: React.FC<MealRecommendationCardProps> = ({ meal, onSwap }) => {
  const color = MEAL_COLORS[meal.mealType] ?? '#7C4DFF';
  const icon = MEAL_ICONS[meal.mealType] ?? 'food';
  const [showReason, setShowReason] = useState(false);

  return (
    <GlassCard style={styles.mealCard} noPadding>
      {/* Image */}
      <View style={styles.imageWrapper}>
        <Image source={{ uri: meal.imageUrl }} style={styles.mealImage} resizeMode="cover" />
        <View style={styles.imageOverlay} />
        <View style={[styles.mealTypeBadge, { backgroundColor: color }]}>
          <MaterialCommunityIcons name={icon as any} size={12} color="#FFFFFF" />
          <Text style={styles.mealTypeText}>{meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)}</Text>
        </View>
        <TouchableOpacity style={styles.reasonBtn} onPress={() => setShowReason(!showReason)}>
          <MaterialCommunityIcons name="brain" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.mealContent}>
        <Text style={styles.mealName} numberOfLines={1}>{meal.name}</Text>

        {showReason && (
          <View style={styles.reasonBox}>
            <Text style={styles.reasonText}>{meal.aiReason}</Text>
          </View>
        )}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <MaterialCommunityIcons name="fire" size={12} color="#FFC542" />
            <Text style={styles.statText}>{meal.calories} kcal</Text>
          </View>
          <View style={styles.statChip}>
            <MaterialCommunityIcons name="arm-flex" size={12} color="#7C4DFF" />
            <Text style={styles.statText}>{meal.protein}g</Text>
          </View>
          <View style={styles.statChip}>
            <MaterialCommunityIcons name="clock-outline" size={12} color="#A0AEC0" />
            <Text style={styles.statText}>{meal.cookingTime}m</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <ReusableButton
            label="Swap" onPress={onSwap} variant="ghost"
            icon="shuffle-variant" size="sm" style={styles.swapBtn}
          />
          <ReusableButton
            label="Log Meal" onPress={() => {}} variant="primary"
            icon="plus" size="sm" style={styles.logBtn}
          />
        </View>
      </View>
    </GlassCard>
  );
};

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  meals,
  onRegenerate,
  isRegenerating,
}) => (
  <View style={styles.wrapper}>
    <SectionTitle
      title="AI Meal Recommendations"
      icon="robot"
      iconColor="#7C4DFF"
      actionLabel="Regenerate All"
      onAction={onRegenerate}
    />
    <View style={styles.grid}>
      {meals.map((meal) => (
        <MealRecommendationCard key={meal.id} meal={meal} onSwap={onRegenerate} />
      ))}
    </View>
    {meals.length === 0 && (
      <GlassCard padding={20} style={styles.emptyCard}>
        <Text style={styles.emptyText}>No AI meal recommendations yet.</Text>
        <ReusableButton label="Generate Meals" onPress={onRegenerate} loading={isRegenerating} icon="robot" style={styles.generateBtn} />
      </GlassCard>
    )}
  </View>
);

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  grid: { gap: 14 },
  mealCard: { overflow: 'hidden' },
  imageWrapper: { height: 130, position: 'relative' },
  mealImage: { width: '100%', height: '100%' },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8,11,20,0.35)',
  },
  mealTypeBadge: {
    position: 'absolute', top: 10, left: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 4, paddingHorizontal: 10,
    borderRadius: 20,
  },
  mealTypeText: { fontSize: 11, color: '#FFFFFF', fontWeight: '700' },
  reasonBtn: {
    position: 'absolute', top: 10, right: 10,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  mealContent: { padding: 14 },
  mealName: {
    fontSize: 16, fontWeight: '700', color: '#FFFFFF',
    letterSpacing: -0.3, marginBottom: 8,
  },
  reasonBox: {
    backgroundColor: 'rgba(124,77,255,0.1)',
    borderRadius: 10, padding: 10, marginBottom: 10,
    borderWidth: 1, borderColor: 'rgba(124,77,255,0.2)',
  },
  reasonText: { fontSize: 12, color: '#B39DDB', lineHeight: 18 },
  statsRow: {
    flexDirection: 'row', gap: 8, marginBottom: 12,
  },
  statChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 4, paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
  },
  statText: { fontSize: 11, color: '#A0AEC0', fontWeight: '500' },
  actionRow: { flexDirection: 'row', gap: 8 },
  swapBtn: { flex: 1 },
  logBtn: { flex: 2 },
  emptyCard: { alignItems: 'center' },
  emptyText: { color: '#7C8DB5', marginBottom: 14 },
  generateBtn: { width: '100%' },
});
