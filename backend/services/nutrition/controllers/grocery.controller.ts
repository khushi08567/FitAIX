// ─── Grocery Controller ─────────────────────────────────────────────────────
import type { Request, Response } from 'express';
import { addShoppingItems } from '../services/nutrition.service';
import {
  generateGroceryItems,
  estimateGroceryCost,
  calculateWasteReduction,
} from '../services/ai.nutrition.service';
import type { ApiResponse, GroceryGenerationResult } from '../types/nutrition.types';

function send<T>(res: Response, data: T, message?: string): void {
  const body: ApiResponse<T> = { success: true, data, message, timestamp: new Date().toISOString() };
  res.json(body);
}
function sendError(res: Response, code: number, message: string): void {
  res.status(code).json({ success: false, message, timestamp: new Date().toISOString() });
}

// POST /nutrition/grocery/generate
export function generateGroceryHandler(req: Request, res: Response): void {
  try {
    const { userId, reuseIngredients = false, budgetLimit } = req.body;
    if (!userId) {
      sendError(res, 400, 'userId is required');
      return;
    }

    const items = generateGroceryItems(Boolean(reuseIngredients));
    const estimatedCost = estimateGroceryCost(items);
    const wasteReductionPercent = calculateWasteReduction(Boolean(reuseIngredients));

    // Auto-populate shopping list
    addShoppingItems(userId, items.map(({ name, quantity, unit, estimatedCost: cost, category }) => ({
      name, quantity, unit, estimatedCost: cost, category,
    })));

    const result: GroceryGenerationResult = {
      estimatedCost,
      wasteReductionPercent,
      items,
      generatedAt: new Date().toISOString(),
    };

    send(res, result, 'Grocery list generated successfully');
  } catch {
    sendError(res, 500, 'Failed to generate grocery list');
  }
}
