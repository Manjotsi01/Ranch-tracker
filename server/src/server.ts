import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';

import agricultureRoutes from './routes/agriculture.routes';
import dashboardRoutes from './routes/dashboard.routes';
import dairyRoutes from './routes/dairy.routes';
import shopRoutes from './routes/shop.routes';

import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';

const app = express();

// ─── ENV CONFIG ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const BASE_API = process.env.BASE_API || '/api';

// ─── VALIDATE ENV ───────────────────────────────────────────
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing in environment variables");
  process.exit(1);
}

// ─── CORS CONFIG (FIXED) ────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  'https://ranch-tracker.vercel.app',
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("❌ Blocked by CORS:", origin);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// ─── BODY PARSER ────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── ROUTES ─────────────────────────────────────────────────
app.use(`${BASE_API}/dashboard`, dashboardRoutes);
app.use(`${BASE_API}/agriculture`, agricultureRoutes);
app.use(`${BASE_API}/dairy`, dairyRoutes);
app.use(`${BASE_API}/shop`, shopRoutes);

// ─── HEALTH CHECK ───────────────────────────────────────────
app.get(`${BASE_API}/health`, (_, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ─── ROOT ROUTE ─────────────────────────────────────────────
app.get('/', (_, res) => {
  res.send('🚀 Ranch Tracker API is running');
});

// ─── 404 HANDLER ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─── ERROR HANDLER ──────────────────────────────────────────
app.use(errorHandler);

// ─── START SERVER ───────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`🌐 API Base: ${BASE_API}`);
    });

  } catch (error) {
    logger.error("❌ Failed to start server:", ); // FIXED
    process.exit(1);
  }
};

startServer();

export default app;