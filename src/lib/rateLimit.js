import { getIpAddress } from './utils';

const rateLimit = new Map();

export function rateLimiter(req, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const ip = getIpAddress(req);
  const now = Date.now();
  const windowStart = now - windowMs;

  const userAttempts = rateLimit.get(ip) || [];
  const recentAttempts = userAttempts.filter(timestamp => timestamp > windowStart);

  if (recentAttempts.length >= maxAttempts) {
    const oldestAttempt = recentAttempts[0];
    const timeUntilReset = (oldestAttempt + windowMs) - now;
    throw new Error(`Too many login attempts. Please try again in ${Math.ceil(timeUntilReset / 1000 / 60)} minutes.`);
  }

  recentAttempts.push(now);
  rateLimit.set(ip, recentAttempts);

  return true;
}
