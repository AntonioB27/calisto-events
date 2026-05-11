import { beforeEach, describe, expect, it, vi } from "vitest";

import * as signRoute from "./route";

const getUserMock = vi.fn<
  () => Promise<{ data: { user: { id: string } | null }; error: null }>
>();

const eventMaybeSingle = vi.fn();
const jobMaybeSingle = vi.fn();
const createSignedUrl = vi.fn();

vi.mock("@/lib/supabase-auth-server", () => ({
  getSupabaseAuthServerClient: () => ({
    auth: { getUser: getUserMock },
    from: (table: string) => {
      if (table === "events") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: eventMaybeSingle,
            }),
          }),
        };
      }
      if (table === "media_zip_exports") {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: jobMaybeSingle,
              }),
            }),
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  }),
}));

vi.mock("@/lib/supabase-server", () => ({
  getSupabaseServerClient: () => ({
    storage: {
      from: () => ({
        createSignedUrl: createSignedUrl,
      }),
    },
  }),
}));

describe("POST /api/events/[id]/zip-export/[jobId]/sign", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    eventMaybeSingle.mockReset();
    jobMaybeSingle.mockReset();
    createSignedUrl.mockReset();

    getUserMock.mockResolvedValue({ data: { user: { id: "org_1" } }, error: null });
    eventMaybeSingle.mockResolvedValue({
      data: { id: "evt_1", organizer_id: "org_1" },
      error: null,
    });
    jobMaybeSingle.mockResolvedValue({
      data: {
        id: "job_1",
        event_id: "evt_1",
        status: "ready",
        storage_path: "exports/evt_1/job_1.zip",
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      },
      error: null,
    });
    createSignedUrl.mockResolvedValue({ data: { signedUrl: "https://signed.example/x" }, error: null });
  });

  it("returns 403 for non-organizer", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: { id: "other" } }, error: null });
    const res = await signRoute.POST(new Request("http://localhost/x"), {
      params: Promise.resolve({ id: "evt_1", jobId: "job_1" }),
    });
    expect(res.status).toBe(403);
  });

  it("returns 404 when job does not match event", async () => {
    jobMaybeSingle.mockResolvedValueOnce({ data: null, error: null });
    const res = await signRoute.POST(new Request("http://localhost/x"), {
      params: Promise.resolve({ id: "evt_1", jobId: "missing" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 409 when export is not ready", async () => {
    jobMaybeSingle.mockResolvedValueOnce({
      data: {
        id: "job_1",
        event_id: "evt_1",
        status: "queued",
        storage_path: null,
        expires_at: null,
      },
      error: null,
    });
    const res = await signRoute.POST(new Request("http://localhost/x"), {
      params: Promise.resolve({ id: "evt_1", jobId: "job_1" }),
    });
    expect(res.status).toBe(409);
  });

  it("returns signed URL when ready", async () => {
    const res = await signRoute.POST(new Request("http://localhost/x"), {
      params: Promise.resolve({ id: "evt_1", jobId: "job_1" }),
    });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ url: "https://signed.example/x" });
  });
});
