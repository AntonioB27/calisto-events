import { beforeEach, describe, expect, it, vi } from "vitest";

import * as deleteRoute from "./route";

const getUserMock = vi.fn<
  () => Promise<{ data: { user: { id: string } | null }; error: null }>
>();

const rpcMock = vi.fn<
  (...args: unknown[]) => Promise<{ data: unknown; error: null } | { data: null; error: { message: string } }>
>();

const maybeSingleMock = vi.fn<
  () => Promise<{
    data: { id: string; title: string; organizer_id: string } | null;
    error: null;
  }>
>();

const removeMock = vi.fn<(paths: string[]) => Promise<{ error: null | { message: string } }>>();

vi.mock("@/lib/supabase-auth-server", () => ({
  getSupabaseAuthServerClient: () => ({
    auth: {
      getUser: getUserMock,
    },
    rpc: (...args: unknown[]) => rpcMock(...args),
  }),
}));

describe("DELETE event route", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    rpcMock.mockReset();
    maybeSingleMock.mockReset();
    removeMock.mockReset();

    deleteRoute.__test.getSupabaseServerClient = () =>
      ({
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle: maybeSingleMock,
            }),
          }),
        }),
        storage: {
          from: () => ({
            remove: removeMock,
          }),
        },
      }) as ReturnType<(typeof deleteRoute)["__test"]["getSupabaseServerClient"]>;

    getUserMock.mockResolvedValue({ data: { user: { id: "org_1" } }, error: null });
    maybeSingleMock.mockResolvedValue({
      data: { id: "evt_1", title: "💍 Gala", organizer_id: "org_1" },
      error: null,
    });
    rpcMock.mockResolvedValue({ data: ["events/evt_1/a.jpg", "events/evt_1/b.jpg"], error: null });
    removeMock.mockResolvedValue({ error: null });
  });

  it("returns 401 when not signed in", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null }, error: null });
    const res = await deleteRoute.POST(
      new Request("http://localhost/api/events/evt_1/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventTitleConfirm: "💍 Gala" }),
      }),
      { params: Promise.resolve({ id: "evt_1" }) },
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 on confirm mismatch", async () => {
    const res = await deleteRoute.POST(
      new Request("http://localhost/api/events/evt_1/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventTitleConfirm: "Wrong title" }),
      }),
      { params: Promise.resolve({ id: "evt_1" }) },
    );
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toMatchObject({ error: "CONFIRM_MISMATCH" });
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("returns 200, runs rpc + storage removal when confirm matches stored title", async () => {
    const res = await deleteRoute.POST(
      new Request("http://localhost/api/events/evt_1/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventTitleConfirm: "💍 Gala" }),
      }),
      { params: Promise.resolve({ id: "evt_1" }) },
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toMatchObject({ ok: true });

    expect(rpcMock).toHaveBeenCalledWith("delete_event_as_primary_return_paths", { p_event_id: "evt_1" });

    expect(removeMock).toHaveBeenCalledTimes(1);
    expect(removeMock).toHaveBeenCalledWith(["events/evt_1/a.jpg", "events/evt_1/b.jpg"]);
  });

  it("accepts DELETE literal instead of title", async () => {
    const res = await deleteRoute.POST(
      new Request("http://localhost/api/events/evt_1/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteWordConfirm: "DELETE" }),
      }),
      { params: Promise.resolve({ id: "evt_1" }) },
    );
    expect(res.status).toBe(200);
  });
});
