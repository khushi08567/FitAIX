import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export const WorkoutScreen: React.FC = () => {
  const exercises = [
    {
      name: 'Romanian Deadlifts',
      sets: 3,
      reps: '10 reps',
      notes: 'Focus on hip hinge. Keeps load on hamstrings and glutes, sparing the knee joints.',
      safeTag: 'Knee Safe',
    },
    {
      name: 'Glute Bridges',
      sets: 3,
      reps: '12 reps',
      notes: 'Lie flat, drive through heels. Zero knee loading, maximum glute activation.',
      safeTag: 'Zero Joint Load',
    },
    {
      name: 'Leg Press (Shallow Range)',
      sets: 3,
      reps: '12 reps',
      notes: 'Keep knee flexion angle shallow. Do not bend knees past 60 degrees.',
      safeTag: 'Angle Controlled',
    },
    {
      name: 'Standing Calf Raises',
      sets: 3,
      reps: '15 reps',
      notes: 'Stand on a flat surface, rise onto toes slowly. Safe calf loading.',
      safeTag: 'Knee Safe',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.subTitle}>Today's Target</Text>
        <Text style={styles.title}>Legs Routine 🏋️‍♂️</Text>
        <Text style={styles.injuryIndicator}>⚠️ Knee-Safe Lock Enabled (Left Knee Advisory)</Text>
      </View>

      {/* Routine list */}
      <Text style={styles.sectionHeader}>Exercises</Text>
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
