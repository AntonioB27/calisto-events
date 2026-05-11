import { beforeEach, describe, expect, it, vi } from "vitest";

import { __resetRateLimitsForTests } from "@/lib/simple-ip-rate-limit";

const createSupabaseAuthServerClient = vi.hoisted(() => vi.fn());

vi.mock("@/lib/supabase-auth-server", () => ({
  createSupabaseAuthServerClient,
}));

import { GET } from "./route";

function mockQueryChain(result: { data: unknown; error: unknown }) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ maybeSingle }),
      }),
    }),
  };
}

beforeEach(() => {
  __resetRateLimitsForTests();
  createSupabaseAuthServerClient.mockReset();
});

describe("GET /api/join/preview", () => {
  it("returns 404 NOT_FOUND when access code is invalid", async () => {
    const res = await GET(new Request("http://localhost/api/join/preview?code=ab"));

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ error: "NOT_FOUND" });
    expect(createSupabaseAuthServerClient).not.toHaveBeenCalled();
  });

  it("returns 404 NOT_FOUND when event is not found", async () => {
    createSupabaseAuthServerClient.mockResolvedValue(mockQueryChain({ data: null, error: null }));

    const res = await GET(new Request("http://localhost/api/join/preview?code=ABC123"));

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ error: "NOT_FOUND" });
    expect(createSupabaseAuthServerClient).toHaveBeenCalledTimes(1);
  });

  it("returns 404 NOT_FOUND when Supabase returns an error", async () => {
    createSupabaseAuthServerClient.mockResolvedValue(
      mockQueryChain({ data: null, error: { message: "query failed" } }),
    );

    const res = await GET(new Request("http://localhost/api/join/preview?code=ABC123"));

    expect(res.status).toBe(404);
    await expect(res.json()).resolves.toEqual({ error: "NOT_FOUND" });
  });

  it("returns 200 with title, eventDate, and planId when event exists", async () => {
    createSupabaseAuthServerClient.mockResolvedValue(
      mockQueryChain({
        data: {
          title: "Summer BBQ",
          event_date: "2026-07-15T18:00:00.000Z",
          plan: "standard",
        },
        error: null,
      }),
    );

    const res = await GET(new Request("http://localhost/api/join/preview?code=abc123"));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      title: "Summer BBQ",
      eventDate: "2026-07-15T18:00:00.000Z",
      planId: "standard",
    });
  });
});
