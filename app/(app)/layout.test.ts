import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn();
const requireOrganizerSessionMock = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/onboarding-profile", () => ({
  needsOrganizerOnboarding: vi.fn().mockResolvedValue(false),
}));

vi.mock("@/lib/supabase-auth-server", async (importOriginal) => {
  const original = (await importOriginal()) as object;
  return {
    ...original,
    requireOrganizerSession: requireOrganizerSessionMock,
    createSupabaseAuthServerClient: vi.fn().mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: { id: "org_123", email: "org@example.com", user_metadata: { full_name: "Organizer" } } },
          error: null,
        })),
      },
    }),
  };
});

describe("ProtectedAppLayout", () => {
  beforeEach(() => {
    redirectMock.mockReset();
    requireOrganizerSessionMock.mockReset();
    redirectMock.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  it("redirects to /auth/login when auth is required", async () => {
    const { default: ProtectedAppLayout } = await import("./layout");
    requireOrganizerSessionMock.mockRejectedValue({ code: "AUTH_REQUIRED" });

    await expect(
      ProtectedAppLayout({
        children: "content",
      }),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
  });

  it("renders children when organizer session exists", async () => {
    const { default: ProtectedAppLayout } = await import("./layout");
    requireOrganizerSessionMock.mockResolvedValue({
      userId: "org_123",
    });

    const result = await ProtectedAppLayout({
      children: "content",
    });

    expect(result).toBeTruthy();
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
