// ─── Shopping Controller ─────────────────────────────────────────────────────
import type { Request, Response } from 'express';
import { getShoppingList, toggleShoppingItem } from '../services/nutrition.service';
import type { ApiResponse } from '../types/nutrition.types';

function send<T>(res: Response, data: T, message?: string): void {
  const body: ApiResponse<T> = { success: true, data, message, timestamp: new Date().toISOString() };
  res.json(body);
}
function sendError(res: Response, code: number, message: string): void {
  res.status(code).json({ success: false, message, timestamp: new Date().toISOString() });
}

// GET /nutrition/:userId/shopping
export function getShoppingListHandler(req: Request, res: Response): void {
  try {
    const items = getShoppingList(req.params.userId);
    const totalCost = items.reduce((sum, i) => sum + i.estimatedCost, 0);
    const checkedCount = items.filter((i) => i.isChecked).length;
    send(res, { items, totalCost, checkedCount, total: items.length });
  } catch {
    sendError(res, 500, 'Failed to fetch shopping list');
  }
}

// PATCH /nutrition/shopping/:itemId/toggle
export function toggleItemHandler(req: Request, res: Response): void {
  try {
    const updated = toggleShoppingItem(req.params.itemId);
    if (!updated) {
      sendError(res, 404, 'Shopping item not found');
      return;
    }
    send(res, updated, updated.isChecked ? 'Item checked' : 'Item unchecked');
  } catch {
    sendError(res, 500, 'Failed to toggle shopping item');
  }
}
