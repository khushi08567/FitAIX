// ─── AI Grocery Generator ───────────────────────────────────────────────────
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { SectionTitle } from './Header';
import { ReusableButton } from './ReusableButton';
import { formatCurrency } from '../utils/nutritionUtils';

interface GroceryGeneratorProps {
  onGenerate: (reuseIngredients: boolean) => void;
  isGenerating: boolean;
  estimatedCost?: number;
  wasteReductionPercent?: number;
}

export const GroceryGenerator: React.FC<GroceryGeneratorProps> = ({
  onGenerate,
  isGenerating,
  estimatedCost = 1850,
  wasteReductionPercent = 28,
}) => {
  const [reuseIngredients, setReuseIngredients] = useState(true);

  return (
    <View style={styles.wrapper}>
      <SectionTitle title="AI Grocery Generator" icon="cart-outline" iconColor="#7C4DFF" />
      <GlassCard style={styles.card} padding={20}>
        {/* Toggle option */}
        <View style={styles.optionRow}>
          <View style={styles.optionTextCol}>
            <Text style={styles.optionTitle}>Reuse Pantry Ingredients</Text>
            <Text style={styles.optionSub}>Optimizes shopping list to reduce food waste & cost</Text>
          </View>
          <Switch
            value={reuseIngredients}
            onValueChange={setReuseIngredients}
            trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#7C4DFF' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statTile}>
            <MaterialCommunityIcons name="currency-inr" size={16} color="#31D67B" />
            <View>
              <Text style={styles.statVal}>{formatCurrency(estimatedCost)}</Text>
              <Text style={styles.statLbl}>Estimated Cost</Text>
            </View>
          </View>
          <View style={styles.statTile}>
            <MaterialCommunityIcons name="leaf" size={16} color="#31D67B" />
            <View>
              <Text style={styles.statVal}>-{wasteReductionPercent}%</Text>
              <Text style={styles.statLbl}>Waste Reduction</Text>
            </View>
          </View>
        </View>

        {/* Generate Button */}
        <ReusableButton
          label="Generate Grocery List"
          onPress={() => onGenerate(reuseIngredients)}
          loading={isGenerating}
          icon="creation"
          variant="primary"
          style={styles.genBtn}
        />
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  card: {},
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  optionTextCol: { flex: 1, paddingRight: 10 },
  optionTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  optionSub: { fontSize: 11, color: '#7C8DB5', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statTile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statVal: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  statLbl: { fontSize: 10, color: '#7C8DB5' },
  genBtn: { width: '100%' },
});
