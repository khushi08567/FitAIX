import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDailyNutrition, useHydration } from '../hooks/useNutritionQueries';

interface DashboardScreenProps {
  onNavigate: (tab: 'Dashboard' | 'Workout' | 'Nutrition' | 'Community' | 'Profile') => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const { data: dailyData } = useDailyNutrition();
  const { data: hydrationData } = useHydration();

  const caloriesGoal = dailyData?.caloriesGoal ?? 2200;
  const caloriesConsumed = dailyData?.caloriesConsumed ?? 1480;
  const progressPercent = Math.min(Math.round((caloriesConsumed / caloriesGoal) * 100), 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.greeting}>Welcome Back,</Text>
        <Text style={styles.username}>Simran 👋</Text>
      </View>

      {/* Daily Target Progress Ring Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Calories Budget</Text>
          <Text style={styles.streakLabel}>🔥 128 Days Streak</Text>
        </View>
        <View style={styles.progressRow}>
          <View>
            <Text style={styles.progressValue}>{caloriesConsumed.toLocaleString()} kcal</Text>
            <Text style={styles.progressSubtext}>of {caloriesGoal.toLocaleString()} kcal goal</Text>
          </View>
          <View style={styles.progressBadge}>
            <Text style={styles.progressBadgeText}>{progressPercent}%</Text>
          </View>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.grid}>
        <View style={styles.gridCard}>
          <Text style={styles.gridLabel}>💧 Hydration</Text>
          <Text style={styles.gridValue}>{(hydrationData?.totalIntake ?? 0)} ml</Text>
          <Text style={styles.gridGoal}>Target: 2,500 ml</Text>
        </View>
        <View style={styles.gridCard}>
          <Text style={styles.gridLabel}>⚡ Active Energy</Text>
          <Text style={styles.gridValue}>460 kcal</Text>
          <Text style={styles.gridGoal}>Target: 500 kcal</Text>
        </View>
      </View>

      {/* Injury Warnings & Adaptive Notice */}
      <View style={styles.injuryCard}>
        <View style={styles.injuryHeader}>
          <Text style={styles.injuryTitle}>⚠️ Live Injury Advisory</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Active</Text>
          </View>
        </View>
        <Text style={styles.injuryName}>Left Knee Patellar Tendinitis</Text>
        <Text style={styles.injuryDesc}>
          Coach Rachel has automatically adapted your current routines to lock out knee flexion past 60 degrees. Knee-safe lift targets are applied.
        </Text>
      </View>

      {/* Quick Navigation Cards */}
      <Text style={styles.sectionHeader}>Quick Actions</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => onNavigate('Nutrition')}>
          <Text style={styles.actionBtnText}>🍏 Log Nutrition</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => onNavigate('Workout')}>
          <Text style={styles.actionBtnText}>🏋️‍♂️ View Workouts</Text>
        </TouchableOpacity>
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
  headerContainer: {
    marginBottom: 24,
  },
  greeting: {
    color: '#A6A090',
    fontSize: 14,
    fontWeight: '500',
  },
  username: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: '#1E1D1A',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    color: '#A6A090',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  streakLabel: {
    color: '#FFD60A',
    fontSize: 12,
    fontWeight: '700',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressValue: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  progressSubtext: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  progressBadge: {
    backgroundColor: 'rgba(255, 214, 10, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressBadgeText: {
    color: '#FFD60A',
    fontWeight: 'bold',
    fontSize: 14,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#0F0E0D',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFD60A',
    borderRadius: 3,
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#1E1D1A',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  gridLabel: {
    color: '#A6A090',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  gridValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gridGoal: {
    color: '#666',
    fontSize: 10,
  },
  injuryCard: {
    backgroundColor: '#1E1D1A',
    borderColor: '#FF3B30',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  injuryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  injuryTitle: {
    color: '#FF3B30',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    color: '#FF3B30',
    fontSize: 9,
    fontWeight: 'bold',
  },
  injuryName: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  injuryDesc: {
    color: '#A6A090',
    fontSize: 11.5,
    lineHeight: 16,
  },
  sectionHeader: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#1E1D1A',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 12.5,
    fontWeight: '600',
  },
});
