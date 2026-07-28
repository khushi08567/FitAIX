import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Database Connection
connectDB();

// Auth & User Profile Routes
app.use('/api/auth', authRoutes);

app.get('/api/healthcheck', (req, res) => {
  res.json({ status: 'ok', message: 'FitAI Auth & User Starter Service Running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[FitAI Auth Starter] Server running on port ${PORT}`);
});
