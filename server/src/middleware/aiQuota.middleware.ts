import type { NextFunction, Request, Response } from 'express';
import { UsageLog } from '../models/usageLog.model';
import { ApiError } from '../utils/ApiError';
import { DAILY_AI_LIMIT } from '../config/constants';
import { isProd } from '../config/env';

/** Current UTC date as YYYY-MM-DD, used as the per-day bucket key. */
function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Enforces a per-user daily cap on AI operations. Atomically increments the
 * user's counter and rejects once it exceeds the limit. Skipped in dev/test.
 */
export async function aiQuota(req: Request, _res: Response, next: NextFunction) {
  if (!isProd) return next();

  try {
    const userId = req.userId!;
    const day = todayUTC();

    // Atomic upsert + increment avoids race conditions between concurrent requests.
    const usage = await UsageLog.findOneAndUpdate(
      { userId, day },
      { $inc: { count: 1 } },
      { new: true, upsert: true },
    );

    if (usage && usage.count > DAILY_AI_LIMIT) {
      throw ApiError.tooManyRequests(
        `Daily AI limit reached (${DAILY_AI_LIMIT} requests). Please try again tomorrow.`,
      );
    }

    next();
  } catch (err) {
    next(err);
  }
}
