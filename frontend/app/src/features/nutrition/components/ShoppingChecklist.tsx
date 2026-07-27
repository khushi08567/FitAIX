// ─── Shopping Checklist ───────────────────────────────────────────────────────
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { SectionTitle } from './Header';
import { formatCurrency, getShoppingProgress } from '../utils/nutritionUtils';
import type { ShoppingListData, ShoppingItem } from '../types/nutrition.types';

interface ShoppingChecklistProps {
  data: ShoppingListData | null;
  onToggleItem: (itemId: string) => void;
}

export const ShoppingChecklist: React.FC<ShoppingChecklistProps> = ({ data, onToggleItem }) => {
  const items = data?.items ?? [];
  const checkedCount = data?.checkedCount ?? 0;
  const total = data?.total ?? items.length;
  const totalCost = data?.totalCost ?? items.reduce((s, i) => s + i.estimatedCost, 0);
  const progressPct = getShoppingProgress(checkedCount, total);

  return (
    <View style={styles.wrapper}>
      <SectionTitle
        title="Shopping Checklist"
        icon="checkbox-marked-circle-outline"
        iconColor="#31D67B"
        subtitle={`${checkedCount}/${total} items checked`}
      />
      <GlassCard style={styles.card} padding={16}>
        {/* Progress Bar */}
        <View style={styles.progressHeader}>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.pctText}>{progressPct}%</Text>
        </View>

        {/* Checklist */}
        {items.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="basket-outline" size={32} color="#7C8DB5" />
            <Text style={styles.emptyText}>No shopping items yet. Generate a grocery list above!</Text>
          </View>
        ) : (
          items.map((item: ShoppingItem) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemRow, item.isChecked && styles.itemChecked]}
              onPress={() => onToggleItem(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, item.isChecked && styles.checkboxChecked]}>
                {item.isChecked && <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />}
              </View>

              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, item.isChecked && styles.strikethrough]}>
                  {item.name}
                </Text>
                <Text style={styles.itemQty}>{item.quantity} {item.unit}</Text>
              </View>

              <Text style={[styles.itemCost, item.isChecked && styles.strikethrough]}>
                {formatCurrency(item.estimatedCost)}
              </Text>
            </TouchableOpacity>
          ))
        )}

        {/* Total Cost Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLbl}>Total Estimated Cost</Text>
          <Text style={styles.footerVal}>{formatCurrency(totalCost)}</Text>
        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  card: {},
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  barBg: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#31D67B',
    borderRadius: 4,
  },
  pctText: { fontSize: 12, fontWeight: '700', color: '#31D67B' },
  empty: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  emptyText: { color: '#7C8DB5', fontSize: 12, textAlign: 'center' },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  itemChecked: { opacity: 0.5 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#7C8DB5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#31D67B',
    borderColor: '#31D67B',
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  itemQty: { fontSize: 11, color: '#7C8DB5', marginTop: 1 },
  itemCost: { fontSize: 13, fontWeight: '700', color: '#31D67B' },
  strikethrough: { textDecorationLine: 'line-through' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  footerLbl: { fontSize: 13, color: '#7C8DB5', fontWeight: '500' },
  footerVal: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
});
