// ─── Recommended Meals — Horizontal Carousel ─────────────────────────────────
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SectionTitle } from './Header';
import type { RecommendedMeal } from '../types/nutrition.types';

interface RecommendedMealsProps {
  meals: RecommendedMeal[];
}

interface MealItemProps {
  meal: RecommendedMeal;
}

const RecommendedMealItem: React.FC<MealItemProps> = ({ meal }) => {
  const [saved, setSaved] = useState(false);

  return (
    <View style={styles.card}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: meal.imageUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.overlay} />
        <TouchableOpacity
          style={[styles.heartBtn, saved && styles.heartBtnActive]}
          onPress={() => setSaved(!saved)}
          accessibilityLabel="Save meal"
        >
          <MaterialCommunityIcons
            name={saved ? 'heart' : 'heart-outline'}
            size={16}
            color={saved ? '#FF4757' : '#FFFFFF'}
          />
        </TouchableOpacity>
        <View style={styles.ratingBadge}>
          <MaterialCommunityIcons name="star" size={10} color="#FFC542" />
          <Text style={styles.ratingText}>{meal.rating}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Text style={styles.mealName} numberOfLines={2}>{meal.name}</Text>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <MaterialCommunityIcons name="fire" size={11} color="#FFC542" />
            <Text style={styles.statText}>{meal.calories}</Text>
          </View>
          <View style={styles.stat}>
            <MaterialCommunityIcons name="arm-flex" size={11} color="#7C4DFF" />
            <Text style={styles.statText}>{meal.protein}g</Text>
          </View>
          <View style={styles.stat}>
            <MaterialCommunityIcons name="clock-outline" size={11} color="#A0AEC0" />
            <Text style={styles.statText}>{meal.cookingTime}m</Text>
          </View>
        </View>
        <View style={styles.tags}>
          {meal.tags.slice(0, 2).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export const RecommendedMeals: React.FC<RecommendedMealsProps> = ({ meals }) => (
  <View style={styles.wrapper}>
    <SectionTitle title="Recommended Meals" icon="thumb-up" iconColor="#FFC542" actionLabel="See All" onAction={() => {}} />
    <FlatList
      data={meals}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <RecommendedMealItem meal={item} />}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
      snapToInterval={198}
      decelerationRate="fast"
    />
  </View>
);

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  list: { paddingHorizontal: 0, paddingBottom: 4 },
  card: {
    width: 185,
    backgroundColor: '#121B2B',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(124,77,255,0.15)',
    shadowColor: '#7C4DFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  imageWrapper: {
    height: 110,
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8,11,20,0.3)',
  },
  heartBtn: {
    position: 'absolute', top: 8, right: 8,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center', justifyContent: 'center',
  },
  heartBtnActive: { backgroundColor: 'rgba(255,71,87,0.2)' },
  ratingBadge: {
    position: 'absolute', bottom: 8, left: 8,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 2, paddingHorizontal: 8,
    borderRadius: 10,
  },
  ratingText: { fontSize: 10, color: '#FFC542', fontWeight: '700' },
  info: { padding: 12 },
  mealName: {
    fontSize: 13, fontWeight: '700',
    color: '#FFFFFF', lineHeight: 18,
    marginBottom: 8,
  },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText: { fontSize: 10, color: '#A0AEC0' },
  tags: { flexDirection: 'row', gap: 5 },
  tag: {
    paddingVertical: 2, paddingHorizontal: 7,
    backgroundColor: 'rgba(124,77,255,0.12)',
    borderRadius: 8,
  },
  tagText: { fontSize: 9, color: '#7C4DFF', fontWeight: '600' },
});
