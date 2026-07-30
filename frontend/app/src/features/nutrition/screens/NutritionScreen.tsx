// ─── Single Nutrition Dashboard Screen — Apex Noir Theme ───────────────────────
import React, { useCallback, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Alert,
  TouchableOpacity,
  Text,
  TextInput,
} from 'react-native';

// Store & Hooks
import { useNutritionStore } from '../store/nutritionStore';
import {
  useDailyNutrition,
  useBMI,
  useUpdateBMI,
  useAIStrategy,
  useAIMeals,
  useRegenerateAIMeals,
  useMealLogs,
  useLogMeal,
  useDeleteMeal,
  useRecommendedMeals,
  useHydration,
  useAddHydration,
  useBudget,
  useShoppingList,
  useToggleShoppingItem,
  useGenerateGrocery,
  usePreferences,
  useSavePreferences,
} from '../hooks/useNutritionQueries';

// Section Components
import { Header } from '../components/Header';
import { QuickActions } from '../components/QuickActions';
import { CaloriesCard } from '../components/CaloriesCard';
import { MacroProgress } from '../components/MacroProgress';
import { BMIAnalysis } from '../components/BMIAnalysis';
import { AINutritionStrategy } from '../components/AINutritionStrategy';
import { AIRecommendations } from '../components/AIRecommendations';
import { MealLogger } from '../components/MealLogger';
import { RecommendedMeals } from '../components/RecommendedMeals';
import { HydrationTracker } from '../components/HydrationTracker';
import { BudgetPlanner } from '../components/BudgetPlanner';
import { GroceryGenerator } from '../components/GroceryGenerator';
import { ShoppingChecklist } from '../components/ShoppingChecklist';
import { FoodPreferencesComponent } from '../components/FoodPreferences';
import { BottomNav } from '../components/BottomNav';
import { RachelChatModal } from '../components/RachelChatModal';

export const NutritionScreen: React.FC = () => {
  // ─── Store State ─────────────────────────────────────────────────────────────
  const store = useNutritionStore();

  // ─── Search and Notification States ──────────────────────────────────────────
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Data Queries ────────────────────────────────────────────────────────────
  const { data: dailyData, isRefetching, refetch } = useDailyNutrition();
  const { data: bmiData } = useBMI();
  const { data: strategyData } = useAIStrategy();
  const { data: aiMealsData } = useAIMeals();
  const { data: mealLogsData } = useMealLogs();
  const { data: recMealsData } = useRecommendedMeals();
  const { data: hydrationData } = useHydration();
  const { data: budgetData } = useBudget();
  const { data: shoppingData } = useShoppingList();
  const { data: preferencesData } = usePreferences();

  // ─── Mutations ───────────────────────────────────────────────────────────────
  const updateBMIMutation = useUpdateBMI();
  const regenerateMealsMutation = useRegenerateAIMeals();
  const logMealMutation = useLogMeal();
  const deleteMealMutation = useDeleteMeal();
  const toggleShoppingMutation = useToggleShoppingItem();
  const generateGroceryMutation = useGenerateGrocery();
  const savePreferencesMutation = useSavePreferences();
  const addHydrationMutation = useAddHydration();

  // ─── Direct Hydration Action (Optimistic) ───────────────────────────────────
  const handleAddWater = useCallback((amount: number) => {
    addHydrationMutation.mutate(amount);
  }, [addHydrationMutation]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleUpdateBMI = async (weight: number, height: number) => {
    await updateBMIMutation.mutateAsync({ weight, height });
    Alert.alert('Success', 'BMI measurements updated successfully!');
  };

  const handleRegenerateAIMeals = async () => {
    await regenerateMealsMutation.mutateAsync();
  };

  const handleToggleShopping = (itemId: string) => {
    toggleShoppingMutation.mutate(itemId);
  };

  const handleGenerateGrocery = async (reuse: boolean) => {
    await generateGroceryMutation.mutateAsync(reuse);
    Alert.alert('Generated!', 'Your AI grocery list has been added to your shopping checklist.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#12110D" />

      {/* ─── Vertically Scrollable Screen Container ───────────────────────── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#FFD60A"
            colors={['#FFD60A']}
          />
        }
      >
        {/* Section 1: Header */}
        <Header
          onNotificationPress={() => setShowNotifications(true)}
          onSearchPress={() => setShowSearch(true)}
        />

        <View style={styles.bodyContent}>
          {/* Quick Actions Pills */}
          <QuickActions
            onLogWater={() => handleAddWater(250)}
            onLogMeal={() => store.setShowMealLogModal(true)}
            onUpdateBMI={() => Alert.alert('BMI', 'Scroll to BMI section to edit measurements.')}
            onGenerateGrocery={() => handleGenerateGrocery(true)}
          />

          {/* Section 2: Daily Calories */}
          <CaloriesCard
            consumed={dailyData?.caloriesConsumed ?? store.daily?.caloriesConsumed ?? 1480}
            goal={dailyData?.caloriesGoal ?? store.daily?.caloriesGoal ?? 2200}
            protein={dailyData?.protein?.consumed ?? store.daily?.protein?.consumed ?? 87}
            carbs={dailyData?.carbs?.consumed ?? store.daily?.carbs?.consumed ?? 172}
            fat={dailyData?.fat?.consumed ?? store.daily?.fat?.consumed ?? 42}
          />

          {/* Section 3: Macronutrients (3 Animated Rings) */}
          <MacroProgress
            protein={dailyData?.protein ?? store.daily?.protein ?? { consumed: 87, goal: 165 }}
            carbs={dailyData?.carbs ?? store.daily?.carbs ?? { consumed: 172, goal: 220 }}
            fat={dailyData?.fat ?? store.daily?.fat ?? { consumed: 42, goal: 73 }}
          />

          {/* Section 4: BMI Analysis */}
          <BMIAnalysis
            data={bmiData ?? store.bmi}
            onUpdate={handleUpdateBMI}
            isUpdating={updateBMIMutation.isPending}
          />

          {/* Section 5: AI Nutrition Strategy */}
          <AINutritionStrategy strategy={strategyData ?? store.strategy} />

          {/* Section 6: AI Meal Recommendations */}
          <AIRecommendations
            meals={aiMealsData ?? store.aiMeals}
            onRegenerate={handleRegenerateAIMeals}
            isRegenerating={regenerateMealsMutation.isPending}
          />

          {/* Section 7: Meal Logger */}
          <MealLogger
            mealLogs={mealLogsData ?? store.mealLogs}
            onLogMeal={async (form) => {
              await logMealMutation.mutateAsync(form);
            }}
            onDeleteMeal={(id) => deleteMealMutation.mutate(id)}
            isLogging={logMealMutation.isPending}
          />

          {/* Section 8: Recommended Meals (Horizontal Carousel) */}
          <RecommendedMeals meals={recMealsData ?? store.recommendedMeals} />

          {/* Section 9: Hydration Tracker */}
          <HydrationTracker
            hydration={hydrationData ?? store.hydration}
            onAddWater={handleAddWater}
          />

          {/* Section 10: Budget Planner */}
          <BudgetPlanner budget={budgetData ?? store.budget} />

          {/* Section 11: AI Grocery Generator */}
          <GroceryGenerator
            onGenerate={handleGenerateGrocery}
            isGenerating={generateGroceryMutation.isPending}
            estimatedCost={1850}
            wasteReductionPercent={28}
          />

          {/* Section 12: Shopping Checklist */}
          <ShoppingChecklist
            data={shoppingData ?? store.shoppingList}
            onToggleItem={handleToggleShopping}
          />

          {/* Section 13: Food Preferences */}
          <FoodPreferencesComponent
            preferences={preferencesData ?? store.preferences}
            onSave={async (data) => {
              await savePreferencesMutation.mutateAsync(data);
              Alert.alert('Saved!', 'Food preferences updated.');
            }}
            isSaving={savePreferencesMutation.isPending}
          />
        </View>
      </ScrollView>

      {/* ─── Notifications Modal ─── */}
      {showNotifications && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Notifications</Text>
            <ScrollView style={styles.modalScroll}>
              <View style={styles.notifRow}>
                <Text style={styles.notifDot}>•</Text>
                <View style={styles.notifTextWrap}>
                  <Text style={styles.notifHeading}>⏰ Rest time is up!</Text>
                  <Text style={styles.notifTime}>1 min ago</Text>
                </View>
              </View>
              <View style={styles.notifRow}>
                <Text style={styles.notifDot}>•</Text>
                <View style={styles.notifTextWrap}>
                  <Text style={styles.notifHeading}>📝 Workout Reminder: Legs & Abs</Text>
                  <Text style={styles.notifTime}>5 mins ago</Text>
                </View>
              </View>
              <View style={styles.notifRow}>
                <Text style={styles.notifDot}>•</Text>
                <View style={styles.notifTextWrap}>
                  <Text style={styles.notifHeading}>💧 Hydration goal reached 50%</Text>
                  <Text style={styles.notifTime}>30 mins ago</Text>
                </View>
              </View>
              <View style={styles.notifRow}>
                <Text style={styles.notifDot}>•</Text>
                <View style={styles.notifTextWrap}>
                  <Text style={styles.notifHeading}>🥑 AI Coach: Increase healthy fat intake</Text>
                  <Text style={styles.notifTime}>1 hour ago</Text>
                </View>
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowNotifications(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ─── Search Modal ─── */}
      {showSearch && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Food Database Search</Text>
            <TextInput
              style={styles.searchBar}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Type food name... (e.g. Chicken, Banana)"
              placeholderTextColor="#666"
              autoFocus
            />
            <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
              {[
                { name: 'Chicken Breast (cooked)', cal: 165, pro: 31, carb: 0, fat: 3.6, size: '100g' },
                { name: 'Whole Egg (boiled)', cal: 78, pro: 6, carb: 0.6, fat: 5, size: '1 large' },
                { name: 'Oatmeal (cooked)', cal: 150, pro: 5, carb: 27, fat: 2.5, size: '1 bowl' },
                { name: 'Atlantic Salmon (grilled)', cal: 206, pro: 22, carb: 0, fat: 12, size: '100g' },
                { name: 'Banana', cal: 89, pro: 1.1, carb: 23, fat: 0.3, size: '1 medium' },
                { name: 'Apple', cal: 52, pro: 0.3, carb: 14, fat: 0.2, size: '1 medium' },
                { name: 'Greek Yogurt (non-fat)', cal: 130, pro: 15, carb: 6, fat: 0.4, size: '150g' },
                { name: 'Almonds', cal: 164, pro: 6, carb: 6, fat: 14, size: '30g' },
              ]
                .filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((food, idx) => (
                  <View key={idx} style={styles.foodResultItem}>
                    <View style={styles.foodInfo}>
                      <Text style={styles.foodName}>{food.name}</Text>
                      <Text style={styles.foodMacros}>
                        {food.cal} kcal • P: {food.pro}g • C: {food.carb}g • F: {food.fat}g ({food.size})
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.logFoodBtn}
                      onPress={() => {
                        logMealMutation.mutate({
                          mealType: 'snack',
                          name: food.name,
                          calories: food.cal,
                          protein: food.pro,
                          carbs: food.carb,
                          fat: food.fat,
                        });
                        Alert.alert('Logged!', `${food.name} added to snacks.`);
                        setShowSearch(false);
                        setSearchQuery('');
                      }}
                    >
                      <Text style={styles.logFoodBtnText}>+ Log</Text>
                    </TouchableOpacity>
                  </View>
                ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => { setShowSearch(false); setSearchQuery(''); }}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#12110D',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  bodyContent: {
    paddingHorizontal: 20,
  },
  floatingChatBtn: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFD60A',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#12110D',
  },
  floatingChatBtnText: {
    fontSize: 24,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalCard: {
    width: '90%',
    maxWidth: 360,
    backgroundColor: '#1E1D1A',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  modalScroll: {
    marginBottom: 16,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2C28',
  },
  notifDot: {
    color: '#FFD60A',
    fontSize: 16,
  },
  notifTextWrap: {
    flex: 1,
    gap: 2,
  },
  notifHeading: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  notifTime: {
    color: '#666',
    fontSize: 10,
  },
  searchBar: {
    backgroundColor: '#0F0E0D',
    borderColor: '#2D2C28',
    borderWidth: 1,
    borderRadius: 14,
    height: 44,
    paddingHorizontal: 16,
    color: '#FFF',
    fontSize: 13,
    marginBottom: 16,
    outlineStyle: 'none',
  },
  foodResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2C28',
    gap: 12,
  },
  foodInfo: {
    flex: 1,
    gap: 2,
  },
  foodName: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  foodMacros: {
    color: '#A6A090',
    fontSize: 11,
  },
  logFoodBtn: {
    backgroundColor: 'rgba(255, 214, 10, 0.15)',
    borderColor: 'rgba(255, 214, 10, 0.3)',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  logFoodBtnText: {
    color: '#FFD60A',
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    backgroundColor: '#FFD60A',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#12110D',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});

export default NutritionScreen;
