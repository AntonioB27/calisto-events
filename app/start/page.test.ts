import { beforeEach, describe, expect, it, vi } from "vitest";

const redirectMock = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(null),
  }),
}));

describe("StartRedirectPage", () => {
  beforeEach(() => {
    redirectMock.mockReset();
    redirectMock.mockImplementation(() => { throw new Error("NEXT_REDIRECT"); });
  });

  it("redirects to /en/start when no Accept-Language header", async () => {
    const { default: StartRedirectPage } = await import("./page");
    await expect(StartRedirectPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/en/start");
  });

  it("redirects to /hr/start for Croatian Accept-Language", async () => {
    vi.mocked((await import("next/headers")).headers).mockResolvedValue({
      get: vi.fn().mockReturnValue("hr,en;q=0.9"),
    } as never);

    const { default: StartRedirectPage } = await import("./page");
    await expect(StartRedirectPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(redirectMock).toHaveBeenCalledWith("/hr/start");
  });
});
