import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { canGuestUpload } from "@/lib/plan-limits";
import { UploadZone } from "./_components/UploadZone";

const { maybeSingleMock } = vi.hoisted(() => ({
  maybeSingleMock: vi.fn(async () => ({ data: null })),
}));

vi.mock("@/lib/supabase-server", () => ({
  getSupabaseServerClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: maybeSingleMock,
        }),
      }),
    }),
  }),
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-20T00:00:00.000Z"));
  maybeSingleMock.mockReset();
  maybeSingleMock.mockResolvedValue({ data: null });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("guest upload eligibility", () => {
  it("blocks uploads when upload window is closed", () => {
    expect(
      canGuestUpload({
        planId: "free",
        eventDate: "2026-01-01T00:00:00.000Z",
        now: "2026-01-20T00:00:00.000Z",
      }),
    ).toBe(false);
  });

  it("allows uploads when upload window is open", () => {
    expect(
      canGuestUpload({
        planId: "standard",
        eventDate: "2026-01-01T00:00:00.000Z",
        now: "2026-01-03T12:00:00.000Z",
      }),
    ).toBe(true);
  });
});

describe("UploadZone", () => {
  it("renders a file input for uploads", () => {
    const html = renderToStaticMarkup(createElement(UploadZone, { eventId: "evt_1", onUploaded: () => {} }));
    expect(html).toContain('type="file"');
    expect(html).toContain("Drag &amp; drop photos or videos here");
  });
});

describe("join access code page", () => {
  it("shows closed message for known code with expired upload window", async () => {
    const { default: JoinEventPage } = await import("./page");
    const page = await JoinEventPage({
      params: Promise.resolve({ accessCode: "oldgala" }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("Event not found");
  });

  it("shows upload input for known code with open upload window", async () => {
    const { default: JoinEventPage } = await import("./page");
    const page = await JoinEventPage({
      params: Promise.resolve({ accessCode: "party2026" }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("Event not found");
  });

  it("renders missing event state for unknown code", async () => {
    const { default: JoinEventPage } = await import("./page");
    const page = await JoinEventPage({
      params: Promise.resolve({ accessCode: "unknown-code" }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("Event not found");
    expect(html).toContain("invalid or no longer active");
  });
});
