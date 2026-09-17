/**
 * A deliberately short, public launch offer. The Checkout route is the source
 * of truth for the price; the client uses this module only to show the same
 * offer before a customer reaches Checkout.
 */
export const FOUNDING_EVENTS_PROMOTION = {
  id: "founding_events_2026",
  discountPercent: 50,
  startsAt: "2026-09-17T00:00:00+02:00",
  endsAt: "2026-10-18T00:00:00+02:00",
} as const;

const PLAN_LIST_PRICE_EURO_CENTS: Record<string, number> = {
  free: 0,
  standard: 1500,
  plus: 3500,
  premium: 6500,
  max: 9000,
};

export type FoundingEventsPrice = Readonly<{
  listAmountEuroCents: number;
  amountEuroCents: number;
  discountEuroCents: number;
  promotionId: typeof FOUNDING_EVENTS_PROMOTION.id | null;
}>;

export function isFoundingEventsPromotionActive(now = new Date()): boolean {
  const timestamp = now.getTime();
  return timestamp >= Date.parse(FOUNDING_EVENTS_PROMOTION.startsAt)
    && timestamp < Date.parse(FOUNDING_EVENTS_PROMOTION.endsAt);
}

export function getFoundingEventsPrice(
  listAmountEuroCents: number,
  now = new Date(),
): FoundingEventsPrice {
  if (listAmountEuroCents <= 0 || !isFoundingEventsPromotionActive(now)) {
    return {
      listAmountEuroCents,
      amountEuroCents: listAmountEuroCents,
      discountEuroCents: 0,
      promotionId: null,
    };
  }

  const amountEuroCents = Math.round(
    listAmountEuroCents * (100 - FOUNDING_EVENTS_PROMOTION.discountPercent) / 100,
  );

  return {
    listAmountEuroCents,
    amountEuroCents,
    discountEuroCents: listAmountEuroCents - amountEuroCents,
    promotionId: FOUNDING_EVENTS_PROMOTION.id,
  };
}

export function getFoundingEventsPlanPrice(planId: string, now = new Date()): FoundingEventsPrice {
  return getFoundingEventsPrice(PLAN_LIST_PRICE_EURO_CENTS[planId] ?? 0, now);
}

export function formatEuroCents(amountEuroCents: number): string {
  return `${(amountEuroCents / 100).toFixed(2).replace(/\.00$/, "")}€`;
}
