import { describe, expect, it } from "vitest";

import {
  FOUNDING_EVENTS_PROMOTION,
  getFoundingEventsPrice,
  isFoundingEventsPromotionActive,
} from "./founding-events-promotion";

describe("Founding Events promotion", () => {
  it("is active for the full advertised month", () => {
    expect(isFoundingEventsPromotionActive(new Date("2026-09-17T00:00:00+02:00"))).toBe(true);
    expect(isFoundingEventsPromotionActive(new Date("2026-10-17T23:59:59+02:00"))).toBe(true);
    expect(isFoundingEventsPromotionActive(new Date(FOUNDING_EVENTS_PROMOTION.endsAt))).toBe(false);
  });

  it("halves a paid event's checkout price and records the offer", () => {
    expect(getFoundingEventsPrice(3500, new Date("2026-10-01T12:00:00+02:00"))).toEqual({
      listAmountEuroCents: 3500,
      amountEuroCents: 1750,
      discountEuroCents: 1750,
      promotionId: "founding_events_2026",
    });
  });

  it("keeps the list price outside the campaign", () => {
    expect(getFoundingEventsPrice(3500, new Date("2026-10-18T00:00:00+02:00"))).toEqual({
      listAmountEuroCents: 3500,
      amountEuroCents: 3500,
      discountEuroCents: 0,
      promotionId: null,
    });
  });

  it("does not label the free plan as discounted", () => {
    expect(getFoundingEventsPrice(0, new Date("2026-10-01T12:00:00+02:00"))).toMatchObject({
      amountEuroCents: 0,
      discountEuroCents: 0,
      promotionId: null,
    });
  });
});
