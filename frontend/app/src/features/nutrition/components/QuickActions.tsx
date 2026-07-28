// ─── Quick Actions Floating Pills ──────────────────────────────────────────────
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface QuickActionsProps {
  onLogWater: () => void;
  onLogMeal: () => void;
  onUpdateBMI: () => void;
  onGenerateGrocery: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onLogWater,
  onLogMeal,
  onUpdateBMI,
  onGenerateGrocery,
}) => {
  const actions: QuickAction[] = [
    { id: 'water', label: 'Log Water', icon: 'water-plus', color: '#2F80FF', onPress: onLogWater },
    { id: 'meal', label: 'Add Meal', icon: 'food-plus', color: '#7C4DFF', onPress: onLogMeal },
    { id: 'bmi', label: 'Update Weight', icon: 'scale-bathroom', color: '#31D67B', onPress: onUpdateBMI },
    { id: 'grocery', label: 'AI Grocery', icon: 'cart-plus', color: '#FFC542', onPress: onGenerateGrocery },
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {actions.map((act) => (
          <TouchableOpacity
            key={act.id}
            style={[styles.pill, { borderColor: `${act.color}40`, backgroundColor: `${act.color}15` }]}
            onPress={act.onPress}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons name={act.icon as any} size={16} color={act.color} />
            <Text style={[styles.label, { color: act.color }]}>{act.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  scroll: { gap: 10, paddingHorizontal: 0 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
