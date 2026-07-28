// ─── Nutrition Controller ─────────────────────────────────────────────────────
import type { Request, Response } from 'express';
import {
  getDailyNutrition,
  getBMI,
  updateBMI,
  getNutritionStrategy,
} from '../services/nutrition.service';
import { generateAIMeals } from '../services/ai.nutrition.service';
import type { ApiResponse } from '../types/nutrition.types';

function send<T>(res: Response, data: T, message?: string): void {
  const body: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
  res.json(body);
}

function sendError(res: Response, code: number, message: string): void {
  res.status(code).json({ success: false, message, timestamp: new Date().toISOString() });
}

// GET /nutrition/:userId/daily
export function getDailyNutritionHandler(req: Request, res: Response): void {
  try {
    const data = getDailyNutrition(req.params.userId);
    send(res, data);
  } catch {
    sendError(res, 500, 'Failed to fetch daily nutrition');
  }
}

// GET /nutrition/:userId/macros
export function getMacrosHandler(req: Request, res: Response): void {
  try {
    const daily = getDailyNutrition(req.params.userId);
    const macros = {
      protein: daily.protein,
      carbs: daily.carbs,
      fat: daily.fat,
    };
    send(res, macros);
  } catch {
    sendError(res, 500, 'Failed to fetch macros');
  }
}

// GET /nutrition/:userId/bmi
export function getBMIHandler(req: Request, res: Response): void {
  try {
    const data = getBMI(req.params.userId);
    send(res, data);
  } catch {
    sendError(res, 500, 'Failed to fetch BMI data');
  }
}

// PUT /nutrition/bmi
export function updateBMIHandler(req: Request, res: Response): void {
  try {
    const { userId, weight, height } = req.body;
    if (!userId || !weight || !height) {
      sendError(res, 400, 'userId, weight, and height are required');
      return;
    }
    const data = updateBMI({ userId, weight: Number(weight), height: Number(height) });
    send(res, data, 'BMI updated successfully');
  } catch {
    sendError(res, 500, 'Failed to update BMI');
  }
}

// GET /nutrition/:userId/ai-strategy
export function getAIStrategyHandler(req: Request, res: Response): void {
  try {
    const data = getNutritionStrategy(req.params.userId);
    send(res, data);
  } catch {
    sendError(res, 500, 'Failed to fetch AI strategy');
  }
}

// GET /nutrition/:userId/ai-meals
export function getAIMealsHandler(req: Request, res: Response): void {
  try {
    const data = generateAIMeals(req.params.userId);
    send(res, data);
  } catch {
    sendError(res, 500, 'Failed to generate AI meals');
  }
}
