import type { Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
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
  res.status(code).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
  });
}

// POST /api/v1/auth/register
export function registerHandler(req: Request, res: Response): void {
  try {
    const user = registerUser(req.body);
    send(res, user, 'Registration successful');
  } catch (error: any) {
    sendError(res, 400, error.message || 'Registration failed');
  }
}

// POST /api/v1/auth/login
export function loginHandler(req: Request, res: Response): void {
  try {
    const user = loginUser(req.body);
    send(res, user, 'Login successful');
  } catch (error: any) {
    sendError(res, 400, error.message || 'Login failed');
  }
}
