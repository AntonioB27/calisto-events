import { beforeEach, describe, expect, it, vi } from "vitest";

import type Stripe from "stripe";

import * as webhookRoute from "./route";

const fulfillMock = vi.fn<
  (stripe: Stripe, sessionId: string) => Promise<
    Readonly<{ ok: true; eventId: string; alreadyExisted: boolean } | { ok: false; error: string }>
  >
>();

const upgradeFulfillMock = vi.fn<
  (stripe: Stripe, sessionId: string) => Promise<
    Readonly<
      | { ok: true; eventId: string; plan: string; alreadyExisted: boolean }
      | { ok: false; error: string }
    >
  >
>();

vi.mock("@/lib/event-stripe-checkout", () => ({
  fulfillPaidEventFromCheckoutSession: (...args: unknown[]) =>
    fulfillMock(args[0] as Stripe, args[1] as string),
  fulfillEventUpgradeFromCheckoutSession: (...args: unknown[]) =>
    upgradeFulfillMock(args[0] as Stripe, args[1] as string),
}));

const constructEventMock = vi.fn<(payload: string, sig: string, secret: string) => Stripe.Event>();

vi.mock("@/lib/stripe-server", () => ({
  getStripe: () =>
    ({
      webhooks: {
        constructEvent: (...args: unknown[]) =>
          constructEventMock(args[0] as string, args[1] as string, args[2] as string),
      },
    }) as Stripe,
}));

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    fulfillMock.mockReset();
    upgradeFulfillMock.mockReset();
    constructEventMock.mockReset();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
    constructEventMock.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          object: "checkout.session",
        },
      },
    } as Stripe.Event);
  });

  it("returns 500 when fulfillment fails with a retriable error", async () => {
    fulfillMock.mockResolvedValue({ ok: false, error: "Payment is not completed yet." });

    const res = await webhookRoute.POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        body: "{}",
        headers: { "stripe-signature": "sig" },
      }),
    );

    expect(res.status).toBe(500);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe("Payment is not completed yet.");
  });

  it("returns 200 when fulfillment fails with a permanent configuration error", async () => {
    fulfillMock.mockResolvedValue({ ok: false, error: "Checkout metadata is incomplete." });

    const res = await webhookRoute.POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        body: "{}",
        headers: { "stripe-signature": "sig" },
      }),
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as { received?: boolean };
    expect(body.received).toBe(true);
  });

  it("returns 200 when fulfillment succeeds", async () => {
    fulfillMock.mockResolvedValue({ ok: true, eventId: "evt_db", alreadyExisted: false });

    const res = await webhookRoute.POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        body: "{}",
        headers: { "stripe-signature": "sig" },
      }),
    );

    expect(res.status).toBe(200);
    expect(fulfillMock).toHaveBeenCalledWith(expect.anything(), "cs_test_123");
  });

  it("routes upgrade sessions to the upgrade fulfiller, not the create path", async () => {
    constructEventMock.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_upgrade",
          object: "checkout.session",
          metadata: { kind: "upgrade", organizer_id: "org_1", event_id: "evt_1", plan: "plus" },
        },
      },
    } as unknown as Stripe.Event);
    upgradeFulfillMock.mockResolvedValue({ ok: true, eventId: "evt_1", plan: "plus", alreadyExisted: false });

    const res = await webhookRoute.POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        body: "{}",
        headers: { "stripe-signature": "sig" },
      }),
    );

    expect(res.status).toBe(200);
    expect(upgradeFulfillMock).toHaveBeenCalledWith(expect.anything(), "cs_test_upgrade");
    expect(fulfillMock).not.toHaveBeenCalled();
  });

  it("returns 500 when an upgrade fulfillment fails with a retriable error", async () => {
    constructEventMock.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_upgrade",
          object: "checkout.session",
          metadata: { kind: "upgrade", organizer_id: "org_1", event_id: "evt_1", plan: "plus" },
        },
      },
    } as unknown as Stripe.Event);
    upgradeFulfillMock.mockResolvedValue({ ok: false, error: "Payment is not completed yet." });

    const res = await webhookRoute.POST(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        body: "{}",
        headers: { "stripe-signature": "sig" },
      }),
    );

    expect(res.status).toBe(500);
  });
});

describe("isPermanentCheckoutFulfillmentError", () => {
  it("classifies known permanent messages", () => {
    expect(webhookRoute.isPermanentCheckoutFulfillmentError("Checkout metadata is incomplete.")).toBe(true);
    expect(
      webhookRoute.isPermanentCheckoutFulfillmentError("Checkout session is not a one-time payment."),
    ).toBe(true);
    expect(webhookRoute.isPermanentCheckoutFulfillmentError("Invalid plan for paid checkout.")).toBe(true);
  });

  it("treats transient fulfillment errors as non-permanent", () => {
    expect(webhookRoute.isPermanentCheckoutFulfillmentError("Payment is not completed yet.")).toBe(false);
    expect(webhookRoute.isPermanentCheckoutFulfillmentError("Could not create event.")).toBe(false);
  });
});
