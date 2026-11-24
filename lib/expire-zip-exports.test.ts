import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { expireZipExportsPastDue } from "./expire-zip-exports";

describe("expireZipExportsPastDue", () => {
  it("marks jobs stuck in running as failed so the organizer can retry", async () => {
    const calls: { update: Record<string, unknown>; filters: [string, string, unknown][] }[] = [];
    const db = {
      from: () => ({
        // ready-and-expired lookup: none
        select: () => ({ eq: () => ({ not: () => ({ lt: () => ({ order: () => ({ limit: async () => ({ data: [], error: null }) }) }) }) }) }),
        update: (u: Record<string, unknown>) => {
          const call = { update: u, filters: [] as [string, string, unknown][] };
          calls.push(call);
          const chain = {
            eq: (c: string, v: unknown) => (call.filters.push(["eq", c, v]), chain),
            lt: (c: string, v: unknown) => (call.filters.push(["lt", c, v]), chain),
            select: async () => ({ data: [{ id: "stuck-1" }], error: null }),
          };
          return chain;
        },
      }),
      storage: { from: () => ({ remove: async () => ({ error: null }) }) },
    } as unknown as SupabaseClient;

    const before = Date.now();
    const result = await expireZipExportsPastDue({ db });

    expect(result.staleFailedIds).toEqual(["stuck-1"]);
    expect(calls[0].update).toMatchObject({ status: "failed" });
    expect(calls[0].filters).toContainEqual(["eq", "status", "running"]);
    const cutoff = Date.parse(calls[0].filters.find((f) => f[0] === "lt")![2] as string);
    // 15 minutes without progress counts as stuck
    expect(before - cutoff).toBeGreaterThanOrEqual(15 * 60 * 1000 - 1000);
  });
});
