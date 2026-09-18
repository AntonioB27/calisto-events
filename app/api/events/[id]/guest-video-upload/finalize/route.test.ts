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

vi.mock("@/lib/supabase-server", () => ({
  getSupabaseServerClient: () => ({}),
}));

const getEventUploadContextMock = vi.fn<
  (eventId: string) => Promise<{ planId: "free" | "standard" | "plus" | "premium" | "max"; eventDate: string; moderationEnabled: boolean; organizerId: string } | null>
>();
const countMediaForQuotaMock = vi.fn<(eventId: string, mediaType: "photo" | "video") => Promise<number>>();
const insertMediaItemMock = vi.fn();
const getObjectInfoMock = vi.fn();
const removeObjectMock = vi.fn();

function makeRequest(eventId: string, body: unknown) {
  return new Request(`http://localhost/api/events/${eventId}/guest-video-upload/finalize`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  getEventUploadContextMock.mockReset();
  countMediaForQuotaMock.mockReset();
  insertMediaItemMock.mockReset();
  getObjectInfoMock.mockReset();
  removeObjectMock.mockReset();
  __test.getEventUploadContext = getEventUploadContextMock;
  __test.countMediaForQuota = countMediaForQuotaMock;
  __test.insertMediaItem = insertMediaItemMock;
  __test.getObjectInfo = getObjectInfoMock;
  __test.removeObject = removeObjectMock;
});

describe("guest-video-upload finalize route", () => {
  it("rejects a path outside the event's own folder", async () => {
    const res = await POST(makeRequest("evt_1", { path: "events/other_evt/x.mp4" }), {
      params: Promise.resolve({ id: "evt_1" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 404 when the event doesn't exist", async () => {
    getEventUploadContextMock.mockResolvedValue(null);
    const res = await POST(makeRequest("evt_1", { path: "events/evt_1/x.mp4" }), {
      params: Promise.resolve({ id: "evt_1" }),
    });
    expect(res.status).toBe(404);
  });

  it("deletes the object and returns 413 when the uploaded file exceeds the cap", async () => {
    vi.useFakeTimers({ now: new Date("2026-05-07T12:00:00.000Z") });
    try {
      getEventUploadContextMock.mockResolvedValue({
        planId: "standard",
        eventDate: "2026-05-06T00:00:00.000Z",
        moderationEnabled: false,
        organizerId: "org_1",
      });
      countMediaForQuotaMock.mockResolvedValue(0);
      getObjectInfoMock.mockResolvedValue({
        data: { size: 280 * 1024 * 1024 + 1, contentType: "video/mp4" },
        error: null,
      });

      const res = await POST(makeRequest("evt_1", { path: "events/evt_1/x.mp4" }), {
        params: Promise.resolve({ id: "evt_1" }),
      });

      expect(res.status).toBe(413);
      await expect(res.json()).resolves.toEqual({ error: "FILE_TOO_LARGE" });
      expect(removeObjectMock).toHaveBeenCalledWith("events/evt_1/x.mp4");
      expect(insertMediaItemMock).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("inserts the media row using the real uploaded size when within limits", async () => {
    vi.useFakeTimers({ now: new Date("2026-05-07T12:00:00.000Z") });
    try {
      getEventUploadContextMock.mockResolvedValue({
        planId: "standard",
        eventDate: "2026-05-06T00:00:00.000Z",
        moderationEnabled: false,
        organizerId: "org_1",
      });
      countMediaForQuotaMock.mockResolvedValue(0);
      getObjectInfoMock.mockResolvedValue({
        data: { size: 120 * 1024 * 1024, contentType: "video/mp4" },
        error: null,
      });
      insertMediaItemMock.mockResolvedValue({ id: "m1", storage_path: "events/evt_1/x.mp4" });

      const res = await POST(makeRequest("evt_1", { path: "events/evt_1/x.mp4" }), {
        params: Promise.resolve({ id: "evt_1" }),
      });

      expect(res.status).toBe(201);
      await expect(res.json()).resolves.toEqual({ id: "m1", file_path: "events/evt_1/x.mp4" });
      expect(insertMediaItemMock).toHaveBeenCalledWith(
        expect.objectContaining({ sizeBytes: 120 * 1024 * 1024, mimeType: "video/mp4", thumbnailPath: null }),
      );
      expect(removeObjectMock).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});
