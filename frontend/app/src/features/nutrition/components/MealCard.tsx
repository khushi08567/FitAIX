// ─── MealCard — Individual Logged Meal Row ─────────────────────────────────
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { MealEntry } from '../types/nutrition.types';

interface MealCardProps {
  meal: MealEntry;
  onDelete?: (id: string) => void;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, onDelete }) => (
  <View style={styles.card}>
    <View style={styles.left}>
      <View style={styles.iconBg}>
        <MaterialCommunityIcons name="food-variant" size={16} color="#7C4DFF" />
      </View>
      <View>
        <Text style={styles.name} numberOfLines={1}>{meal.name}</Text>
        <Text style={styles.meta}>{meal.servingSize} {meal.unit}</Text>
      </View>
    </View>
    <View style={styles.right}>
      <View style={styles.statsCol}>
        <Text style={styles.calories}>{meal.calories} kcal</Text>
        <View style={styles.macroRow}>
          <Text style={[styles.macro, { color: '#7C4DFF' }]}>P {meal.protein}g</Text>
          <Text style={[styles.macro, { color: '#2F80FF' }]}>C {meal.carbs}g</Text>
          <Text style={[styles.macro, { color: '#FFC542' }]}>F {meal.fat}g</Text>
        </View>
      </View>
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete(meal.id)}
          accessibilityLabel="Delete meal"
        >
          <MaterialCommunityIcons name="trash-can-outline" size={16} color="#FF4757" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 8,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(124,77,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    maxWidth: 140,
  },
  meta: {
    fontSize: 11,
    color: '#7C8DB5',
    marginTop: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statsCol: {
    alignItems: 'flex-end',
  },
  calories: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFC542',
  },
  macroRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  macro: {
    fontSize: 10,
    fontWeight: '600',
  },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(255,71,87,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
