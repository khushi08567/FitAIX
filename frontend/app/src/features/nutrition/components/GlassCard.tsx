// ─── GlassCard — Glassmorphism Container ─────────────────────────────────────
import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  radius?: number;
  noPadding?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  padding = 16,
  radius = 22,
  noPadding = false,
}) => {
  return (
    <View
      style={[
        styles.card,
        { borderRadius: radius, padding: noPadding ? 0 : padding },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1A14',
    borderWidth: 1,
    borderColor: 'rgba(255, 214, 10, 0.18)',
    shadowColor: '#FFD60A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
});
