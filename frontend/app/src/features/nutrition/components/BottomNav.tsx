// ─── Bottom Navigation Bar — Apex Noir Theme ───────────────────────────────
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type TabName = 'Dashboard' | 'Workout' | 'Nutrition' | 'Community' | 'Profile';

interface BottomNavProps {
  activeTab?: TabName;
  onTabPress?: (tab: TabName) => void;
}

const TABS: { name: TabName; icon: string }[] = [
  { name: 'Dashboard', icon: 'view-dashboard-outline' },
  { name: 'Workout', icon: 'dumbbell' },
  { name: 'Nutrition', icon: 'food-apple-outline' },
  { name: 'Community', icon: 'account-group-outline' },
  { name: 'Profile', icon: 'account-outline' },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab = 'Nutrition',
  onTabPress,
}) => {
  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = tab.name === activeTab;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={() => onTabPress?.(tab.name)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isActive && styles.activeIconBg]}>
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={22}
                color={isActive ? '#12110D' : '#A6A090'}
              />
            </View>
            <Text style={[styles.tabLabel, isActive && styles.activeLabel]}>
              {tab.name}
            </Text>
            {isActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 72,
    backgroundColor: '#1C1A14',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 214, 10, 0.15)',
    paddingBottom: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconBg: {
    backgroundColor: '#FFD60A',
  },
  tabLabel: {
    fontSize: 10,
    color: '#A6A090',
    fontWeight: '500',
  },
  activeLabel: {
    color: '#FFD60A',
    fontWeight: '700',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFD60A',
    marginTop: 1,
  },
});
