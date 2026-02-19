import { RateLimiterMemory } from "rate-limiter-flexible";

// 60 requests per minute per IP
const rateLimiter = new RateLimiterMemory({
  keyPrefix: "validate_api",
  points: 60,
  duration: 60,
});

export async function rateLimit(ip: string): Promise<{
  allowed: boolean;
  retryAfter?: number;
}> {
  try {
    await rateLimiter.consume(ip);
    return { allowed: true };
  } catch (rejRes: unknown) {
    const rej = rejRes as { msBeforeNext?: number };
    const msBeforeNext = typeof rej.msBeforeNext === "number" ? rej.msBeforeNext : 60_000;
    return {
      allowed: false,
      retryAfter: Math.round(msBeforeNext / 1000) || 60,
    };
  }
}
