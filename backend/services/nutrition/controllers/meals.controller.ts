// ─── Meals Controller ─────────────────────────────────────────────────────────
import type { Request, Response } from 'express';
import { getMealLogs, logMeal, deleteMealLog, getRecommendedMeals } from '../services/nutrition.service';
import type { ApiResponse } from '../types/nutrition.types';

function send<T>(res: Response, data: T, message?: string): void {
  const body: ApiResponse<T> = { success: true, data, message, timestamp: new Date().toISOString() };
  res.json(body);
}
function sendError(res: Response, code: number, message: string): void {
  res.status(code).json({ success: false, message, timestamp: new Date().toISOString() });
}

// GET /nutrition/:userId/meals
export function getMealsHandler(req: Request, res: Response): void {
  try {
    const { mealType } = req.query;
    const data = getMealLogs(req.params.userId, mealType as string | undefined);
    send(res, data);
  } catch {
    sendError(res, 500, 'Failed to fetch meal logs');
  }
}

// POST /nutrition/meals/log
export function logMealHandler(req: Request, res: Response): void {
  try {
    const { userId, mealType, name, calories, protein, carbs, fat, servingSize, unit } = req.body;
    if (!userId || !mealType || !name || calories == null) {
      sendError(res, 400, 'userId, mealType, name, and calories are required');
      return;
    }
    const entry = logMeal({ userId, mealType, name, calories, protein: protein ?? 0, carbs: carbs ?? 0, fat: fat ?? 0, servingSize, unit });
    res.status(201).json({ success: true, data: entry, message: 'Meal logged successfully', timestamp: new Date().toISOString() });
  } catch {
    sendError(res, 500, 'Failed to log meal');
  }
}

// DELETE /nutrition/meals/:mealId
export function deleteMealHandler(req: Request, res: Response): void {
  try {
    const deleted = deleteMealLog(req.params.mealId);
    if (!deleted) {
      sendError(res, 404, 'Meal log not found');
      return;
    }
    send(res, { deleted: true }, 'Meal log deleted');
  } catch {
    sendError(res, 500, 'Failed to delete meal log');
  }
}

// GET /nutrition/meals/recommended
export function getRecommendedMealsHandler(req: Request, res: Response): void {
  try {
    const data = getRecommendedMeals();
    send(res, data);
  } catch {
    sendError(res, 500, 'Failed to fetch recommended meals');
  }
}
