import type { Request } from 'express';
import { ApiError } from './ApiError';

/** Express 5 types req.params values as string | string[]; safely read a single string. */
export function stringParam(req: Request, key: string): string {
  const value = req.params[key];
  if (typeof value !== 'string') throw ApiError.badRequest(`Invalid ${key}`);
  return value;
}
