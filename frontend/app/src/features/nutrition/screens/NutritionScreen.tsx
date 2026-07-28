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
  const [showChat, setShowChat] = useState(false);

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

  // ─── Direct Hydration Action (Optimistic) ───────────────────────────────────
  const handleAddWater = useCallback((amount: number) => {
    store.optimisticAddHydration(amount);
  }, [store]);

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
          onNotificationPress={() => Alert.alert('Notifications', 'You have 3 new AI recommendations.')}
          onSearchPress={() => Alert.alert('Search', 'Food database search active.')}
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

      {/* Bottom Navigation */}
      <BottomNav activeTab="Nutrition" />

      {/* Floating Rachel AI Coach Chat button */}
      <TouchableOpacity
        style={styles.floatingChatBtn}
        onPress={() => setShowChat(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.floatingChatBtnText}>🤖</Text>
      </TouchableOpacity>

      {/* Coach Chat Overlay */}
      <RachelChatModal visible={showChat} onClose={() => setShowChat(false)} />
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
});

export default NutritionScreen;
