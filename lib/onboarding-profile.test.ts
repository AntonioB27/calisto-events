import { describe, expect, it, vi } from "vitest";

import { needsOrganizerOnboarding } from "./onboarding-profile";

function mockSupabase(result: {
  data: Record<string, unknown> | null;
  error: { message: string } | null;
}) {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue(result),
        })),
      })),
    })),
  } as unknown as import("@supabase/supabase-js").SupabaseClient;
}

describe("needsOrganizerOnboarding", () => {
  it("returns false when query errors (e.g. missing column)", async () => {
    const result = await needsOrganizerOnboarding(
      mockSupabase({ data: null, error: { message: "column does not exist" } }),
      "u1",
    );
    expect(result).toBe(false);
  });

  it("returns true when profile row is missing", async () => {
    const result = await needsOrganizerOnboarding(mockSupabase({ data: null, error: null }), "u1");
    expect(result).toBe(true);
  });

  it("returns true when onboarding_completed_at is null", async () => {
    const result = await needsOrganizerOnboarding(
      mockSupabase({ data: { onboarding_completed_at: null }, error: null }),
      "u1",
    );
    expect(result).toBe(true);
  });

  it("returns false when onboarding is completed", async () => {
    const result = await needsOrganizerOnboarding(
      mockSupabase({ data: { onboarding_completed_at: "2026-01-01T00:00:00.000Z" }, error: null }),
      "u1",
    );
    expect(result).toBe(false);
  });
});
