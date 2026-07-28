// ─── Meal Logger Section ──────────────────────────────────────────────────────
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { SectionTitle } from './Header';
import { MealCard } from './MealCard';
import { ReusableButton } from './ReusableButton';
import type { MealEntry, LogMealForm } from '../types/nutrition.types';

type MealTab = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface MealLoggerProps {
  mealLogs: MealEntry[];
  onLogMeal: (form: LogMealForm) => Promise<void>;
  onDeleteMeal: (id: string) => void;
  isLogging: boolean;
}

const TABS: { key: MealTab; label: string; icon: string; color: string }[] = [
  { key: 'breakfast', label: 'Breakfast', icon: 'weather-sunny', color: '#FFC542' },
  { key: 'lunch', label: 'Lunch', icon: 'silverware-fork-knife', color: '#2F80FF' },
  { key: 'dinner', label: 'Dinner', icon: 'weather-night', color: '#7C4DFF' },
  { key: 'snack', label: 'Snack', icon: 'food-apple', color: '#31D67B' },
];

export const MealLogger: React.FC<MealLoggerProps> = ({
  mealLogs,
  onLogMeal,
  onDeleteMeal,
  isLogging,
}) => {
  const [activeTab, setActiveTab] = useState<MealTab>('breakfast');
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const { control, handleSubmit, reset, formState: { errors } } = useForm<LogMealForm>({
    defaultValues: { mealType: 'breakfast', name: '', calories: 0, protein: 0, carbs: 0, fat: 0 },
  });

  const filtered = mealLogs.filter((m) => m.mealType === activeTab);
  const activeTab_ = TABS.find((t) => t.key === activeTab)!;

  const onSubmit = async (data: LogMealForm) => {
    await onLogMeal({ ...data, mealType: activeTab });
    reset();
    setModalVisible(false);
  };

  return (
    <View style={styles.wrapper}>
      <SectionTitle title="Meal Logger" icon="pencil-box" iconColor="#2F80FF" />
      <GlassCard style={styles.card} padding={16}>
        {/* Tab Switcher */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                styles.tab,
                activeTab === tab.key && { backgroundColor: `${tab.color}22`, borderColor: tab.color },
              ]}
            >
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={14}
                color={activeTab === tab.key ? tab.color : '#7C8DB5'}
              />
              <Text style={[styles.tabText, { color: activeTab === tab.key ? tab.color : '#7C8DB5' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Search */}
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={16} color="#7C8DB5" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab} foods...`}
            placeholderTextColor="#7C8DB5"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Logged meals */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name={activeTab_.icon as any} size={32} color="#7C8DB5" />
            <Text style={styles.emptyText}>No {activeTab} logged yet</Text>
          </View>
        ) : (
          filtered.map((m) => <MealCard key={m.id} meal={m} onDelete={onDeleteMeal} />)
        )}

        {/* Quick Add Button */}
        <ReusableButton
          label="Log a Meal"
          onPress={() => setModalVisible(true)}
          icon="plus"
          variant="primary"
          style={styles.logBtn}
        />
      </GlassCard>

      {/* Add Meal Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modal} padding={20}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log {activeTab_.label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={22} color="#A0AEC0" />
              </TouchableOpacity>
            </View>

            {/* Name */}
            <Controller
              control={control}
              name="name"
              rules={{ required: 'Food name is required' }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Food Name</Text>
                  <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    value={value} onChangeText={onChange}
                    placeholder="e.g. Grilled Chicken" placeholderTextColor="#7C8DB5"
                  />
                  {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
                </View>
              )}
            />

            {/* Macro Grid */}
            <View style={styles.macroGrid}>
              {(['calories', 'protein', 'carbs', 'fat'] as const).map((field) => (
                <Controller
                  key={field}
                  control={control}
                  name={field}
                  rules={{ required: true, min: 0 }}
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.macroInput}>
                      <Text style={styles.inputLabel}>{field.charAt(0).toUpperCase() + field.slice(1)}</Text>
                      <TextInput
                        style={styles.input}
                        value={String(value)}
                        onChangeText={(v) => onChange(Number(v) || 0)}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#7C8DB5"
                      />
                    </View>
                  )}
                />
              ))}
            </View>

            <ReusableButton
              label="Log Meal"
              onPress={handleSubmit(onSubmit)}
              loading={isLogging}
              icon="check"
              style={styles.submitBtn}
            />
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: 24 },
  card: {},
  tabs: { flexDirection: 'row', marginBottom: 14 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 7, paddingHorizontal: 12,
    borderRadius: 20, marginRight: 8,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  tabText: { fontSize: 13, fontWeight: '600' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12, paddingHorizontal: 12,
    marginBottom: 14, height: 40,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    gap: 8,
  },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyText: { color: '#7C8DB5', fontSize: 14 },
  logBtn: { marginTop: 12, width: '100%' },
  // Modal
  modalOverlay: {
    flex: 1, justifyContent: 'flex-end',
    backgroundColor: 'rgba(8,11,20,0.85)',
  },
  modal: { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderRadius: 24 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, color: '#7C8DB5', marginBottom: 6, fontWeight: '500' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12, height: 44,
    paddingHorizontal: 14, color: '#FFFFFF',
    fontSize: 14, fontWeight: '500',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  inputError: { borderColor: '#FF4757' },
  errorText: { color: '#FF4757', fontSize: 11, marginTop: 4 },
  macroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  macroInput: { width: '47%' },
  submitBtn: { width: '100%' },
});
