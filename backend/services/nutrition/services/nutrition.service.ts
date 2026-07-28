// ─── Nutrition Business Logic Service ────────────────────────────────────────
import { v4 as uuidv4 } from 'uuid';
import {
  dailyNutritionStore,
  bmiStore,
  strategyStore,
  mealLogStore,
  hydrationStore,
  budgetStore,
  shoppingStore,
  preferencesStore,
  recommendedMealsData,
  getOrCreateHydration,
  getOrCreateShoppingList,
} from '../models/nutrition.model';
import { generateBMISuggestion } from './ai.nutrition.service';
import type {
  DailyNutrition,
  BMIData,
  NutritionStrategy,
  MealEntry,
  HydrationData,
  BudgetData,
  ShoppingItem,
  FoodPreferences,
  RecommendedMeal,
  LogMealRequest,
  AddHydrationRequest,
  UpdateBMIRequest,
  SavePreferencesRequest,
} from '../types/nutrition.types';

// ─── Daily Nutrition ─────────────────────────────────────────────────────────

export function getDailyNutrition(userId: string): DailyNutrition {
  const today = new Date().toISOString().split('T')[0];
  if (!dailyNutritionStore.has(userId)) {
    dailyNutritionStore.set(userId, {
      userId,
      date: today,
      caloriesConsumed: 0,
      caloriesGoal: 2000,
      protein: { consumed: 0, goal: 150 },
      carbs: { consumed: 0, goal: 200 },
      fat: { consumed: 0, goal: 65 },
      fiber: { consumed: 0, goal: 30 },
    });
  }
  return dailyNutritionStore.get(userId)!;
}

// ─── BMI ─────────────────────────────────────────────────────────────────────

export function getBMI(userId: string): BMIData {
  if (!bmiStore.has(userId)) {
    const defaultBMI: BMIData = {
      userId,
      weight: 70,
      height: 170,
      bmi: 24.2,
      category: 'Normal',
      healthyRange: { min: 18.5, max: 24.9 },
      aiSuggestion: generateBMISuggestion(24.2, 'Normal'),
      updatedAt: new Date().toISOString(),
    };
    bmiStore.set(userId, defaultBMI);
  }
  return bmiStore.get(userId)!;
}

export function updateBMI(req: UpdateBMIRequest): BMIData {
  const { userId, weight, height } = req;
  const heightM = height / 100;
  const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));

  let category: BMIData['category'];
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';

  const updated: BMIData = {
    userId,
    weight,
    height,
    bmi,
    category,
    healthyRange: { min: 18.5, max: 24.9 },
    aiSuggestion: generateBMISuggestion(bmi, category),
    updatedAt: new Date().toISOString(),
  };
  bmiStore.set(userId, updated);
  return updated;
}

// ─── Strategy ────────────────────────────────────────────────────────────────

export function getNutritionStrategy(userId: string): NutritionStrategy {
  if (!strategyStore.has(userId)) {
    const defaultStrategy: NutritionStrategy = {
      userId,
      targetCalories: 2000,
      proteinGoal: 150,
      hydrationGoal: 2500,
      weeklyGoal: 'Maintain healthy weight',
      aiExplanation: 'Based on standard activity level, this baseline plan supports overall health.',
      generatedAt: new Date().toISOString(),
    };
    strategyStore.set(userId, defaultStrategy);
  }
  return strategyStore.get(userId)!;
}

// ─── Meal Logging ─────────────────────────────────────────────────────────────

export function getMealLogs(userId: string, mealType?: string): MealEntry[] {
  const logs = mealLogStore.filter((m) => m.userId === userId);
  if (mealType) return logs.filter((m) => m.mealType === mealType);
  return logs;
}

export function logMeal(req: LogMealRequest): MealEntry {
  const newEntry: MealEntry = {
    id: uuidv4(),
    userId: req.userId,
    mealType: req.mealType,
    name: req.name,
    calories: req.calories,
    protein: req.protein,
    carbs: req.carbs,
    fat: req.fat,
    servingSize: req.servingSize ?? 1,
    unit: req.unit ?? 'serving',
    loggedAt: new Date().toISOString(),
  };

  mealLogStore.push(newEntry);

  // Update daily nutrition totals
  const daily = getDailyNutrition(req.userId);
  daily.caloriesConsumed += req.calories;
  daily.protein.consumed += req.protein;
  daily.carbs.consumed += req.carbs;
  daily.fat.consumed += req.fat;
  dailyNutritionStore.set(req.userId, daily);

  return newEntry;
}

export function deleteMealLog(mealId: string): boolean {
  const index = mealLogStore.findIndex((m) => m.id === mealId);
  if (index === -1) return false;
  mealLogStore.splice(index, 1);
  return true;
}

export function getRecommendedMeals(): RecommendedMeal[] {
  return recommendedMealsData;
}

// ─── Hydration ────────────────────────────────────────────────────────────────

export function getHydration(userId: string): HydrationData {
  return getOrCreateHydration(userId);
}

export function addHydration(req: AddHydrationRequest): HydrationData {
  const data = getOrCreateHydration(req.userId);
  const newLog = { id: uuidv4(), amount: req.amount, loggedAt: new Date().toISOString() };
  data.logs.push(newLog);
  data.currentIntake += req.amount;
  hydrationStore.set(req.userId, data);
  return data;
}

// ─── Budget ──────────────────────────────────────────────────────────────────

export function getBudget(userId: string): BudgetData {
  if (!budgetStore.has(userId)) {
    budgetStore.set(userId, {
      userId,
      weeklyBudget: 2500,
      spent: 0,
      remaining: 2500,
      currency: 'INR',
      aiSuggestion: 'Start tracking your spending to get AI-powered cost optimization tips.',
      breakdown: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({ day, amount: 0 })),
    });
  }
  return budgetStore.get(userId)!;
}

// ─── Shopping ────────────────────────────────────────────────────────────────

export function getShoppingList(userId: string): ShoppingItem[] {
  return getOrCreateShoppingList(userId);
}

export function toggleShoppingItem(itemId: string): ShoppingItem | null {
  for (const [userId, list] of shoppingStore.entries()) {
    const item = list.find((i) => i.id === itemId);
    if (item) {
      item.isChecked = !item.isChecked;
      shoppingStore.set(userId, list);
      return item;
    }
  }
  return null;
}

export function addShoppingItems(userId: string, items: Omit<ShoppingItem, 'id' | 'userId' | 'isChecked'>[]): ShoppingItem[] {
  const list = getOrCreateShoppingList(userId);
  const newItems: ShoppingItem[] = items.map((item) => ({
    ...item,
    id: uuidv4(),
    userId,
    isChecked: false,
  }));
  list.push(...newItems);
  shoppingStore.set(userId, list);
  return newItems;
}

// ─── Preferences ─────────────────────────────────────────────────────────────

export function getPreferences(userId: string): FoodPreferences {
  if (!preferencesStore.has(userId)) {
    preferencesStore.set(userId, {
      userId,
      dietaryPreferences: [],
      allergies: [],
      favoriteFoods: [],
      updatedAt: new Date().toISOString(),
    });
  }
  return preferencesStore.get(userId)!;
}

export function savePreferences(req: SavePreferencesRequest): FoodPreferences {
  const updated: FoodPreferences = {
    userId: req.userId,
    dietaryPreferences: req.dietaryPreferences,
    allergies: req.allergies,
    favoriteFoods: req.favoriteFoods,
    updatedAt: new Date().toISOString(),
  };
  preferencesStore.set(req.userId, updated);
  return updated;
}
