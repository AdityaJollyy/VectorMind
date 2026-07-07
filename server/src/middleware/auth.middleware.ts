import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.token as string | undefined;
    if (!token) {
      throw ApiError.unauthorized('Authentication required');
    }

    const { userId } = await verifyToken(token);
    req.userId = userId;
    next();
  } catch (err) {
    if (err instanceof ApiError) {
      next(err);
      return;
    }
    // Any jose verification failure (expired/tampered/invalid) → 401
    next(ApiError.unauthorized('Invalid or expired session'));
  }
}
