import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface WorkoutScreenProps {
  userProfile?: any;
}

export const WorkoutScreen: React.FC<WorkoutScreenProps> = ({ userProfile }) => {
  const isHome = userProfile?.workoutLocation === 'Home';
  const isInjured = userProfile?.obstacle === 'Dealing with an injury';
  const isBeginner = userProfile?.experience === "I'm just getting started" || userProfile?.experience === 'Less than 1 year';
  const duration = userProfile?.workoutDuration || '30 minutes';

  // Base exercises list depending on location (Home vs Gym)
  let exercises = [];

  if (isHome) {
    exercises = [
      {
        name: isInjured ? 'Glute Bridges' : 'Bodyweight Squats',
        sets: isBeginner ? 3 : 4,
        reps: isBeginner ? '10 reps' : '15 reps',
        notes: isInjured 
          ? 'Lie flat, drive through heels. Zero knee loading, maximum glute activation.'
          : 'Focus on depth, push hips back. Keep weight on your heels.',
        safeTag: isInjured ? 'Zero Joint Load' : 'Bodyweight',
      },
      {
        name: 'Incline Push-ups',
        sets: isBeginner ? 3 : 4,
        reps: '12 reps',
        notes: 'Perform against a couch or chair. Keeps core tight, builds chest strength.',
        safeTag: 'Upper Body',
      },
      {
        name: 'Dumbbell Rows',
        sets: 3,
        reps: isBeginner ? '10 reps' : '12 reps',
        notes: 'Hinge at the hips. Pull dumbbell towards your hip bone to target your lats.',
        safeTag: 'Pull Focus',
      },
      {
        name: 'Plank Hold',
        sets: 3,
        reps: duration === '30 minutes' ? '30 seconds' : '45 seconds',
        notes: 'Keep elbows directly under shoulders, squeeze glutes and core.',
        safeTag: 'Core Stability',
      }
    ];
  } else {
    // Gym exercises
    exercises = [
      {
        name: 'Romanian Deadlifts',
        sets: isBeginner ? 3 : 4,
        reps: '10 reps',
        notes: 'Focus on hip hinge. Keeps load on hamstrings and glutes, sparing the knee joints.',
        safeTag: 'Knee Safe',
      },
      {
        name: isInjured ? 'Glute Bridges (Weighted)' : 'Leg Press (Shallow Range)',
        sets: isBeginner ? 3 : 4,
        reps: '12 reps',
        notes: isInjured
          ? 'Add a dumbbell or bar across hips. Zero knee loading, maximum glute activation.'
          : 'Keep knee flexion angle shallow. Do not bend knees past 60 degrees.',
        safeTag: isInjured ? 'Zero Joint Load' : 'Angle Controlled',
      },
      {
        name: 'Dumbbell Bench Press',
        sets: isBeginner ? 3 : 4,
        reps: '10 reps',
        notes: 'Keep elbows tucked at 45 degrees. Press straight up and contract the chest.',
        safeTag: 'Upper Press',
      },
      {
        name: 'Lat Pulldowns',
        sets: 3,
        reps: isBeginner ? '10 reps' : '12 reps',
        notes: 'Pull the bar down towards your collarbone. Squeeze shoulder blades together.',
        safeTag: 'Back Width',
      }
    ];
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.subTitle}>Today's Target</Text>
        <Text style={styles.title}>{isHome ? 'Home Fullbody Routine 🏠' : 'Gym Lower/Upper Split 🏋️‍♂️'}</Text>
        {isInjured ? (
          <Text style={styles.injuryIndicator}>⚠️ Knee-Safe Lock Enabled (Knee Injury Advisory)</Text>
        ) : (
          <Text style={[styles.injuryIndicator, { backgroundColor: 'rgba(0, 240, 255, 0.1)', color: '#00F0FF' }]}>
            ✓ FitAI Optimized Split Active
          </Text>
        )}
      </View>

      {/* Routine list */}
      <Text style={styles.sectionHeader}>Customized Exercises</Text>
      <View style={styles.list}>
        {exercises.map((item, idx) => (
          <View key={idx} style={styles.exerciseCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.tagBadge}>
                <Text style={styles.tagBadgeText}>{item.safeTag}</Text>
              </View>
            </View>
            
            <View style={styles.row}>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Sets</Text>
                <Text style={styles.metricVal}>{item.sets}</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricLabel}>Volume</Text>
                <Text style={styles.metricVal}>{item.reps}</Text>
              </View>
            </View>

            <Text style={styles.notes}>{item.notes}</Text>
          </View>
        ))}
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
  subTitle: {
    color: '#A6A090',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  injuryIndicator: {
    color: '#FFB800',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sectionHeader: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  list: {
    gap: 16,
  },
  exerciseCard: {
    backgroundColor: '#1E1D1A',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  tagBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagBadgeText: {
    color: '#00F0FF',
    fontSize: 10,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingBottom: 10,
  },
  metric: {
    flexDirection: 'column',
  },
  metricLabel: {
    color: '#666',
    fontSize: 9,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  metricVal: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  notes: {
    color: '#A6A090',
    fontSize: 12,
    lineHeight: 16,
  },
});
