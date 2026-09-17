import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const createCheckoutSession = vi.fn();

vi.mock("@/lib/stripe-server", () => ({
  getStripe: () => ({
    checkout: { sessions: { create: createCheckoutSession } },
  }),
}));

vi.mock("@/lib/supabase-auth-server", () => ({
  getSupabaseAuthServerClient: () => ({
    auth: {
      getUser: async () => ({
        data: { user: { id: "organizer_1", email: "organizer@example.com" } },
      }),
    },
  }),
}));

vi.mock("@/lib/ui-locale", () => ({ getUiLocale: async () => "en" }));

import { POST } from "./route";

describe("POST /api/stripe/checkout-create-event", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-01T12:00:00+02:00"));
    createCheckoutSession.mockResolvedValue({ url: "https://checkout.stripe.test/session" });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("applies the Founding Events price server-side and records it in Stripe metadata", async () => {
    const response = await POST(new Request("https://calisto-events.com/api/stripe/checkout-create-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Ana and Marko", date: "2026-10-10", planId: "plus" }),
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ url: "https://checkout.stripe.test/session" });
    expect(createCheckoutSession).toHaveBeenCalledTimes(1);

    const session = createCheckoutSession.mock.calls[0]?.[0];
    expect(session.allow_promotion_codes).toBe(false);
    expect(session.line_items[0].price_data.unit_amount).toBe(1750);
    expect(session.line_items[0].price_data.product_data.description).toContain("50% off");
    expect(session.metadata).toMatchObject({
      promotion: "founding_events_2026",
      list_price_eur_cents: "3500",
      discount_eur_cents: "1750",
    });
  });
});
