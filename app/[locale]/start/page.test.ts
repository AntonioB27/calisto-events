import { beforeEach, describe, expect, it, vi } from "vitest";

const notFoundMock = vi.fn();

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

describe("LocaleStartPage", () => {
  beforeEach(() => {
    notFoundMock.mockReset();
    notFoundMock.mockImplementation(() => { throw new Error("NEXT_NOT_FOUND"); });
  });

  it("calls notFound for an invalid locale", async () => {
    const { default: LocaleStartPage } = await import("./page");
    await expect(
      LocaleStartPage({ params: Promise.resolve({ locale: "xx" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });

  it("renders without error for valid locales", async () => {
    const { default: LocaleStartPage } = await import("./page");
    for (const locale of ["en", "hr", "de"]) {
      const result = await LocaleStartPage({ params: Promise.resolve({ locale }) });
      expect(result).toBeTruthy();
      expect(notFoundMock).not.toHaveBeenCalled();
    }
  });
});
