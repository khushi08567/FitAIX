// ─── In-Memory Data Store (replace with DB in production) ───────────────────
import { v4 as uuidv4 } from 'uuid';
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
} from '../types/nutrition.types';

// ─── Seed Data ───────────────────────────────────────────────────────────────

const today = new Date().toISOString().split('T')[0];

export const dailyNutritionStore: Map<string, DailyNutrition> = new Map([
  [
    'user_001',
    {
      userId: 'user_001',
      date: today,
      caloriesConsumed: 1480,
      caloriesGoal: 2200,
      protein: { consumed: 87, goal: 165 },
      carbs: { consumed: 172, goal: 220 },
      fat: { consumed: 42, goal: 73 },
      fiber: { consumed: 18, goal: 30 },
    },
  ],
]);

export const bmiStore: Map<string, BMIData> = new Map([
  [
    'user_001',
    {
      userId: 'user_001',
      weight: 75,
      height: 178,
      bmi: 23.7,
      category: 'Normal',
      healthyRange: { min: 18.5, max: 24.9 },
      aiSuggestion:
        'Your BMI is in the healthy range. Focus on building lean muscle to maintain your optimal body composition.',
      updatedAt: new Date().toISOString(),
    },
  ],
]);

export const strategyStore: Map<string, NutritionStrategy> = new Map([
  [
    'user_001',
    {
      userId: 'user_001',
      targetCalories: 2200,
      proteinGoal: 165,
      hydrationGoal: 3000,
      weeklyGoal: 'Lose 0.5 kg while maintaining muscle mass',
      aiExplanation:
        'Based on your weight, activity level, and goal, I have set a moderate caloric deficit of 300 kcal/day. High protein intake will preserve muscle while you lose fat. Hydration target accounts for your training intensity.',
      generatedAt: new Date().toISOString(),
    },
  ],
]);

export const mealLogStore: MealEntry[] = [
  {
    id: uuidv4(),
    userId: 'user_001',
    mealType: 'breakfast',
    name: 'Oatmeal with Berries',
    calories: 380,
    protein: 14,
    carbs: 62,
    fat: 8,
    servingSize: 1,
    unit: 'bowl',
    loggedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    userId: 'user_001',
    mealType: 'lunch',
    name: 'Grilled Chicken Salad',
    calories: 520,
    protein: 42,
    carbs: 28,
    fat: 18,
    servingSize: 1,
    unit: 'plate',
    loggedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    userId: 'user_001',
    mealType: 'snack',
    name: 'Protein Shake',
    calories: 220,
    protein: 24,
    carbs: 18,
    fat: 4,
    servingSize: 1,
    unit: 'scoop',
    loggedAt: new Date().toISOString(),
  },
];

export const hydrationStore: Map<string, HydrationData> = new Map([
  [
    'user_001',
    {
      userId: 'user_001',
      date: today,
      currentIntake: 1750,
      goal: 3000,
      logs: [
        { id: uuidv4(), amount: 500, loggedAt: new Date().toISOString() },
        { id: uuidv4(), amount: 750, loggedAt: new Date().toISOString() },
        { id: uuidv4(), amount: 500, loggedAt: new Date().toISOString() },
      ],
    },
  ],
]);

export const budgetStore: Map<string, BudgetData> = new Map([
  [
    'user_001',
    {
      userId: 'user_001',
      weeklyBudget: 3500,
      spent: 2100,
      remaining: 1400,
      currency: 'INR',
      aiSuggestion:
        'You are on track with your budget. Consider buying vegetables in bulk on weekends to save 15-20%.',
      breakdown: [
        { day: 'Mon', amount: 420 },
        { day: 'Tue', amount: 380 },
        { day: 'Wed', amount: 450 },
        { day: 'Thu', amount: 310 },
        { day: 'Fri', amount: 540 },
        { day: 'Sat', amount: 0 },
        { day: 'Sun', amount: 0 },
      ],
    },
  ],
]);

export const shoppingStore: Map<string, ShoppingItem[]> = new Map([
  [
    'user_001',
    [
      {
        id: uuidv4(),
        userId: 'user_001',
        name: 'Chicken Breast',
        quantity: '500',
        unit: 'g',
        estimatedCost: 280,
        category: 'Protein',
        isChecked: true,
      },
      {
        id: uuidv4(),
        userId: 'user_001',
        name: 'Rolled Oats',
        quantity: '1',
        unit: 'kg',
        estimatedCost: 120,
        category: 'Grains',
        isChecked: true,
      },
      {
        id: uuidv4(),
        userId: 'user_001',
        name: 'Spinach',
        quantity: '200',
        unit: 'g',
        estimatedCost: 40,
        category: 'Vegetables',
        isChecked: false,
      },
      {
        id: uuidv4(),
        userId: 'user_001',
        name: 'Greek Yogurt',
        quantity: '400',
        unit: 'g',
        estimatedCost: 160,
        category: 'Dairy',
        isChecked: false,
      },
      {
        id: uuidv4(),
        userId: 'user_001',
        name: 'Brown Rice',
        quantity: '1',
        unit: 'kg',
        estimatedCost: 95,
        category: 'Grains',
        isChecked: false,
      },
      {
        id: uuidv4(),
        userId: 'user_001',
        name: 'Almonds',
        quantity: '200',
        unit: 'g',
        estimatedCost: 220,
        category: 'Nuts',
        isChecked: false,
      },
      {
        id: uuidv4(),
        userId: 'user_001',
        name: 'Eggs',
        quantity: '12',
        unit: 'pcs',
        estimatedCost: 96,
        category: 'Protein',
        isChecked: false,
      },
      {
        id: uuidv4(),
        userId: 'user_001',
        name: 'Broccoli',
        quantity: '300',
        unit: 'g',
        estimatedCost: 55,
        category: 'Vegetables',
        isChecked: false,
      },
    ],
  ],
]);

export const preferencesStore: Map<string, FoodPreferences> = new Map([
  [
    'user_001',
    {
      userId: 'user_001',
      dietaryPreferences: ['high-protein', 'low-carb'],
      allergies: ['peanuts'],
      favoriteFoods: ['grilled chicken', 'oatmeal', 'eggs'],
      updatedAt: new Date().toISOString(),
    },
  ],
]);

export const recommendedMealsData: RecommendedMeal[] = [
  {
    id: uuidv4(),
    name: 'Paneer Tikka Bowl',
    calories: 420,
    protein: 28,
    carbs: 32,
    fat: 18,
    cookingTime: 20,
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
    tags: ['vegetarian', 'high-protein'],
    rating: 4.8,
  },
  {
    id: uuidv4(),
    name: 'Grilled Salmon & Quinoa',
    calories: 540,
    protein: 42,
    carbs: 38,
    fat: 16,
    cookingTime: 25,
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    tags: ['high-protein', 'omega-3'],
    rating: 4.9,
  },
  {
    id: uuidv4(),
    name: 'Avocado Chicken Wrap',
    calories: 480,
    protein: 35,
    carbs: 40,
    fat: 20,
    cookingTime: 15,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    tags: ['balanced', 'meal-prep'],
    rating: 4.7,
  },
  {
    id: uuidv4(),
    name: 'Dal Tadka & Brown Rice',
    calories: 390,
    protein: 18,
    carbs: 58,
    fat: 10,
    cookingTime: 30,
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356c36?w=400',
    tags: ['vegetarian', 'fiber-rich'],
    rating: 4.6,
  },
  {
    id: uuidv4(),
    name: 'Egg White Omelette',
    calories: 280,
    protein: 32,
    carbs: 8,
    fat: 12,
    cookingTime: 10,
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
    tags: ['low-carb', 'quick'],
    rating: 4.5,
  },
];

// ─── Helper: get or create hydration for today ──────────────────────────────
export function getOrCreateHydration(userId: string): HydrationData {
  if (!hydrationStore.has(userId)) {
    const newEntry: HydrationData = {
      userId,
      date: today,
      currentIntake: 0,
      goal: 3000,
      logs: [],
    };
    hydrationStore.set(userId, newEntry);
    return newEntry;
  }
  return hydrationStore.get(userId)!;
}

// ─── Helper: get or create shopping list ────────────────────────────────────
export function getOrCreateShoppingList(userId: string): ShoppingItem[] {
  if (!shoppingStore.has(userId)) {
    shoppingStore.set(userId, []);
  }
  return shoppingStore.get(userId)!;
}
