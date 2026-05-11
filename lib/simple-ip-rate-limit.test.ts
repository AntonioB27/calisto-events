import { afterEach, describe, expect, it } from "vitest";

import { __resetRateLimitsForTests, consumeRateLimitToken } from "./simple-ip-rate-limit";

afterEach(() => {
  __resetRateLimitsForTests();
});

describe("consumeRateLimitToken", () => {
  it("allows up to max requests per window", () => {
    const opts = { max: 3, windowMs: 10_000 } as const;
    expect(consumeRateLimitToken("a", opts).ok).toBe(true);
    expect(consumeRateLimitToken("a", opts).ok).toBe(true);
    expect(consumeRateLimitToken("a", opts).ok).toBe(true);
    const fourth = consumeRateLimitToken("a", opts);
    expect(fourth.ok).toBe(false);
    if (!fourth.ok) expect(fourth.retryAfterSec).toBeGreaterThan(0);
  });

  it("tracks keys independently", () => {
    const opts = { max: 1, windowMs: 10_000 } as const;
    expect(consumeRateLimitToken("u1", opts).ok).toBe(true);
    expect(consumeRateLimitToken("u2", opts).ok).toBe(true);
  });
});
