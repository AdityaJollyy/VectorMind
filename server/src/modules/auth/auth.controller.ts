import type { CookieOptions, Request, Response } from 'express';
import { isProd } from '../../config/env';
import { signToken } from '../../utils/jwt';
import { ApiResponse } from '../../utils/ApiResponse';
import { registerUser, loginUser, getUserById } from './auth.service';
import type { RegisterInput, LoginInput } from './auth.schema';

const COOKIE_NAME = 'token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd, // HTTPS only in production
    sameSite: isProd ? 'none' : 'lax', // cross-site in prod, localhost-friendly in dev
    maxAge: SEVEN_DAYS_MS,
    path: '/',
  };
}

export async function register(req: Request, res: Response) {
  const user = await registerUser(req.body as RegisterInput);
  const token = await signToken({ userId: user.id });
  res.cookie(COOKIE_NAME, token, cookieOptions());
  res.status(201).json(new ApiResponse(201, 'Account created successfully', { user }));
}

export async function login(req: Request, res: Response) {
  const user = await loginUser(req.body as LoginInput);
  const token = await signToken({ userId: user.id });
  res.cookie(COOKIE_NAME, token, cookieOptions());
  res.status(200).json(new ApiResponse(200, 'Logged in successfully', { user }));
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie(COOKIE_NAME, cookieOptions());
  res.status(200).json(new ApiResponse(200, 'Logged out successfully'));
}

export async function me(req: Request, res: Response) {
  const user = await getUserById(req.userId!); // requireAuth guarantees this exists
  res.status(200).json(new ApiResponse(200, 'Current user', { user }));
}
