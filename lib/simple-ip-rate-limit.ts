/**
 * Per-process fixed-window rate limiting by string key (e.g. client IP).
 * On multi-instance deployments each instance maintains its own window; supplement with
 * a platform firewall or shared store if you need global limits.
 */

type Bucket = number[];

const store = new Map<string, Bucket>();

function prune(bucket: Bucket, windowMs: number, now: number): Bucket {
  const cutoff = now - windowMs;
  return bucket.filter((t) => t > cutoff);
}

export type RateLimitResult = Readonly<{ ok: true } | { ok: false; retryAfterSec: number }>;

export function consumeRateLimitToken(
  key: string,
  options: Readonly<{ max: number; windowMs: number }>,
): RateLimitResult {
  const now = Date.now();
  const { max, windowMs } = options;
  const prev = store.get(key) ?? [];
  const bucket = prune(prev, windowMs, now);
  if (bucket.length >= max) {
    const oldest = Math.min(...bucket);
    const retryAfterMs = Math.max(0, windowMs - (now - oldest));
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }
  bucket.push(now);
  store.set(key, bucket);
  return { ok: true };
}

export function clientIpFromRequest(request: Request): string {
  // On Vercel, the platform appends the real client IP as the last entry in
  // x-forwarded-for so it cannot be spoofed by a client-supplied header.
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",");
    const last = parts[parts.length - 1]?.trim();
    if (last) return last;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

/** Vitest cleanup — resets all buckets. */
export function __resetRateLimitsForTests(): void {
  store.clear();
}
