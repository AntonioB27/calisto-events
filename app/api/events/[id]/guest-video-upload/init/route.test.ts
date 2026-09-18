import { beforeEach, describe, expect, it, vi } from "vitest";

import { __test, POST } from "./route";

vi.mock("@/lib/supabase-auth-server", () => ({
  getSupabaseAuthServerClient: () => ({
    auth: {
      getUser: async () => ({
        data: { user: { id: "user_1", email: "guest@example.com", user_metadata: {} } },
      }),
    },
  }),
}));

const createSignedUploadUrlMock = vi.fn();
vi.mock("@/lib/supabase-server", () => ({
  getSupabaseServerClient: () => ({
    storage: {
      from: () => ({
        createSignedUploadUrl: createSignedUploadUrlMock,
      }),
    },
  }),
}));

const getEventUploadContextMock = vi.fn<
  (eventId: string) => Promise<{ planId: "free" | "standard" | "plus" | "premium" | "max"; eventDate: string; moderationEnabled: boolean; organizerId: string } | null>
>();
const countMediaForQuotaMock = vi.fn<(eventId: string, mediaType: "photo" | "video") => Promise<number>>();

function makeRequest(eventId: string, body: unknown) {
  return new Request(`http://localhost/api/events/${eventId}/guest-video-upload/init`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  getEventUploadContextMock.mockReset();
  countMediaForQuotaMock.mockReset();
  createSignedUploadUrlMock.mockReset();
  createSignedUploadUrlMock.mockResolvedValue({
    data: { path: "events/evt_1/generated.mp4", token: "tok_123" },
    error: null,
  });
  __test.getEventUploadContext = getEventUploadContextMock;
  __test.countMediaForQuota = countMediaForQuotaMock;
});

describe("guest-video-upload init route", () => {
  it("returns 415 for a non-video mime type", async () => {
    const res = await POST(makeRequest("evt_1", { mimeType: "image/jpeg", sizeBytes: 1000 }), {
      params: Promise.resolve({ id: "evt_1" }),
    });
    expect(res.status).toBe(415);
  });

  it("returns 413 when declared size exceeds the video cap", async () => {
    const res = await POST(
      makeRequest("evt_1", { mimeType: "video/mp4", sizeBytes: 280 * 1024 * 1024 + 1 }),
      { params: Promise.resolve({ id: "evt_1" }) },
    );
    expect(res.status).toBe(413);
    await expect(res.json()).resolves.toEqual({ error: "FILE_TOO_LARGE" });
  });

  it("returns 404 when the event doesn't exist", async () => {
    getEventUploadContextMock.mockResolvedValue(null);
    const res = await POST(makeRequest("evt_missing", { mimeType: "video/mp4", sizeBytes: 1000 }), {
      params: Promise.resolve({ id: "evt_missing" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 403 QUOTA_REACHED when video quota is exhausted", async () => {
    vi.useFakeTimers({ now: new Date("2026-05-07T12:00:00.000Z") });
    try {
      getEventUploadContextMock.mockResolvedValue({
        planId: "standard",
        eventDate: "2026-05-06T00:00:00.000Z",
        moderationEnabled: false,
        organizerId: "org_1",
      });
      countMediaForQuotaMock.mockResolvedValue(10);
      const res = await POST(makeRequest("evt_1", { mimeType: "video/mp4", sizeBytes: 1000 }), {
        params: Promise.resolve({ id: "evt_1" }),
      });
      expect(res.status).toBe(403);
      await expect(res.json()).resolves.toEqual({ error: "QUOTA_REACHED" });
    } finally {
      vi.useRealTimers();
    }
  });

  it("returns a signed upload path and token when within limits", async () => {
    vi.useFakeTimers({ now: new Date("2026-05-07T12:00:00.000Z") });
    try {
      getEventUploadContextMock.mockResolvedValue({
        planId: "standard",
        eventDate: "2026-05-06T00:00:00.000Z",
        moderationEnabled: false,
        organizerId: "org_1",
      });
      countMediaForQuotaMock.mockResolvedValue(0);
      const res = await POST(makeRequest("evt_1", { mimeType: "video/mp4", sizeBytes: 1000 }), {
        params: Promise.resolve({ id: "evt_1" }),
      });
      expect(res.status).toBe(200);
      await expect(res.json()).resolves.toEqual({ path: "events/evt_1/generated.mp4", token: "tok_123" });
    } finally {
      vi.useRealTimers();
    }
  });
});
