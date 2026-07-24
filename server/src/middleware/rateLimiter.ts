import { Request, Response, NextFunction } from 'express';
import { env } from '../config/index.js';
import { RateLimitError } from '../shared/errors.js';

const requestCounts = new Map<string, { count: number; resetAt: number }>();

const hourlyLimits: Record<string, number> = {
  '/auth/login': 10,
  '/auth/register': 5,
  '/auth/resend-verification': 3,
  '/auth/google': 10,
};

export function rateLimiter(req: Request, _res: Response, next: NextFunction): void {
  const key = req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';

  const originalUrl = req.originalUrl || req.url;
  const pathLimit = matchRateLimitPath(originalUrl) || env.RATE_LIMIT_MAX_REQUESTS;
  const windowMs = env.RATE_LIMIT_WINDOW_MS;

  const now = Date.now();
  const recordKey = `${key}:${originalUrl}`;
  let record = requestCounts.get(recordKey);

  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + windowMs };
    requestCounts.set(recordKey, record);
  }

  record.count++;

  if (record.count > pathLimit) {
    return next(new RateLimitError('Too many requests. Please try again later.'));
  }

  next();
}

function matchRateLimitPath(url: string): number | null {
  const pathname = url.split('?')[0];
  for (const [pattern, limit] of Object.entries(hourlyLimits)) {
    if (pathname.endsWith(pattern)) {
      return limit;
    }
  }
  return null;
}

// Clean up stale entries every 15 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, record] of requestCounts.entries()) {
      if (now > record.resetAt) {
        requestCounts.delete(key);
      }
    }
  },
  15 * 60 * 1000
);
