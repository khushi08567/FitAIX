import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { usePreferences } from '../hooks/useNutritionQueries';

export const ProfileScreen: React.FC = () => {
  const { data: preferencesData } = usePreferences();

  // Map allergy states
  const activeAllergies = Object.entries(preferencesData?.allergies ?? {})
    .filter(([_, active]) => active)
    .map(([allergy]) => allergy);

  // Map category states
  const activeCategories = Object.entries(preferencesData?.categories ?? {})
    .filter(([_, active]) => active)
    .map(([category]) => category);

  const favoriteFoods = preferencesData?.favoriteFoods ?? '';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarBg}>
          <Text style={styles.avatarText}>🙋‍♀️</Text>
        </View>
        <Text style={styles.name}>Simran</Text>
        <Text style={styles.membership}>Premium Coach Access</Text>
      </View>

      {/* Target Metrics */}
      <Text style={styles.sectionHeader}>Fitness Settings</Text>
      <View style={styles.settingsGroup}>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Primary Goal</Text>
          <Text style={styles.itemVal}>Body Recomposition</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={styles.itemLabel}>Active Injuries</Text>
          <Text style={[styles.itemVal, { color: '#FF3B30', fontWeight: 'bold' }]}>Left Knee (Mild Patellar Tendinitis)</Text>
        </View>
      </View>

      {/* Live AI Synced Preferences */}
      <Text style={styles.sectionHeader}>Live AI Synced Preferences</Text>
      <View style={styles.settingsGroup}>
        <View style={styles.itemColumn}>
          <Text style={styles.itemLabel}>Dietary Preferences</Text>
          {activeCategories.length > 0 ? (
            <View style={styles.chipRow}>
              {activeCategories.map((c, idx) => (
                <View key={idx} style={styles.categoryChip}>
                  <Text style={styles.chipText}>{c}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.itemVal}>None selected (General Diet)</Text>
          )}
        </View>

        <View style={styles.itemColumn}>
          <Text style={styles.itemLabel}>Allergies & Avoidances</Text>
          {activeAllergies.length > 0 ? (
            <View style={styles.chipRow}>
              {activeAllergies.map((a, idx) => (
                <View key={idx} style={styles.allergyChip}>
                  <Text style={styles.chipText}>{a}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.itemVal}>No allergies registered</Text>
          )}
        </View>

        <View style={styles.itemColumn}>
          <Text style={styles.itemLabel}>Favorite Foods</Text>
          <Text style={styles.itemVal}>{favoriteFoods || 'None registered yet'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12110D',
  },
  content: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 100,
  },
  profileCard: {
    backgroundColor: '#1E1D1A',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0F0E0D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFD60A',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
  },
  name: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  membership: {
    color: '#FFD60A',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    color: '#A6A090',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 12,
    letterSpacing: 0.5,
    marginTop: 10,
  },
  settingsGroup: {
    backgroundColor: '#1E1D1A',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 16,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemColumn: {
    flexDirection: 'column',
    gap: 8,
  },
  itemLabel: {
    color: '#666',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  itemVal: {
    color: '#FFF',
    fontSize: 13,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryChip: {
    backgroundColor: 'rgba(255, 214, 10, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  allergyChip: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chipText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
