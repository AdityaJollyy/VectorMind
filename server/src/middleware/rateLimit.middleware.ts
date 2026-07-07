import rateLimit from 'express-rate-limit';
import { isProd } from '../config/env';

// Disable all rate limiting outside production so local testing is unthrottled.
const skipOutsideProd = () => !isProd;

/** Global limiter: caps total requests per IP across all API routes. */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOutsideProd,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

/** Stricter limiter for auth endpoints to slow brute-force attempts. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipOutsideProd,
  message: { success: false, message: 'Too many attempts, please try again later.' },
});
