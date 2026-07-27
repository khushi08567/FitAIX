// ─── Nutrition Service Entry Point ────────────────────────────────────────────
import express from 'express';
import cors from 'cors';
import nutritionRouter from './routes/nutrition.routes';

const app = express();
const PORT = process.env.PORT ?? 4001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger ───────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    service: 'FitAIX Nutrition Service',
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET    /api/v1/nutrition/:userId/daily',
      'GET    /api/v1/nutrition/:userId/macros',
      'GET    /api/v1/nutrition/:userId/bmi',
      'PUT    /api/v1/nutrition/bmi',
      'GET    /api/v1/nutrition/:userId/ai-strategy',
      'GET    /api/v1/nutrition/:userId/ai-meals',
      'GET    /api/v1/nutrition/meals/recommended',
      'GET    /api/v1/nutrition/:userId/meals',
      'POST   /api/v1/nutrition/meals/log',
      'DELETE /api/v1/nutrition/meals/:mealId',
      'GET    /api/v1/nutrition/:userId/hydration',
      'POST   /api/v1/nutrition/hydration/add',
      'GET    /api/v1/nutrition/:userId/budget',
      'POST   /api/v1/nutrition/grocery/generate',
      'GET    /api/v1/nutrition/:userId/shopping',
      'PATCH  /api/v1/nutrition/shopping/:itemId/toggle',
      'GET    /api/v1/nutrition/:userId/preferences',
      'PUT    /api/v1/nutrition/preferences',
    ],
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1/nutrition', nutritionRouter);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint not found', timestamp: new Date().toISOString() });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ success: false, message: 'Internal server error', timestamp: new Date().toISOString() });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 FitAIX Nutrition Service running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🍎 API base: http://localhost:${PORT}/api/v1/nutrition\n`);
});

export default app;
