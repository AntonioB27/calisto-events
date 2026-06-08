import { beforeEach, describe, expect, it, vi } from "vitest";

import { maxGuestUploadBytesForMime } from "@/lib/guest-upload-limits";
import { generateImageThumbnail } from "@/lib/image-thumbnail";

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
  getSupabaseServerClient: () => ({
    storage: {
      from: () => ({
        upload: async () => ({ error: null }),
      }),
    },
  }),
}));

const getEventUploadContextMock = vi.fn<
  (eventId: string) => Promise<{ planId: "free" | "standard" | "plus" | "premium" | "max"; eventDate: string; moderationEnabled: boolean; organizerId: string } | null>
>();
const countMediaForQuotaMock = vi.fn<(eventId: string, mediaType: "photo" | "video") => Promise<number>>();
const insertMediaItemMock = vi.fn<
  (params: {
    eventId: string;
    uploaderId: string;
    filePath: string;
    mimeType: string;
    sizeBytes: number;
    thumbnailPath: string | null;
    moderationStatus: "visible" | "pending";
  }) => Promise<{ id: string; storage_path: string }>
>();

const maxBytesMock = vi.fn<(mime: string) => number>();

beforeEach(() => {
  getEventUploadContextMock.mockReset();
  countMediaForQuotaMock.mockReset();
  insertMediaItemMock.mockReset();
  maxBytesMock.mockReset();
  maxBytesMock.mockImplementation((mime: string) => maxGuestUploadBytesForMime(mime));
  __test.getEventUploadContext = getEventUploadContextMock;
  __test.countMediaForQuota = countMediaForQuotaMock;
  __test.insertMediaItem = insertMediaItemMock;
  __test.maxGuestUploadBytesForMime = maxBytesMock;
});

describe("guest-upload route", () => {
  it("returns 403 with QUOTA_REACHED when quota exceeded", async () => {
    vi.useFakeTimers({ now: new Date("2026-05-07T12:00:00.000Z") });
    try {
      getEventUploadContextMock.mockResolvedValue({
        planId: "free",
        eventDate: "2026-05-06T00:00:00.000Z",
        moderationEnabled: false,
        organizerId: "org_1",
      });
      countMediaForQuotaMock.mockResolvedValue(20);

      const form = new FormData();
      form.append("file", new File(["hello"], "photo.jpg", { type: "image/jpeg" }));
      const request = new Request("http://localhost/api/events/evt_1/guest-upload", {
        method: "POST",
        body: form,
      });

      const response = await POST(request, { params: Promise.resolve({ id: "evt_1" }) });

      expect(response.status).toBe(403);
      await expect(response.json()).resolves.toEqual({ error: "QUOTA_REACHED" });
      expect(insertMediaItemMock).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it("returns 200 when within quota and upload window", async () => {
    vi.useFakeTimers({ now: new Date("2026-05-07T12:00:00.000Z") });
    try {
      getEventUploadContextMock.mockResolvedValue({
        planId: "standard",
        eventDate: "2026-05-06T00:00:00.000Z",
        moderationEnabled: false,
        organizerId: "org_1",
      });
      countMediaForQuotaMock.mockResolvedValue(10);
      insertMediaItemMock.mockResolvedValue({ id: "m1", storage_path: "events/evt_2/x.jpg" });

      const form = new FormData();
      form.append("file", new File(["hello"], "photo.jpg", { type: "image/jpeg" }));
      const request = new Request("http://localhost/api/events/evt_2/guest-upload", {
        method: "POST",
        body: form,
      });

      const response = await POST(request, { params: Promise.resolve({ id: "evt_2" }) });

      expect(response.status).toBe(201);
      await expect(response.json()).resolves.toEqual({ id: "m1", file_path: "events/evt_2/x.jpg" });
      expect(insertMediaItemMock).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("returns 413 FILE_TOO_LARGE when file exceeds cap", async () => {
    maxBytesMock.mockReturnValueOnce(4);
    getEventUploadContextMock.mockResolvedValue({
      planId: "standard",
      eventDate: "2026-05-06T00:00:00.000Z",
      moderationEnabled: false,
      organizerId: "org_1",
    });
    countMediaForQuotaMock.mockResolvedValue(0);

    const form = new FormData();
    form.append("file", new File(["hello"], "big.jpg", { type: "image/jpeg" }));
    const request = new Request("http://localhost/api/events/evt_3/guest-upload", {
      method: "POST",
      body: form,
    });

    const response = await POST(request, { params: Promise.resolve({ id: "evt_3" }) });

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({ error: "FILE_TOO_LARGE" });
    expect(insertMediaItemMock).not.toHaveBeenCalled();
  });

  it("passes thumbnail_path to insertMediaItem for image uploads", async () => {
    vi.useFakeTimers({ now: new Date("2026-05-07T12:00:00.000Z") });
    try {
      getEventUploadContextMock.mockResolvedValue({
        planId: "free",
        eventDate: "2026-05-06T00:00:00.000Z",
        moderationEnabled: false,
        organizerId: "org_1",
      });
      countMediaForQuotaMock.mockResolvedValue(0);
      insertMediaItemMock.mockResolvedValue({ id: "m1", storage_path: "events/evt_1/x.jpg" });
      __test.generateThumbnail = async (_buf: ArrayBuffer, _mime: string) =>
        Buffer.from("fake-thumbnail");

      const form = new FormData();
      form.append("file", new File(["hello"], "photo.jpg", { type: "image/jpeg" }));
      const request = new Request("http://localhost/api/events/evt_1/guest-upload", {
        method: "POST",
        body: form,
      });

      const response = await POST(request, { params: Promise.resolve({ id: "evt_1" }) });

      expect(response.status).toBe(201);
      const call = insertMediaItemMock.mock.calls[0]?.[0];
      expect(call?.thumbnailPath).toMatch(/^events\/evt_1\/thumbnails\//);
    } finally {
      vi.useRealTimers();
      __test.generateThumbnail = generateImageThumbnail as (buf: ArrayBuffer, mime: string) => Promise<Buffer | null>;
    }
  });

  it("still succeeds when thumbnail generation returns null", async () => {
    vi.useFakeTimers({ now: new Date("2026-05-07T12:00:00.000Z") });
    try {
      getEventUploadContextMock.mockResolvedValue({
        planId: "standard",
        eventDate: "2026-05-06T00:00:00.000Z",
        moderationEnabled: false,
        organizerId: "org_1",
      });
      countMediaForQuotaMock.mockResolvedValue(0);
      insertMediaItemMock.mockResolvedValue({ id: "m2", storage_path: "events/evt_1/x.mp4" });
      __test.generateThumbnail = async (_buf: ArrayBuffer, _mime: string) => null;

      const form = new FormData();
      form.append("file", new File(["hello"], "video.mp4", { type: "video/mp4" }));
      const request = new Request("http://localhost/api/events/evt_1/guest-upload", {
        method: "POST",
        body: form,
      });

      const response = await POST(request, { params: Promise.resolve({ id: "evt_1" }) });

      expect(response.status).toBe(201);
      const call = insertMediaItemMock.mock.calls[0]?.[0];
      expect(call?.thumbnailPath).toBeNull();
    } finally {
      vi.useRealTimers();
      __test.generateThumbnail = generateImageThumbnail as (buf: ArrayBuffer, mime: string) => Promise<Buffer | null>;
    }
  });

  it("inserts with moderation_status pending when event moderation is enabled", async () => {
    vi.useFakeTimers({ now: new Date("2026-06-06T12:00:00.000Z") });
    try {
      getEventUploadContextMock.mockResolvedValue({
        planId: "standard",
        eventDate: "2026-06-05T12:00:00.000Z",
        moderationEnabled: true,
        organizerId: "org_1",
      });
      countMediaForQuotaMock.mockResolvedValue(0);
      insertMediaItemMock.mockResolvedValue({ id: "m1", storage_path: "events/e1/f.jpg" });

      const file = new File(["x"], "photo.jpg", { type: "image/jpeg" });
      const form = new FormData();
      form.append("file", file);
      const req = new Request("http://localhost/api/events/e1/guest-upload", {
        method: "POST",
        body: form,
      });
      const res = await POST(req, { params: Promise.resolve({ id: "e1" }) });
      expect(res.status).toBe(201);
      expect(insertMediaItemMock).toHaveBeenCalledWith(
        expect.objectContaining({ moderationStatus: "pending" }),
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it("inserts with moderation_status visible when event moderation is disabled", async () => {
    vi.useFakeTimers({ now: new Date("2026-06-06T12:00:00.000Z") });
    try {
      getEventUploadContextMock.mockResolvedValue({
        planId: "standard",
        eventDate: "2026-06-05T12:00:00.000Z",
        moderationEnabled: false,
        organizerId: "org_1",
      });
      countMediaForQuotaMock.mockResolvedValue(0);
      insertMediaItemMock.mockResolvedValue({ id: "m2", storage_path: "events/e1/g.jpg" });

      const file = new File(["x"], "photo.jpg", { type: "image/jpeg" });
      const form = new FormData();
      form.append("file", file);
      const req = new Request("http://localhost/api/events/e1/guest-upload", {
        method: "POST",
        body: form,
      });
      const res = await POST(req, { params: Promise.resolve({ id: "e1" }) });
      expect(res.status).toBe(201);
      expect(insertMediaItemMock).toHaveBeenCalledWith(
        expect.objectContaining({ moderationStatus: "visible" }),
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
