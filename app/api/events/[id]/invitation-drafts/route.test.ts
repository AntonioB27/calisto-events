import { beforeEach, describe, expect, it, vi } from "vitest";
import { INVITATION_PRINT_TEMPLATE_IDS } from "@/lib/event-print/template-catalog";

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), maybeSingle: vi.fn(), upsert: vi.fn() }));
vi.mock("@/lib/supabase-auth-server", () => ({
  getSupabaseAuthServerClient: () => ({
    auth: { getUser: mocks.getUser },
    from: (table: string) => table === "events"
      ? { select: () => ({ eq: () => ({ maybeSingle: mocks.maybeSingle }) }) }
      : { upsert: mocks.upsert },
  }),
}));
import { POST } from "./route";
const ctx = { params: Promise.resolve({ id: "event-1" }) };
function request(fields: unknown = { partner_a: "Ana", partner_b: "Luka" }) {
  return new Request("http://localhost/api/events/event-1/invitation-drafts", {
    method: "POST", body: JSON.stringify({ fieldValues: fields }),
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user: { id: "owner" } } });
  mocks.maybeSingle.mockResolvedValue({ data: { organizer_id: "owner", event_kind: "wedding" }, error: null });
  mocks.upsert.mockResolvedValue({ error: null });
});
describe("invitation draft saving", () => {
  it("saves every design atomically and retains photo and visibility fields where supported", async () => {
    const response = await POST(request({ partner_a: " Ana ", partner_b: "Luka", couple_photo_path: "event-1/invite-photo/photo.jpg", show_quote: "0" }), ctx);
    expect(response.status).toBe(200);
    expect(mocks.upsert).toHaveBeenCalledTimes(1);
    const [rows, options] = mocks.upsert.mock.calls[0];
    expect(rows.map((r: { template_id: string }) => r.template_id)).toEqual([...INVITATION_PRINT_TEMPLATE_IDS]);
    expect(rows.every((r: { event_id: string; field_values: { partner_a: string } }) => r.event_id === "event-1" && r.field_values.partner_a === "Ana")).toBe(true);
    expect(rows.find((r: { template_id: string }) => r.template_id === "wedding-invite-gold-circles-photo").field_values.couple_photo_path).toBe("event-1/invite-photo/photo.jpg");
    expect(rows.every((r: { field_values: { show_quote: string } }) => r.field_values.show_quote === "0")).toBe(true);
    expect(options).toEqual({ onConflict: "event_id,template_id" });
  });
  it("rejects anonymous users", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    expect((await POST(request(), ctx)).status).toBe(401);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it("rejects other organizers", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { organizer_id: "other", event_kind: "wedding" } });
    expect((await POST(request(), ctx)).status).toBe(403);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it("rejects non-wedding events", async () => {
    mocks.maybeSingle.mockResolvedValue({ data: { organizer_id: "owner", event_kind: "generic" } });
    expect((await POST(request(), ctx)).status).toBe(400);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it.each([null, [], {}, { partner_a: "Ana", partner_b: "x".repeat(81) }, { partner_a: "Ana", partner_b: "Luka", show_quote: "invalid" }])("rejects invalid fields without saving: %j", async (fields) => {
    expect((await POST(request(fields), ctx)).status).toBe(400);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it("reports database failures", async () => {
    mocks.upsert.mockResolvedValue({ error: { message: "failure" } });
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await POST(request(), ctx)).status).toBe(500);
    log.mockRestore();
  });
});
