// ─── Hydration Controller ─────────────────────────────────────────────────────
import type { Request, Response } from 'express';
import { getHydration, addHydration } from '../services/nutrition.service';
import type { ApiResponse } from '../types/nutrition.types';

function send<T>(res: Response, data: T, message?: string): void {
  const body: ApiResponse<T> = { success: true, data, message, timestamp: new Date().toISOString() };
  res.json(body);
}
function sendError(res: Response, code: number, message: string): void {
  res.status(code).json({ success: false, message, timestamp: new Date().toISOString() });
}

// GET /nutrition/:userId/hydration
export function getHydrationHandler(req: Request, res: Response): void {
  try {
    const data = getHydration(req.params.userId);
    send(res, data);
  } catch {
    sendError(res, 500, 'Failed to fetch hydration data');
  }
}

// POST /nutrition/hydration/add
export function addHydrationHandler(req: Request, res: Response): void {
  try {
    const { userId, amount } = req.body;
    if (!userId || amount == null || amount <= 0) {
      sendError(res, 400, 'userId and a positive amount (ml) are required');
      return;
    }
    const data = addHydration({ userId, amount: Number(amount) });
    send(res, data, `Added ${amount}ml of water`);
  } catch {
    sendError(res, 500, 'Failed to add hydration');
  }
}
