import { SignJWT, jwtVerify } from 'jose';
import { env } from '../config/env';

const secret = new TextEncoder().encode(env.JWT_SECRET);
const ALGORITHM = 'HS256';
const EXPIRES_IN = '7d';

export interface TokenPayload {
  userId: string;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secret, { algorithms: [ALGORITHM] });
  if (typeof payload.userId !== 'string') {
    throw new Error('Invalid token payload');
  }
  return { userId: payload.userId };
}
