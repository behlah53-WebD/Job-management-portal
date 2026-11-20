/**
 * In-memory rate limiter with sliding window fallback
 * Ideal for Next.js route handlers and serverless dev.
 */

const tracker = new Map();

export async function rateLimit(key, limit = 10, windowMs = 60 * 1000) {
  const now = Date.now();
  const record = tracker.get(key) || [];

  // Remove timestamps outside window
  const validTimestamps = record.filter((ts) => now - ts < windowMs);

  if (validTimestamps.length >= limit) {
    const oldest = validTimestamps[0];
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      success: false,
      limit,
      remaining: 0,
      retryAfter,
    };
  }

  validTimestamps.push(now);
  tracker.set(key, validTimestamps);

  // Periodically clean up stale tracker entries
  if (tracker.size > 2000) {
    for (const [k, v] of tracker.entries()) {
      if (v.every((t) => now - t > windowMs)) {
        tracker.delete(k);
      }
    }
  }

  return {
    success: true,
    limit,
    remaining: limit - validTimestamps.length,
    retryAfter: 0,
  };
}
