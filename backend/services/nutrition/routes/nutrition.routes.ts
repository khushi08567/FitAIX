// ─── Nutrition Routes ─────────────────────────────────────────────────────────
import { Router } from 'express';
import {
  getDailyNutritionHandler,
  getMacrosHandler,
  getBMIHandler,
  updateBMIHandler,
  getAIStrategyHandler,
  getAIMealsHandler,
} from '../controllers/nutrition.controller';
import {
  getMealsHandler,
  logMealHandler,
  deleteMealHandler,
  getRecommendedMealsHandler,
} from '../controllers/meals.controller';
import { getHydrationHandler, addHydrationHandler } from '../controllers/hydration.controller';
import { getBudgetHandler } from '../controllers/budget.controller';
import { generateGroceryHandler } from '../controllers/grocery.controller';
import { getShoppingListHandler, toggleItemHandler } from '../controllers/shopping.controller';
import { getPreferencesHandler, savePreferencesHandler } from '../controllers/preferences.controller';
import { registerHandler, loginHandler } from '../controllers/auth.controller';

const router = Router();

// ─── Authentication ───────────────────────────────────────────────────────────
router.post('/auth/register', registerHandler);
router.post('/auth/login', loginHandler);

// ─── Daily Nutrition & Macros ─────────────────────────────────────────────────
router.get('/:userId/daily', getDailyNutritionHandler);
router.get('/:userId/macros', getMacrosHandler);

// ─── BMI ──────────────────────────────────────────────────────────────────────
router.get('/:userId/bmi', getBMIHandler);
router.put('/bmi', updateBMIHandler);

// ─── AI ───────────────────────────────────────────────────────────────────────
router.get('/:userId/ai-strategy', getAIStrategyHandler);
router.get('/:userId/ai-meals', getAIMealsHandler);

// ─── Meals ────────────────────────────────────────────────────────────────────
router.get('/meals/recommended', getRecommendedMealsHandler);
router.get('/:userId/meals', getMealsHandler);
router.post('/meals/log', logMealHandler);
router.delete('/meals/:mealId', deleteMealHandler);

// ─── Hydration ────────────────────────────────────────────────────────────────
router.get('/:userId/hydration', getHydrationHandler);
router.post('/hydration/add', addHydrationHandler);

// ─── Budget ───────────────────────────────────────────────────────────────────
router.get('/:userId/budget', getBudgetHandler);

// ─── Grocery ──────────────────────────────────────────────────────────────────
router.post('/grocery/generate', generateGroceryHandler);

// ─── Shopping ─────────────────────────────────────────────────────────────────
router.get('/:userId/shopping', getShoppingListHandler);
router.patch('/shopping/:itemId/toggle', toggleItemHandler);

// ─── Preferences ──────────────────────────────────────────────────────────────
router.get('/:userId/preferences', getPreferencesHandler);
router.put('/preferences', savePreferencesHandler);

export default router;
