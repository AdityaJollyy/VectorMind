import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { isProd } from '../config/env';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

// Express recognizes this as an error handler because it has 4 arguments.
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const message = err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    logger.warn({ issues: err.issues }, 'Validation error');
    return res.status(400).json({ success: false, message });
  }

  if (err instanceof ApiError) {
    if (err.statusCode >= 500) logger.error({ err }, err.message);
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  const error = err instanceof Error ? err : new Error('Unknown error');
  logger.error({ err: error }, 'Unhandled error');
  return res.status(500).json({
    success: false,
    message: isProd ? 'Internal server error' : error.message,
  });
}
