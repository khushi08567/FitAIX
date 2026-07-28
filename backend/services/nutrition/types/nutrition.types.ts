// ─── Nutrition Backend Types ────────────────────────────────────────────────

export interface DailyNutrition {
  userId: string;
  date: string; // ISO date string YYYY-MM-DD
  caloriesConsumed: number;
  caloriesGoal: number;
  protein: { consumed: number; goal: number };
  carbs: { consumed: number; goal: number };
  fat: { consumed: number; goal: number };
  fiber: { consumed: number; goal: number };
}

export interface MacroData {
  protein: { consumed: number; goal: number; unit: 'g' };
  carbs: { consumed: number; goal: number; unit: 'g' };
  fat: { consumed: number; goal: number; unit: 'g' };
}

export interface BMIData {
  userId: string;
  weight: number; // kg
  height: number; // cm
  bmi: number;
  category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  healthyRange: { min: number; max: number };
  aiSuggestion: string;
  updatedAt: string;
}

export interface NutritionStrategy {
  userId: string;
  targetCalories: number;
  proteinGoal: number; // g
  hydrationGoal: number; // ml
  weeklyGoal: string;
  aiExplanation: string;
  generatedAt: string;
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

export interface AIMealRecommendation {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  cookingTime: number; // minutes
  imageUrl: string;
  ingredients: string[];
  aiReason: string;
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
  currentIntake: number; // ml
  goal: number; // ml
  logs: HydrationLog[];
}

export interface HydrationLog {
  id: string;
  amount: number; // ml
  loggedAt: string;
}

export interface BudgetData {
  userId: string;
  weeklyBudget: number;
  spent: number;
  remaining: number;
  currency: string;
  aiSuggestion: string;
  breakdown: BudgetBreakdown[];
}

export interface BudgetBreakdown {
  day: string;
  amount: number;
}

export interface GroceryGenerationRequest {
  userId: string;
  reuseIngredients: boolean;
  budgetLimit?: number;
  preferences?: string[];
}

export interface GroceryGenerationResult {
  estimatedCost: number;
  wasteReductionPercent: number;
  items: GroceryItem[];
  generatedAt: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  estimatedCost: number;
  category: string;
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

export interface FoodPreferences {
  userId: string;
  dietaryPreferences: DietaryPreference[];
  allergies: string[];
  favoriteFoods: string[];
  updatedAt: string;
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

export interface AddHydrationRequest {
  userId: string;
  amount: number; // ml
}

export interface LogMealRequest {
  userId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: number;
  unit?: string;
}

export interface UpdateBMIRequest {
  userId: string;
  weight: number;
  height: number;
}

export interface SavePreferencesRequest {
  userId: string;
  dietaryPreferences: DietaryPreference[];
  allergies: string[];
  favoriteFoods: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  timestamp: string;
}
