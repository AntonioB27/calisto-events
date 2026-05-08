import { describe, expect, it, vi } from "vitest";

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  }),
}));

import { AuthRequiredError, requireOrganizerSession } from "@/lib/supabase-auth-server";

describe("requireOrganizerSession", () => {
  it("throws typed AUTH_REQUIRED error when session is missing", async () => {
    await expect(requireOrganizerSession(null)).rejects.toBeInstanceOf(AuthRequiredError);
    await expect(requireOrganizerSession(null)).rejects.toMatchObject({
      code: "AUTH_REQUIRED",
    });
  });

  it("returns userId from explicit context", async () => {
    await expect(
      requireOrganizerSession({
        userId: "org_user_123",
      }),
    ).resolves.toEqual({
      userId: "org_user_123",
    });
  });

  it("does not trust explicit context outside test env", async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    try {
      await expect(
        requireOrganizerSession({
          userId: "org_user_123",
        }),
      ).rejects.toBeInstanceOf(AuthRequiredError);
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
    }
  });
});
