import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env, isProd } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { globalLimiter, authLimiter } from './middleware/rateLimit.middleware';
import authRoutes from './modules/auth/auth.routes';
import sourceRoutes from './modules/sources/sources.routes';
import chatRoutes from './modules/chat/chat.routes';

export function createApp() {
  const app = express();

  // Behind a reverse proxy in production: trust it so req.ip and secure cookies work.
  if (isProd) app.set('trust proxy', 1);

  // Security & parsing
  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Health check — deliberately not rate limited (for uptime monitors).
  app.get('/api/v1/health', (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
    });
  });

  // Global rate limiter for everything below.
  app.use(globalLimiter);

  // Feature routes
  app.use('/api/v1/auth', authLimiter, authRoutes);
  app.use('/api/v1/sources', sourceRoutes);
  app.use('/api/v1/sources', chatRoutes);

  // 404 + centralized error handling (must be last).
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
