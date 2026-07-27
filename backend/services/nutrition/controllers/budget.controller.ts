// ─── Budget Controller ─────────────────────────────────────────────────────
import type { Request, Response } from 'express';
import { getBudget } from '../services/nutrition.service';
import type { ApiResponse } from '../types/nutrition.types';

function send<T>(res: Response, data: T, message?: string): void {
  const body: ApiResponse<T> = { success: true, data, message, timestamp: new Date().toISOString() };
  res.json(body);
}
function sendError(res: Response, code: number, message: string): void {
  res.status(code).json({ success: false, message, timestamp: new Date().toISOString() });
}

// GET /nutrition/:userId/budget
export function getBudgetHandler(req: Request, res: Response): void {
  try {
    const data = getBudget(req.params.userId);
    send(res, data);
  } catch {
    sendError(res, 500, 'Failed to fetch budget data');
  }
}
