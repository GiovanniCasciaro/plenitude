type RateBucket = {
  count: number;
  resetAt: number;
  lockUntil: number;
};

const buckets = new Map<string, RateBucket>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

export function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export function checkLoginRateLimit(ip: string) {
  const now = Date.now();
  const current = buckets.get(ip);

  if (!current || now > current.resetAt) {
    buckets.set(ip, { count: 0, resetAt: now + WINDOW_MS, lockUntil: 0 });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.lockUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((current.lockUntil - now) / 1000),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

export function registerLoginFailure(ip: string) {
  const now = Date.now();
  const current = buckets.get(ip) ?? {
    count: 0,
    resetAt: now + WINDOW_MS,
    lockUntil: 0,
  };

  if (now > current.resetAt) {
    current.count = 0;
    current.resetAt = now + WINDOW_MS;
    current.lockUntil = 0;
  }

  current.count += 1;
  if (current.count >= MAX_ATTEMPTS) {
    current.lockUntil = now + LOCK_MS;
  }
  buckets.set(ip, current);

  return {
    locked: current.lockUntil > now,
    retryAfterSeconds:
      current.lockUntil > now
        ? Math.ceil((current.lockUntil - now) / 1000)
        : 0,
    remaining: Math.max(0, MAX_ATTEMPTS - current.count),
  };
}

export function registerLoginSuccess(ip: string) {
  buckets.delete(ip);
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request.headers.get("host");

  if (!host) {
    return false;
  }

  // Same-origin browser requests should send Origin matching the public host.
  if (!origin) {
    // Non-browser clients may omit Origin; reject in production for login.
    return process.env.NODE_ENV !== "production";
  }

  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}
