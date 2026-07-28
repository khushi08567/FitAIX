// ─── AI Nutrition Service (Mock LLM Responses) ───────────────────────────────
// Swap generateAIMeals / generateGroceryList with a real LLM call in production.

import type { AIMealRecommendation, GroceryItem } from '../types/nutrition.types';
import { v4 as uuidv4 } from 'uuid';
import { preferencesStore } from '../models/nutrition.model';

const BREAKFAST_POOL: AIMealRecommendation[] = [
  {
    id: uuidv4(),
    mealType: 'breakfast',
    name: 'Masala Omelette with Toast',
    calories: 340,
    protein: 24,
    carbs: 28,
    fat: 12,
    cookingTime: 10,
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400',
    ingredients: ['Eggs', 'Onion', 'Tomato', 'Green chili', 'Whole wheat bread'],
    aiReason: 'High protein breakfast to kickstart muscle protein synthesis. Spices boost metabolism.',
  },
  {
    id: uuidv4(),
    mealType: 'breakfast',
    name: 'Overnight Oats',
    calories: 380,
    protein: 18,
    carbs: 52,
    fat: 9,
    cookingTime: 5,
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
    ingredients: ['Rolled oats', 'Almond milk', 'Chia seeds', 'Blueberries', 'Honey'],
    aiReason: 'Slow-digesting carbs provide sustained energy. Rich in beta-glucan for gut health.',
  },
];

const LUNCH_POOL: AIMealRecommendation[] = [
  {
    id: uuidv4(),
    mealType: 'lunch',
    name: 'Grilled Chicken & Quinoa Bowl',
    calories: 540,
    protein: 48,
    carbs: 42,
    fat: 14,
    cookingTime: 25,
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    ingredients: ['Chicken breast', 'Quinoa', 'Broccoli', 'Olive oil', 'Lemon'],
    aiReason: 'Complete amino acid profile. Quinoa contains all 9 essential amino acids for muscle recovery.',
  },
  {
    id: uuidv4(),
    mealType: 'lunch',
    name: 'Rajma Chawal Bowl',
    calories: 490,
    protein: 22,
    carbs: 68,
    fat: 8,
    cookingTime: 30,
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356c36?w=400',
    ingredients: ['Kidney beans', 'Brown rice', 'Tomatoes', 'Onions', 'Cumin'],
    aiReason: 'Plant-based protein with complex carbs. High fiber supports digestion and satiety.',
  },
];

const DINNER_POOL: AIMealRecommendation[] = [
  {
    id: uuidv4(),
    mealType: 'dinner',
    name: 'Baked Salmon with Steamed Veggies',
    calories: 480,
    protein: 38,
    carbs: 22,
    fat: 22,
    cookingTime: 30,
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    ingredients: ['Salmon fillet', 'Asparagus', 'Bell peppers', 'Garlic', 'Olive oil'],
    aiReason: 'Omega-3 fatty acids reduce inflammation from training. Light dinner supports recovery sleep.',
  },
  {
    id: uuidv4(),
    mealType: 'dinner',
    name: 'Paneer Stir-fry with Roti',
    calories: 520,
    protein: 30,
    carbs: 48,
    fat: 20,
    cookingTime: 20,
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
    ingredients: ['Paneer', 'Bell peppers', 'Whole wheat roti', 'Spices', 'Yogurt'],
    aiReason: 'Casein protein in paneer digests slowly, ideal for overnight muscle repair.',
  },
];

const SNACK_POOL: AIMealRecommendation[] = [
  {
    id: uuidv4(),
    mealType: 'snack',
    name: 'Greek Yogurt with Almonds',
    calories: 220,
    protein: 18,
    carbs: 14,
    fat: 10,
    cookingTime: 2,
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
    ingredients: ['Greek yogurt', 'Almonds', 'Honey'],
    aiReason: 'Pre-workout snack. Probiotics support gut health. Almonds provide sustained energy.',
  },
  {
    id: uuidv4(),
    mealType: 'snack',
    name: 'Protein Shake + Banana',
    calories: 280,
    protein: 26,
    carbs: 32,
    fat: 4,
    cookingTime: 2,
    imageUrl: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400',
    ingredients: ['Whey protein', 'Banana', 'Almond milk'],
    aiReason: 'Post-workout recovery window. Fast carbs replenish glycogen; protein initiates repair.',
  },
];

// ─── Public AI Service Functions ─────────────────────────────────────────────

export function generateAIMeals(userId: string): AIMealRecommendation[] {
  const prefs = preferencesStore.get(userId);
  const isVegetarian = prefs?.dietaryPreferences.map(p => p.toLowerCase()).includes('vegetarian') || false;
  const isVegan = prefs?.dietaryPreferences.map(p => p.toLowerCase()).includes('vegan') || false;

  let breakfastPool = BREAKFAST_POOL;
  let lunchPool = LUNCH_POOL;
  let dinnerPool = DINNER_POOL;
  let snackPool = SNACK_POOL;

  if (isVegetarian || isVegan) {
    breakfastPool = BREAKFAST_POOL.filter(m => m.name !== 'Masala Omelette with Toast');
    lunchPool = LUNCH_POOL.filter(m => m.name !== 'Grilled Chicken & Quinoa Bowl');
    dinnerPool = DINNER_POOL.filter(m => m.name !== 'Baked Salmon with Steamed Veggies');
    if (isVegan) {
      dinnerPool = dinnerPool.filter(m => m.name !== 'Paneer Stir-fry with Roti');
      snackPool = SNACK_POOL.filter(m => m.name !== 'Greek Yogurt with Almonds');
    }
  }

  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  return [
    { ...pick(breakfastPool), id: uuidv4() },
    { ...pick(lunchPool), id: uuidv4() },
    { ...pick(dinnerPool), id: uuidv4() },
    { ...pick(snackPool), id: uuidv4() },
  ];
}

export function generateGroceryItems(reuseIngredients: boolean): GroceryItem[] {
  const base: GroceryItem[] = [
    { id: uuidv4(), name: 'Chicken Breast', quantity: '500', unit: 'g', estimatedCost: 280, category: 'Protein' },
    { id: uuidv4(), name: 'Salmon Fillet', quantity: '400', unit: 'g', estimatedCost: 480, category: 'Protein' },
    { id: uuidv4(), name: 'Eggs', quantity: '12', unit: 'pcs', estimatedCost: 96, category: 'Protein' },
    { id: uuidv4(), name: 'Greek Yogurt', quantity: '400', unit: 'g', estimatedCost: 160, category: 'Dairy' },
    { id: uuidv4(), name: 'Rolled Oats', quantity: '1', unit: 'kg', estimatedCost: 120, category: 'Grains' },
    { id: uuidv4(), name: 'Brown Rice', quantity: '1', unit: 'kg', estimatedCost: 95, category: 'Grains' },
    { id: uuidv4(), name: 'Quinoa', quantity: '500', unit: 'g', estimatedCost: 240, category: 'Grains' },
    { id: uuidv4(), name: 'Spinach', quantity: '200', unit: 'g', estimatedCost: 40, category: 'Vegetables' },
    { id: uuidv4(), name: 'Broccoli', quantity: '300', unit: 'g', estimatedCost: 55, category: 'Vegetables' },
    { id: uuidv4(), name: 'Bell Peppers', quantity: '4', unit: 'pcs', estimatedCost: 80, category: 'Vegetables' },
    { id: uuidv4(), name: 'Almonds', quantity: '200', unit: 'g', estimatedCost: 220, category: 'Nuts' },
    { id: uuidv4(), name: 'Olive Oil', quantity: '500', unit: 'ml', estimatedCost: 280, category: 'Oils' },
  ];

  // If reuseIngredients, trim overlapping items to simulate optimization
  if (reuseIngredients) {
    return base.filter((_, i) => i % 3 !== 2); // Remove every 3rd for demo
  }
  return base;
}

export function estimateGroceryCost(items: GroceryItem[]): number {
  return items.reduce((sum, item) => sum + item.estimatedCost, 0);
}

export function calculateWasteReduction(reuseIngredients: boolean): number {
  return reuseIngredients ? 28 : 0; // 28% waste reduction with ingredient reuse
}

export function generateBMISuggestion(bmi: number, category: string): string {
  const suggestions: Record<string, string> = {
    Underweight:
      'Your BMI indicates you are underweight. I recommend a caloric surplus of 300-500 kcal/day with high protein intake to build lean mass. Focus on nutrient-dense whole foods.',
    Normal:
      'Your BMI is in the healthy range! Maintain this by balancing your caloric intake with activity level. Focus on body composition — building muscle while keeping fat in check.',
    Overweight:
      'A moderate caloric deficit of 300-500 kcal/day combined with resistance training will help you reach your optimal weight. Prioritize protein to prevent muscle loss.',
    Obese:
      'I recommend consulting a nutritionist for a personalized plan. Start with a 500 kcal deficit and low-impact exercise. Focus on whole foods and eliminate processed sugars.',
  };
  return suggestions[category] || 'Maintain a balanced diet with adequate protein and stay hydrated.';
}
