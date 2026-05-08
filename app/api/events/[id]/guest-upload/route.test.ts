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
  getSupabaseServerClient: () => ({
    storage: {
      from: () => ({
        upload: async () => ({ error: null }),
      }),
    },
  }),
}));

const getEventUploadContextMock = vi.fn<
  (eventId: string) => Promise<{ planId: "free" | "standard" | "plus" | "premium" | "max"; eventDate: string } | null>
>();
const countMediaForQuotaMock = vi.fn<(eventId: string, mediaType: "photo" | "video") => Promise<number>>();
const insertMediaItemMock = vi.fn<
  (params: {
    eventId: string;
    uploaderId: string;
    filePath: string;
    mimeType: string;
    sizeBytes: number;
  }) => Promise<{ id: string; storage_path: string }>
>();

beforeEach(() => {
  getEventUploadContextMock.mockReset();
  countMediaForQuotaMock.mockReset();
  insertMediaItemMock.mockReset();
  __test.getEventUploadContext = getEventUploadContextMock;
  __test.countMediaForQuota = countMediaForQuotaMock;
  __test.insertMediaItem = insertMediaItemMock;
});

describe("guest-upload route", () => {
  it("returns 403 with QUOTA_REACHED when quota exceeded", async () => {
    getEventUploadContextMock.mockResolvedValue({
      planId: "free",
      eventDate: "2026-05-06T00:00:00.000Z",
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
  });

  it("returns 200 when within quota and upload window", async () => {
    getEventUploadContextMock.mockResolvedValue({
      planId: "standard",
      eventDate: "2026-05-06T00:00:00.000Z",
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
  });
});

