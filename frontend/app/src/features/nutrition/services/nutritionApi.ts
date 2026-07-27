// ─── Axios API Client ─────────────────────────────────────────────────────────
import axios from 'axios';
import type {
  ApiResponse,
  DailyNutrition,
  MacroData,
  BMIData,
  NutritionStrategy,
  AIMealRecommendation,
  MealEntry,
  RecommendedMeal,
  HydrationData,
  BudgetData,
  GroceryGenerationResult,
  ShoppingListData,
  FoodPreferences,
  LogMealForm,
  DietaryPreference,
} from '../types/nutrition.types';

// ─── Client Setup ─────────────────────────────────────────────────────────────
const BASE_URL = 'http://localhost:4001/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor (auth token) ────────────────────────────────────────
apiClient.interceptors.request.use((config) => {
  // TODO: replace with real token from auth store
  config.headers.Authorization = 'Bearer mock_token_user_001';
  return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]', error?.response?.data?.message ?? error.message);
    return Promise.reject(error);
  },
);

// ─── Default user ID (replace with auth context in production) ────────────────
const DEFAULT_USER = 'user_001';

// ─── API Functions ────────────────────────────────────────────────────────────

export const nutritionApi = {
  // Daily
  getDailyNutrition: async (userId = DEFAULT_USER): Promise<DailyNutrition> => {
    const res = await apiClient.get<ApiResponse<DailyNutrition>>(`/nutrition/${userId}/daily`);
    return res.data.data;
  },

  getMacros: async (userId = DEFAULT_USER): Promise<MacroData> => {
    const res = await apiClient.get<ApiResponse<MacroData>>(`/nutrition/${userId}/macros`);
    return res.data.data;
  },

  // BMI
  getBMI: async (userId = DEFAULT_USER): Promise<BMIData> => {
    const res = await apiClient.get<ApiResponse<BMIData>>(`/nutrition/${userId}/bmi`);
    return res.data.data;
  },

  updateBMI: async (weight: number, height: number, userId = DEFAULT_USER): Promise<BMIData> => {
    const res = await apiClient.put<ApiResponse<BMIData>>('/nutrition/bmi', { userId, weight, height });
    return res.data.data;
  },

  // AI
  getAIStrategy: async (userId = DEFAULT_USER): Promise<NutritionStrategy> => {
    const res = await apiClient.get<ApiResponse<NutritionStrategy>>(`/nutrition/${userId}/ai-strategy`);
    return res.data.data;
  },

  getAIMeals: async (userId = DEFAULT_USER): Promise<AIMealRecommendation[]> => {
    const res = await apiClient.get<ApiResponse<AIMealRecommendation[]>>(`/nutrition/${userId}/ai-meals`);
    return res.data.data;
  },

  // Meals
  getMealLogs: async (userId = DEFAULT_USER, mealType?: string): Promise<MealEntry[]> => {
    const params = mealType ? { mealType } : undefined;
    const res = await apiClient.get<ApiResponse<MealEntry[]>>(`/nutrition/${userId}/meals`, { params });
    return res.data.data;
  },

  logMeal: async (form: LogMealForm, userId = DEFAULT_USER): Promise<MealEntry> => {
    const res = await apiClient.post<ApiResponse<MealEntry>>('/nutrition/meals/log', { ...form, userId });
    return res.data.data;
  },

  deleteMeal: async (mealId: string): Promise<void> => {
    await apiClient.delete(`/nutrition/meals/${mealId}`);
  },

  getRecommendedMeals: async (): Promise<RecommendedMeal[]> => {
    const res = await apiClient.get<ApiResponse<RecommendedMeal[]>>('/nutrition/meals/recommended');
    return res.data.data;
  },

  // Hydration
  getHydration: async (userId = DEFAULT_USER): Promise<HydrationData> => {
    const res = await apiClient.get<ApiResponse<HydrationData>>(`/nutrition/${userId}/hydration`);
    return res.data.data;
  },

  addHydration: async (amount: number, userId = DEFAULT_USER): Promise<HydrationData> => {
    const res = await apiClient.post<ApiResponse<HydrationData>>('/nutrition/hydration/add', { userId, amount });
    return res.data.data;
  },

  // Budget
  getBudget: async (userId = DEFAULT_USER): Promise<BudgetData> => {
    const res = await apiClient.get<ApiResponse<BudgetData>>(`/nutrition/${userId}/budget`);
    return res.data.data;
  },

  // Grocery
  generateGrocery: async (reuseIngredients: boolean, userId = DEFAULT_USER): Promise<GroceryGenerationResult> => {
    const res = await apiClient.post<ApiResponse<GroceryGenerationResult>>('/nutrition/grocery/generate', {
      userId,
      reuseIngredients,
    });
    return res.data.data;
  },

  // Shopping
  getShoppingList: async (userId = DEFAULT_USER): Promise<ShoppingListData> => {
    const res = await apiClient.get<ApiResponse<ShoppingListData>>(`/nutrition/${userId}/shopping`);
    return res.data.data;
  },

  toggleShoppingItem: async (itemId: string): Promise<void> => {
    await apiClient.patch(`/nutrition/shopping/${itemId}/toggle`);
  },

  // Preferences
  getPreferences: async (userId = DEFAULT_USER): Promise<FoodPreferences> => {
    const res = await apiClient.get<ApiResponse<FoodPreferences>>(`/nutrition/${userId}/preferences`);
    return res.data.data;
  },

  savePreferences: async (
    data: { dietaryPreferences: DietaryPreference[]; allergies: string[]; favoriteFoods: string[] },
    userId = DEFAULT_USER,
  ): Promise<FoodPreferences> => {
    const res = await apiClient.put<ApiResponse<FoodPreferences>>('/nutrition/preferences', {
      ...data,
      userId,
    });
    return res.data.data;
  },
};

export default nutritionApi;
