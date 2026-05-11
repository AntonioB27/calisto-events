import { describe, expect, it } from "vitest";

import { isPaidPlanForCheckout, planUnitAmountEuroCents, truncateStripeMetadataTitle } from "./event-stripe-checkout";

describe("event-stripe-checkout", () => {
  it("isPaidPlanForCheckout", () => {
    expect(isPaidPlanForCheckout("free")).toBe(false);
    expect(isPaidPlanForCheckout("standard")).toBe(true);
  });

  it("planUnitAmountEuroCents", () => {
    expect(planUnitAmountEuroCents("standard")).toBe(1500);
    expect(planUnitAmountEuroCents("max")).toBe(9000);
  });

  it("truncateStripeMetadataTitle", () => {
    const short = "Hi";
    expect(truncateStripeMetadataTitle(short, 480)).toBe(short);
    const long = "x".repeat(500);
    const out = truncateStripeMetadataTitle(long, 480);
    expect(out.length).toBeLessThanOrEqual(480);
    expect(out.endsWith("\u2026")).toBe(true);
  });
});
