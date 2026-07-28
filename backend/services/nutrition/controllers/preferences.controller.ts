// ─── Preferences Controller ─────────────────────────────────────────────────
import type { Request, Response } from 'express';
import { getPreferences, savePreferences } from '../services/nutrition.service';
import type { ApiResponse } from '../types/nutrition.types';

function send<T>(res: Response, data: T, message?: string): void {
  const body: ApiResponse<T> = { success: true, data, message, timestamp: new Date().toISOString() };
  res.json(body);
}
function sendError(res: Response, code: number, message: string): void {
  res.status(code).json({ success: false, message, timestamp: new Date().toISOString() });
}

// GET /nutrition/:userId/preferences
export function getPreferencesHandler(req: Request, res: Response): void {
  try {
    const data = getPreferences(req.params.userId);
    send(res, data);
  } catch {
    sendError(res, 500, 'Failed to fetch preferences');
  }
}

// PUT /nutrition/preferences
export function savePreferencesHandler(req: Request, res: Response): void {
  try {
    const { userId, dietaryPreferences, allergies, favoriteFoods } = req.body;
    if (!userId) {
      sendError(res, 400, 'userId is required');
      return;
    }
    const data = savePreferences({
      userId,
      dietaryPreferences: dietaryPreferences ?? [],
      allergies: allergies ?? [],
      favoriteFoods: favoriteFoods ?? [],
    });
    send(res, data, 'Preferences saved successfully');
  } catch {
    sendError(res, 500, 'Failed to save preferences');
  }
}
