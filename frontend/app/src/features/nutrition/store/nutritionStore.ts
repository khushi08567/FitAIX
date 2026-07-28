// ─── Nutrition Zustand Store ──────────────────────────────────────────────────
import { create } from 'zustand';
import type {
  DailyNutrition,
  BMIData,
  NutritionStrategy,
  HydrationData,
  BudgetData,
  MealEntry,
  ShoppingListData,
  FoodPreferences,
  AIMealRecommendation,
  RecommendedMeal,
  ShoppingItem,
} from '../types/nutrition.types';

// ─── UI State ─────────────────────────────────────────────────────────────────
export type MealTab = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface UIState {
  activeMealTab: MealTab;
  isMealLoggerExpanded: boolean;
  isStrategyExpanded: boolean;
  isGroceryGenerating: boolean;
  showMealLogModal: boolean;
}

// ─── Data State ───────────────────────────────────────────────────────────────
interface DataState {
  daily: DailyNutrition | null;
  bmi: BMIData | null;
  strategy: NutritionStrategy | null;
  hydration: HydrationData | null;
  budget: BudgetData | null;
  mealLogs: MealEntry[];
  shoppingList: ShoppingListData | null;
  preferences: FoodPreferences | null;
  aiMeals: AIMealRecommendation[];
  recommendedMeals: RecommendedMeal[];
}

// ─── Actions ──────────────────────────────────────────────────────────────────
interface Actions {
  // UI
  setActiveMealTab: (tab: MealTab) => void;
  setMealLoggerExpanded: (expanded: boolean) => void;
  setStrategyExpanded: (expanded: boolean) => void;
  setGroceryGenerating: (val: boolean) => void;
  setShowMealLogModal: (val: boolean) => void;

  // Data setters (React Query feeds into these for local mutations)
  setDaily: (data: DailyNutrition) => void;
  setBMI: (data: BMIData) => void;
  setStrategy: (data: NutritionStrategy) => void;
  setHydration: (data: HydrationData) => void;
  setBudget: (data: BudgetData) => void;
  setMealLogs: (logs: MealEntry[]) => void;
  setShoppingList: (data: ShoppingListData) => void;
  setPreferences: (prefs: FoodPreferences) => void;
  setAIMeals: (meals: AIMealRecommendation[]) => void;
  setRecommendedMeals: (meals: RecommendedMeal[]) => void;

  // Optimistic mutations
  optimisticAddHydration: (amount: number) => void;
  optimisticToggleShoppingItem: (itemId: string) => void;
  optimisticAddMealLog: (entry: MealEntry) => void;
  optimisticRemoveMealLog: (mealId: string) => void;

  // Reset
  reset: () => void;
}

// ─── Initial State ────────────────────────────────────────────────────────────
const initialUIState: UIState = {
  activeMealTab: 'breakfast',
  isMealLoggerExpanded: false,
  isStrategyExpanded: false,
  isGroceryGenerating: false,
  showMealLogModal: false,
};

const initialDataState: DataState = {
  daily: null,
  bmi: null,
  strategy: null,
  hydration: null,
  budget: null,
  mealLogs: [],
  shoppingList: null,
  preferences: null,
  aiMeals: [],
  recommendedMeals: [],
};

// ─── Store ────────────────────────────────────────────────────────────────────
export const useNutritionStore = create<UIState & DataState & Actions>((set, get) => ({
  ...initialUIState,
  ...initialDataState,

  // ─ UI ─────────────────────────────────────────────────────────────────────
  setActiveMealTab: (tab) => set({ activeMealTab: tab }),
  setMealLoggerExpanded: (expanded) => set({ isMealLoggerExpanded: expanded }),
  setStrategyExpanded: (expanded) => set({ isStrategyExpanded: expanded }),
  setGroceryGenerating: (val) => set({ isGroceryGenerating: val }),
  setShowMealLogModal: (val) => set({ showMealLogModal: val }),

  // ─ Data setters ───────────────────────────────────────────────────────────
  setDaily: (data) => set({ daily: data }),
  setBMI: (data) => set({ bmi: data }),
  setStrategy: (data) => set({ strategy: data }),
  setHydration: (data) => set({ hydration: data }),
  setBudget: (data) => set({ budget: data }),
  setMealLogs: (logs) => set({ mealLogs: logs }),
  setShoppingList: (data) => set({ shoppingList: data }),
  setPreferences: (prefs) => set({ preferences: prefs }),
  setAIMeals: (meals) => set({ aiMeals: meals }),
  setRecommendedMeals: (meals) => set({ recommendedMeals: meals }),

  // ─ Optimistic Hydration ───────────────────────────────────────────────────
  optimisticAddHydration: (amount) => {
    const { hydration } = get();
    if (!hydration) return;
    set({
      hydration: {
        ...hydration,
        currentIntake: Math.min(hydration.currentIntake + amount, hydration.goal),
        logs: [
          ...hydration.logs,
          { id: `optimistic_${Date.now()}`, amount, loggedAt: new Date().toISOString() },
        ],
      },
    });
  },

  // ─ Optimistic Shopping Toggle ──────────────────────────────────────────────
  optimisticToggleShoppingItem: (itemId) => {
    const { shoppingList } = get();
    if (!shoppingList) return;
    const updatedItems = shoppingList.items.map((item): ShoppingItem =>
      item.id === itemId ? { ...item, isChecked: !item.isChecked } : item,
    );
    const checkedCount = updatedItems.filter((i) => i.isChecked).length;
    set({ shoppingList: { ...shoppingList, items: updatedItems, checkedCount } });
  },

  // ─ Optimistic Meal Log ────────────────────────────────────────────────────
  optimisticAddMealLog: (entry) => {
    const { mealLogs, daily } = get();
    set({ mealLogs: [entry, ...mealLogs] });
    if (daily) {
      set({
        daily: {
          ...daily,
          caloriesConsumed: daily.caloriesConsumed + entry.calories,
          protein: { ...daily.protein, consumed: daily.protein.consumed + entry.protein },
          carbs: { ...daily.carbs, consumed: daily.carbs.consumed + entry.carbs },
          fat: { ...daily.fat, consumed: daily.fat.consumed + entry.fat },
        },
      });
    }
  },

  optimisticRemoveMealLog: (mealId) => {
    const { mealLogs } = get();
    set({ mealLogs: mealLogs.filter((m) => m.id !== mealId) });
  },

  // ─ Reset ──────────────────────────────────────────────────────────────────
  reset: () => set({ ...initialUIState, ...initialDataState }),
}));
