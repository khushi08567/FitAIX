// ─── Food Preferences Component ──────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { SectionTitle } from './Header';
import { ReusableButton } from './ReusableButton';
import type { FoodPreferences, DietaryPreference } from '../types/nutrition.types';

interface FoodPreferencesProps {
  preferences: FoodPreferences | null;
  onSave: (data: {
    dietaryPreferences: DietaryPreference[];
    allergies: string[];
    favoriteFoods: string[];
  }) => Promise<void>;
  isSaving: boolean;
}

const DIET_OPTIONS: { id: DietaryPreference; label: string; icon: string }[] = [
  { id: 'vegetarian', label: 'Vegetarian', icon: 'leaf' },
  { id: 'vegan', label: 'Vegan', icon: 'sprout' },
  { id: 'halal', label: 'Halal', icon: 'food-halal' },
  { id: 'jain', label: 'Jain', icon: 'flower-tulip' },
  { id: 'high-protein', label: 'High Protein', icon: 'arm-flex' },
  { id: 'low-carb', label: 'Low Carb', icon: 'food-off' },
  { id: 'keto', label: 'Keto', icon: 'avocado' },
  { id: 'gluten-free', label: 'Gluten Free', icon: 'barley-off' },
  { id: 'dairy-free', label: 'Dairy Free', icon: 'cow-off' },
];

const ALLERGY_OPTIONS = ['Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Soy', 'Shellfish', 'Wheat'];

export const FoodPreferencesComponent: React.FC<FoodPreferencesProps> = ({
  preferences,
  onSave,
  isSaving,
}) => {
  const [selectedDiets, setSelectedDiets] = useState<DietaryPreference[]>(
    preferences?.dietaryPreferences ?? ['high-protein', 'low-carb'],
  );
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(
    preferences?.allergies ?? ['Peanuts'],
  );
  const [favInput, setFavInput] = useState(
    preferences?.favoriteFoods?.join(', ') ?? 'Grilled chicken, Oatmeal, Eggs',
  );

  useEffect(() => {
    if (preferences) {
      setSelectedDiets(preferences.dietaryPreferences);
      setSelectedAllergies(preferences.allergies);
      setFavInput(preferences.favoriteFoods.join(', '));
    }
  }, [preferences]);

  const toggleDiet = (id: DietaryPreference) => {
    setSelectedDiets((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergy) ? prev.filter((a) => a !== allergy) : [...prev, allergy],
    );
  };

  const handleSave = () => {
    const favs = favInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onSave({
      dietaryPreferences: selectedDiets,
      allergies: selectedAllergies,
      favoriteFoods: favs,
    });
  };

  return (
    <View style={styles.wrapper}>
      <SectionTitle title="Food Preferences" icon="cog-outline" iconColor="#FFC542" />
      <GlassCard style={styles.card} padding={20}>
        {/* Dietary Preferences Chip Grid */}
        <Text style={styles.subTitle}>Dietary Preferences</Text>
        <View style={styles.chipGrid}>
          {DIET_OPTIONS.map((diet) => {
            const active = selectedDiets.includes(diet.id);
            return (
              <TouchableOpacity
                key={diet.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleDiet(diet.id)}
                activeOpacity={0.75}
              >
                <MaterialCommunityIcons
                  name={diet.icon as any}
                  size={14}
                  color={active ? '#FFFFFF' : '#7C8DB5'}
                />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {diet.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Food Allergies */}
        <Text style={styles.subTitle}>Food Allergies</Text>
        <View style={styles.chipGrid}>
          {ALLERGY_OPTIONS.map((allergy) => {
            const active = selectedAllergies.includes(allergy);
            return (
              <TouchableOpacity
                key={allergy}
                style={[styles.chip, active && styles.allergyActive]}
                onPress={() => toggleAllergy(allergy)}
                activeOpacity={0.75}
              >
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={13}
                  color={active ? '#FF4757' : '#7C8DB5'}
                />
                <Text style={[styles.chipText, active && { color: '#FF4757', fontWeight: '700' }]}>
                  {allergy}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Favorite Foods */}
        <Text style={styles.subTitle}>Favorite Foods (comma separated)</Text>
        <TextInput
          style={styles.input}
          value={favInput}
          onChangeText={setFavInput}
          placeholder="e.g. Salmon, Avocado, Greek Yogurt"
          placeholderTextColor="#7C8DB5"
        />

        {/* Save Button */}
        <ReusableButton
          label="Save Preferences"
          onPress={handleSave}
          loading={isSaving}
          icon="check-all"
          variant="primary"
          style={styles.saveBtn}
        />
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  card: {},
  subTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
    marginTop: 4,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipActive: {
    backgroundColor: '#7C4DFF',
    borderColor: '#7C4DFF',
  },
  allergyActive: {
    backgroundColor: 'rgba(255,71,87,0.12)',
    borderColor: '#FF4757',
  },
  chipText: { fontSize: 12, color: '#7C8DB5', fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    height: 44,
    paddingHorizontal: 14,
    color: '#FFFFFF',
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 18,
  },
  saveBtn: { width: '100%' },
});
