/**
 * Multi-layer rate limiter with Upstash Redis support & sliding-window in-memory fallback.
 * Includes progressive lockout for brute-force prevention and NoSQL injection sanitizer.
 */

const tracker = new Map();
const lockoutTracker = new Map();

// Progressive lockout configuration
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

export async function rateLimit(key, limit = 10, windowMs = 60 * 1000) {
  // If Upstash Redis is configured, we can use it via fetch
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const url = `${process.env.UPSTASH_REDIS_REST_URL}/pipeline`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['INCR', `rl:${key}`],
          ['PTTL', `rl:${key}`],
        ]),
      });
      if (res.ok) {
        const [incrRes, pttlRes] = await res.json();
        const count = incrRes.result;
        let ttl = pttlRes.result;
        if (ttl === -1 || count === 1) {
          // Set expiry
          await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/PEXPIRE/rl:${key}/${windowMs}`, {
            headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
          });
          ttl = windowMs;
        }
        if (count > limit) {
          return {
            success: false,
            limit,
            remaining: 0,
            retryAfter: Math.ceil(ttl / 1000),
          };
        }
        return {
          success: true,
          limit,
          remaining: limit - count,
          retryAfter: 0,
        };
      }
    } catch {
      // Fall through to in-memory on any Upstash network error
    }
  }

  // Sliding window in-memory fallback
  const now = Date.now();
  const record = tracker.get(key) || [];
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

  // Periodic cleanup
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

/**
 * Record a failed authentication attempt. Triggers progressive lockout after threshold.
 */
export function recordFailedAuth(identifier) {
  const now = Date.now();
  const state = lockoutTracker.get(identifier) || { count: 0, lockedUntil: 0 };
  state.count += 1;
  if (state.count >= MAX_FAILED_ATTEMPTS) {
    state.lockedUntil = now + LOCKOUT_DURATION_MS;
  }
  lockoutTracker.set(identifier, state);
  return state;
}

/**
 * Check if an IP or identifier is locked out.
 */
export function checkAuthLockout(identifier) {
  const now = Date.now();
  const state = lockoutTracker.get(identifier);
  if (!state) return { locked: false, remainingSeconds: 0 };

  if (state.lockedUntil > now) {
    return {
      locked: true,
      remainingSeconds: Math.ceil((state.lockedUntil - now) / 1000),
    };
  }

  // If lockout expired, reset
  if (state.lockedUntil > 0 && state.lockedUntil <= now) {
    lockoutTracker.delete(identifier);
  }
  return { locked: false, remainingSeconds: 0 };
}

/**
 * Reset lockout on successful login.
 */
export function resetAuthLockout(identifier) {
  lockoutTracker.delete(identifier);
}

/**
 * Sanitize an object against NoSQL injection ($ and . operator keys)
 */
export function sanitizeNoSql(input) {
  if (!input || typeof input !== 'object') return input;
  if (Array.isArray(input)) return input.map(sanitizeNoSql);

  const clean = {};
  for (const [key, value] of Object.entries(input)) {
    if (key.startsWith('$') || key.includes('.')) {
      continue; // Strip disallowed mongo operators
    }
    clean[key] = typeof value === 'object' && value !== null ? sanitizeNoSql(value) : value;
  }
  return clean;
}
