import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import listingRoutes from './routes/listings.routes.js';
import favoritesRoutes from './routes/favorites.routes.js';
import conversationsRoutes from './routes/conversations.routes.js';
import appointmentsRoutes from './routes/appointments.routes.js';
import { errorHandler, notFound } from './middleware/error.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({
    origin: env.clientOrigin,
    credentials: true
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use('/uploads', express.static(path.resolve(env.uploadDir)));

  app.use('/api/auth', rateLimit({
    windowMs: 60 * 1000,
    limit: 12
  }), authRoutes);

  app.use('/api/listings', listingRoutes);
  app.use('/api/favorites', favoritesRoutes);
  app.use('/api/conversations', conversationsRoutes);
  app.use('/api/appointments', appointmentsRoutes);

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

