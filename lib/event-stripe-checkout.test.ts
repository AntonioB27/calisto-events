import { describe, expect, it } from "vitest";

import {
  isPaidPlanForCheckout,
  planCreditEuroCents,
  planUnitAmountEuroCents,
  saleEuroCents,
  truncateStripeMetadataTitle,
} from "./event-stripe-checkout";

describe("event-stripe-checkout", () => {
  it("isPaidPlanForCheckout", () => {
    expect(isPaidPlanForCheckout("free")).toBe(false);
    expect(isPaidPlanForCheckout("standard")).toBe(true);
  });

  it("planUnitAmountEuroCents", () => {
    expect(planUnitAmountEuroCents("standard")).toBe(1500);
    expect(planUnitAmountEuroCents("max")).toBe(9000);
  });

  it("saleEuroCents halves prices until the end of Nov 30 CET", () => {
    const during = Date.parse("2026-11-30T23:59:00+01:00");
    const after = Date.parse("2026-12-01T00:00:00+01:00");
    expect(saleEuroCents(1500, during)).toBe(750);
    expect(saleEuroCents(9000, during)).toBe(4500);
    expect(saleEuroCents(0, during)).toBe(0);
    expect(saleEuroCents(1500, after)).toBe(1500);
    // Upgrade Premium -> Max during the sale: half the difference, never negative.
    expect(saleEuroCents(planUnitAmountEuroCents("max") - planCreditEuroCents("premium"), during)).toBe(1250);
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
