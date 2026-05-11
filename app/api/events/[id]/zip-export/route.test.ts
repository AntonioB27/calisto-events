import { beforeEach, describe, expect, it, vi } from "vitest";

import * as zipRoute from "./route";

const getUserMock = vi.fn<
  () => Promise<{ data: { user: { id: string } | null }; error: null }>
>();

const eventMaybeSingle = vi.fn();
const pendingMaybeSingle = vi.fn();
const insertSingle = vi.fn();
const mediaCountResult = vi.fn(() => Promise.resolve({ count: 2, error: null }));

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
              in: () => ({
                maybeSingle: pendingMaybeSingle,
              }),
            }),
          }),
          insert: () => ({
            select: () => ({
              single: insertSingle,
            }),
          }),
        };
      }
      if (table === "media_items") {
        return {
          select: () => ({
            eq: () => mediaCountResult(),
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  }),
}));

describe("POST /api/events/[id]/zip-export", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    eventMaybeSingle.mockReset();
    pendingMaybeSingle.mockReset();
    insertSingle.mockReset();
    mediaCountResult.mockClear();
    mediaCountResult.mockImplementation(() => Promise.resolve({ count: 2, error: null }));

    getUserMock.mockResolvedValue({ data: { user: { id: "org_1" } }, error: null });
    eventMaybeSingle.mockResolvedValue({
      data: { id: "evt_1", organizer_id: "org_1" },
      error: null,
    });
    pendingMaybeSingle.mockResolvedValue({ data: null, error: null });
    insertSingle.mockResolvedValue({ data: { id: "job_1" }, error: null });
  });

  it("returns 401 when not signed in", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null }, error: null });
    const res = await zipRoute.POST(
      new Request("http://localhost/api/events/evt_1/zip-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includeVideos: true }),
      }),
      { params: Promise.resolve({ id: "evt_1" }) },
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 when user is not primary organizer", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: { id: "other" } }, error: null });
    const res = await zipRoute.POST(
      new Request("http://localhost/api/events/evt_1/zip-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includeVideos: true }),
      }),
      { params: Promise.resolve({ id: "evt_1" }) },
    );
    expect(res.status).toBe(403);
  });

  it("returns 409 when a job is already queued", async () => {
    pendingMaybeSingle.mockResolvedValueOnce({ data: { id: "existing" }, error: null });
    const res = await zipRoute.POST(
      new Request("http://localhost/api/events/evt_1/zip-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includeVideos: true }),
      }),
      { params: Promise.resolve({ id: "evt_1" }) },
    );
    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toMatchObject({ error: "ZIP_JOB_ALREADY_PENDING" });
    expect(insertSingle).not.toHaveBeenCalled();
  });

  it("returns 201 with job id when queued", async () => {
    const res = await zipRoute.POST(
      new Request("http://localhost/api/events/evt_1/zip-export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includeVideos: true }),
      }),
      { params: Promise.resolve({ id: "evt_1" }) },
    );
    expect(res.status).toBe(201);
    await expect(res.json()).resolves.toMatchObject({ id: "job_1" });
  });
});
