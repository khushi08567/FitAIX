// ─── React Query Hooks for Nutrition Data ─────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { nutritionApi } from '../services/nutritionApi';
import { useNutritionStore } from '../store/nutritionStore';
import type { LogMealForm, DietaryPreference } from '../types/nutrition.types';

const KEYS = {
  daily: (uid: string) => ['nutrition', 'daily', uid],
  macros: (uid: string) => ['nutrition', 'macros', uid],
  bmi: (uid: string) => ['nutrition', 'bmi', uid],
  strategy: (uid: string) => ['nutrition', 'strategy', uid],
  aiMeals: (uid: string) => ['nutrition', 'aiMeals', uid],
  mealLogs: (uid: string) => ['nutrition', 'mealLogs', uid],
  recommended: () => ['nutrition', 'recommendedMeals'],
  hydration: (uid: string) => ['nutrition', 'hydration', uid],
  budget: (uid: string) => ['nutrition', 'budget', uid],
  shopping: (uid: string) => ['nutrition', 'shopping', uid],
  preferences: (uid: string) => ['nutrition', 'preferences', uid],
};

const USER_ID = 'user_001';

// ─── Daily Nutrition ──────────────────────────────────────────────────────────
export function useDailyNutrition() {
  const setDaily = useNutritionStore((s) => s.setDaily);
  const query = useQuery({
    queryKey: KEYS.daily(USER_ID),
    queryFn: () => nutritionApi.getDailyNutrition(USER_ID),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (query.data) setDaily(query.data);
  }, [query.data, setDaily]);

  return query;
}

// ─── BMI ──────────────────────────────────────────────────────────────────────
export function useBMI() {
  const setBMI = useNutritionStore((s) => s.setBMI);
  const query = useQuery({
    queryKey: KEYS.bmi(USER_ID),
    queryFn: () => nutritionApi.getBMI(USER_ID),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (query.data) setBMI(query.data);
  }, [query.data, setBMI]);

  return query;
}

export function useUpdateBMI() {
  const qc = useQueryClient();
  const setBMI = useNutritionStore((s) => s.setBMI);
  return useMutation({
    mutationFn: ({ weight, height }: { weight: number; height: number }) =>
      nutritionApi.updateBMI(weight, height, USER_ID),
    onSuccess: (data) => {
      setBMI(data);
      qc.invalidateQueries({ queryKey: KEYS.bmi(USER_ID) });
    },
  });
}

// ─── AI Strategy ──────────────────────────────────────────────────────────────
export function useAIStrategy() {
  const setStrategy = useNutritionStore((s) => s.setStrategy);
  const query = useQuery({
    queryKey: KEYS.strategy(USER_ID),
    queryFn: () => nutritionApi.getAIStrategy(USER_ID),
    staleTime: 10 * 60_000,
  });

  useEffect(() => {
    if (query.data) setStrategy(query.data);
  }, [query.data, setStrategy]);

  return query;
}

// ─── AI Meals ─────────────────────────────────────────────────────────────────
export function useAIMeals() {
  const setAIMeals = useNutritionStore((s) => s.setAIMeals);
  const query = useQuery({
    queryKey: KEYS.aiMeals(USER_ID),
    queryFn: () => nutritionApi.getAIMeals(USER_ID),
    staleTime: 15 * 60_000,
  });

  useEffect(() => {
    if (query.data) setAIMeals(query.data);
  }, [query.data, setAIMeals]);

  return query;
}

export function useRegenerateAIMeals() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => nutritionApi.getAIMeals(USER_ID),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.aiMeals(USER_ID) }),
  });
}

// ─── Meal Logs ────────────────────────────────────────────────────────────────
export function useMealLogs() {
  const setMealLogs = useNutritionStore((s) => s.setMealLogs);
  const query = useQuery({
    queryKey: KEYS.mealLogs(USER_ID),
    queryFn: () => nutritionApi.getMealLogs(USER_ID),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (query.data) setMealLogs(query.data);
  }, [query.data, setMealLogs]);

  return query;
}

export function useLogMeal() {
  const qc = useQueryClient();
  const optimisticAdd = useNutritionStore((s) => s.optimisticAddMealLog);
  return useMutation({
    mutationFn: (form: LogMealForm) => nutritionApi.logMeal(form, USER_ID),
    onMutate: (form) => {
      optimisticAdd({
        id: `temp_${Date.now()}`,
        userId: USER_ID,
        ...form,
        servingSize: 1,
        unit: 'serving',
        loggedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.mealLogs(USER_ID) });
      qc.invalidateQueries({ queryKey: KEYS.daily(USER_ID) });
    },
  });
}

export function useDeleteMeal() {
  const qc = useQueryClient();
  const optimisticRemove = useNutritionStore((s) => s.optimisticRemoveMealLog);
  return useMutation({
    mutationFn: (mealId: string) => nutritionApi.deleteMeal(mealId),
    onMutate: (mealId) => optimisticRemove(mealId),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.mealLogs(USER_ID) }),
  });
}

// ─── Recommended Meals ────────────────────────────────────────────────────────
export function useRecommendedMeals() {
  const setRecommendedMeals = useNutritionStore((s) => s.setRecommendedMeals);
  const query = useQuery({
    queryKey: KEYS.recommended(),
    queryFn: () => nutritionApi.getRecommendedMeals(),
    staleTime: 30 * 60_000,
  });

  useEffect(() => {
    if (query.data) setRecommendedMeals(query.data);
  }, [query.data, setRecommendedMeals]);

  return query;
}

// ─── Hydration ────────────────────────────────────────────────────────────────
export function useHydration() {
  const setHydration = useNutritionStore((s) => s.setHydration);
  const query = useQuery({
    queryKey: KEYS.hydration(USER_ID),
    queryFn: () => nutritionApi.getHydration(USER_ID),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (query.data) setHydration(query.data);
  }, [query.data, setHydration]);

  return query;
}

// ─── Budget ───────────────────────────────────────────────────────────────────
export function useBudget() {
  const setBudget = useNutritionStore((s) => s.setBudget);
  const query = useQuery({
    queryKey: KEYS.budget(USER_ID),
    queryFn: () => nutritionApi.getBudget(USER_ID),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (query.data) setBudget(query.data);
  }, [query.data, setBudget]);

  return query;
}

// ─── Shopping ─────────────────────────────────────────────────────────────────
export function useShoppingList() {
  const setShoppingList = useNutritionStore((s) => s.setShoppingList);
  const query = useQuery({
    queryKey: KEYS.shopping(USER_ID),
    queryFn: () => nutritionApi.getShoppingList(USER_ID),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (query.data) setShoppingList(query.data);
  }, [query.data, setShoppingList]);

  return query;
}

export function useToggleShoppingItem() {
  const qc = useQueryClient();
  const optimistic = useNutritionStore((s) => s.optimisticToggleShoppingItem);
  return useMutation({
    mutationFn: (itemId: string) => nutritionApi.toggleShoppingItem(itemId),
    onMutate: optimistic,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.shopping(USER_ID) }),
  });
}

// ─── Grocery Generator ────────────────────────────────────────────────────────
export function useGenerateGrocery() {
  const qc = useQueryClient();
  const setGenerating = useNutritionStore((s) => s.setGroceryGenerating);
  return useMutation({
    mutationFn: (reuseIngredients: boolean) => nutritionApi.generateGrocery(reuseIngredients, USER_ID),
    onMutate: () => setGenerating(true),
    onSettled: () => setGenerating(false),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.shopping(USER_ID) });
    },
  });
}

// ─── Preferences ──────────────────────────────────────────────────────────────
export function usePreferences() {
  const setPreferences = useNutritionStore((s) => s.setPreferences);
  const query = useQuery({
    queryKey: KEYS.preferences(USER_ID),
    queryFn: () => nutritionApi.getPreferences(USER_ID),
    staleTime: 10 * 60_000,
  });

  useEffect(() => {
    if (query.data) setPreferences(query.data);
  }, [query.data, setPreferences]);

  return query;
}

export function useSavePreferences() {
  const qc = useQueryClient();
  const setPreferences = useNutritionStore((s) => s.setPreferences);
  return useMutation({
    mutationFn: (data: {
      dietaryPreferences: DietaryPreference[];
      allergies: string[];
      favoriteFoods: string[];
    }) => nutritionApi.savePreferences(data, USER_ID),
    onSuccess: (data) => {
      setPreferences(data);
      qc.invalidateQueries({ queryKey: KEYS.preferences(USER_ID) });
    },
  });
}
