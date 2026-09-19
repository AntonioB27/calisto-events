import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.hoisted(() => vi.fn());
vi.mock("@/lib/supabase-auth-server", () => ({
  getSupabaseAuthServerClient: () => ({ rpc }),
}));

import { POST } from "./route";

const token = "1e1b0a70-251a-4df8-8fb8-a9e714c1d1d7";
const ctx = { params: Promise.resolve({ token }) };
function request(body: unknown) {
  return new Request(`http://localhost/api/digital-invitations/${token}/rsvp`, {
    method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => { vi.clearAllMocks(); rpc.mockResolvedValue({ data: [{ response_status: "attending" }], error: null }); });

describe("digital invitation RSVP", () => {
  it("does not query a malformed invitation token", async () => {
    const response = await POST(request({ status: "attending", attendeeNames: ["Ana"] }), { params: Promise.resolve({ token: "not-a-token" }) });
    expect(response.status).toBe(404); expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects malformed responses before calling the database", async () => {
    const response = await POST(request({ status: "maybe", attendeeNames: "Ana" }), ctx);
    expect(response.status).toBe(400); expect(rpc).not.toHaveBeenCalled();
  });

  it("submits named attendees through the public RPC", async () => {
    const response = await POST(request({ status: "attending", attendeeNames: ["Ana", "Luka"] }), ctx);
    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("submit_digital_invitation_rsvp", {
      p_token: token, p_status: "attending", p_attendee_names: ["Ana", "Luka"],
    });
  });

  it("keeps a closed RSVP closed", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "RSVP_CLOSED" } });
    const response = await POST(request({ status: "attending", attendeeNames: ["Ana"] }), ctx);
    expect(response.status).toBe(403);
  });
});
