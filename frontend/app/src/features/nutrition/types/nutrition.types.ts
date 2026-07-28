// ─── Nutrition TypeScript Types (Frontend) ───────────────────────────────────

export interface DailyNutrition {
  userId: string;
  date: string;
  caloriesConsumed: number;
  caloriesGoal: number;
  protein: MacroField;
  carbs: MacroField;
  fat: MacroField;
  fiber: MacroField;
}

export interface MacroField {
  consumed: number;
  goal: number;
}

export interface MacroData {
  protein: MacroField;
  carbs: MacroField;
  fat: MacroField;
}

export interface BMIData {
  userId: string;
  weight: number;
  height: number;
  bmi: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  healthyRange: { min: number; max: number };
  aiSuggestion: string;
  updatedAt: string;
}

export interface NutritionStrategy {
  userId: string;
  targetCalories: number;
  proteinGoal: number;
  hydrationGoal: number;
  weeklyGoal: string;
  aiExplanation: string;
  generatedAt: string;
}

export interface AIMealRecommendation {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  cookingTime: number;
  imageUrl: string;
  ingredients: string[];
  aiReason: string;
}

export interface MealEntry {
  id: string;
  userId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  unit: string;
  loggedAt: string;
}

export interface RecommendedMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  cookingTime: number;
  imageUrl: string;
  tags: string[];
  rating: number;
}

export interface HydrationData {
  userId: string;
  date: string;
  currentIntake: number;
  goal: number;
  logs: HydrationLog[];
}

export interface HydrationLog {
  id: string;
  amount: number;
  loggedAt: string;
}

export interface BudgetData {
  userId: string;
  weeklyBudget: number;
  spent: number;
  remaining: number;
  currency: string;
  aiSuggestion: string;
  breakdown: DayBreakdown[];
}

export interface DayBreakdown {
  day: string;
  amount: number;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  estimatedCost: number;
  category: string;
}

export interface GroceryGenerationResult {
  estimatedCost: number;
  wasteReductionPercent: number;
  items: GroceryItem[];
  generatedAt: string;
}

export interface ShoppingItem {
  id: string;
  userId: string;
  name: string;
  quantity: string;
  unit: string;
  estimatedCost: number;
  category: string;
  isChecked: boolean;
}

export interface ShoppingListData {
  items: ShoppingItem[];
  totalCost: number;
  checkedCount: number;
  total: number;
}

export type DietaryPreference =
  | 'vegetarian'
  | 'vegan'
  | 'halal'
  | 'jain'
  | 'high-protein'
  | 'low-carb'
  | 'keto'
  | 'gluten-free'
  | 'dairy-free';

export interface FoodPreferences {
  userId: string;
  dietaryPreferences: DietaryPreference[];
  allergies: string[];
  favoriteFoods: string[];
  updatedAt: string;
}

export interface LogMealForm {
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionState {
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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}
