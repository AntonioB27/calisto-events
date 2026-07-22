import type Stripe from "stripe";

import { normalizePlanId, type PlanId } from "@/lib/plan-limits";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const PAID_PLANS = new Set<PlanId>(["standard", "plus", "premium", "max"]);

export function isPaidPlanForCheckout(planId: PlanId): boolean {
  return PAID_PLANS.has(planId);
}

export type PaidPlanId = Exclude<PlanId, "free">;

export function planUnitAmountEuroCents(planId: PaidPlanId): number {
  switch (planId) {
    case "standard":
      return 1500;
    case "plus":
      return 3500;
    case "premium":
      return 6500;
    case "max":
      return 9000;
    default:
      return 1500;
  }
}

/** Stripe metadata values are capped (~500 chars); keep titles bounded. */
export function truncateStripeMetadataTitle(title: string, maxUnicodeScalars: number): string {
  const chars = [...title];
  if (chars.length <= maxUnicodeScalars) return title;
  return chars.slice(0, Math.max(0, maxUnicodeScalars - 1)).join("") + "\u2026";
}

export function buildEventTitle(name: string, emoji: string): string {
  const e = emoji?.trim();
  const n = name.trim();
  return e ? `${e} ${n}` : n;
}

export async function fulfillPaidEventFromCheckoutSession(
  stripe: Stripe,
  sessionId: string,
): Promise<
  Readonly<{ ok: true; eventId: string; alreadyExisted: boolean } | { ok: false; error: string }>
> {
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return { ok: false, error: "Invalid or expired checkout session." };
  }

  if (session.mode !== "payment") {
    return { ok: false, error: "Checkout session is not a one-time payment." };
  }

  if (session.payment_status !== "paid") {
    return { ok: false, error: "Payment is not completed yet." };
  }

  const meta = session.metadata ?? {};
  const organizer_id = typeof meta.organizer_id === "string" ? meta.organizer_id : "";
  const planRaw = typeof meta.plan === "string" ? meta.plan : "";
  const event_date = typeof meta.event_date === "string" ? meta.event_date : "";
  const access_code = typeof meta.access_code === "string" ? meta.access_code : "";
  const title = typeof meta.event_title === "string" ? meta.event_title : "";

  if (!organizer_id || !planRaw || !event_date || !access_code || !title) {
    return { ok: false, error: "Checkout metadata is incomplete." };
  }

  const planId = normalizePlanId(planRaw);
  if (!isPaidPlanForCheckout(planId)) {
    return { ok: false, error: "Invalid plan for paid checkout." };
  }

  const db = getSupabaseServerClient();

  const { data: existing } = await db
    .from("events")
    .select("id")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  if (existing && typeof (existing as { id?: unknown }).id === "string") {
    return { ok: true, eventId: (existing as { id: string }).id, alreadyExisted: true };
  }

  const { data: inserted, error } = await db
    .from("events")
    .insert({
      title,
      event_date,
      organizer_id,
      plan: planId,
      access_code,
      stripe_checkout_session_id: sessionId,
    })
    .select("id")
    .single();

  if (error) {
    const code = (error as { code?: string }).code;
    if (code === "23505") {
      // Idempotent: another request (webhook or retry) already created the event.
      const { data: row, error: lookupError } = await db
        .from("events")
        .select("id")
        .eq("stripe_checkout_session_id", sessionId)
        .maybeSingle();

      if (row && typeof (row as { id?: unknown }).id === "string") {
        return { ok: true, eventId: (row as { id: string }).id, alreadyExisted: true };
      }

      console.error("[fulfill] 23505 conflict but lookup returned nothing", {
        sessionId,
        lookupError,
        insertError: error,
      });
      return { ok: false, error: "Event creation conflict. Please try again in a moment." };
    }

    const rawMessage = typeof (error as { message?: unknown }).message === "string"
      ? (error as { message: string }).message
      : "";
    const isSchemaCache = rawMessage.includes("schema cache");
    console.error("[fulfill] event insert failed", { sessionId, code, isSchemaCache, error });
    return {
      ok: false,
      error: isSchemaCache
        ? "Service temporarily unavailable. Please try again in a moment."
        : "Could not create event. Please try again.",
      ...(isSchemaCache ? { status: 503 } : {}),
    };
  }

  if (!inserted || typeof (inserted as { id?: unknown }).id !== "string") {
    return { ok: false, error: "Could not create event." };
  }

  return { ok: true, eventId: (inserted as { id: string }).id, alreadyExisted: false };
}

/**
 * Applies a paid-plan upgrade to an EXISTING event (the create path only ever inserts).
 * Idempotent: stamps `stripe_checkout_session_id` so webhook + client poll can both run.
 * Updating `plan` fires the DB `events_set_scheduled_deletion` trigger, extending retention.
 */
export async function fulfillEventUpgradeFromCheckoutSession(
  stripe: Stripe,
  sessionId: string,
): Promise<
  Readonly<
    | { ok: true; eventId: string; plan: PaidPlanId; alreadyExisted: boolean }
    | { ok: false; error: string }
  >
> {
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return { ok: false, error: "Invalid or expired checkout session." };
  }

  if (session.mode !== "payment") {
    return { ok: false, error: "Checkout session is not a one-time payment." };
  }

  if (session.payment_status !== "paid") {
    return { ok: false, error: "Payment is not completed yet." };
  }

  const meta = session.metadata ?? {};
  const organizer_id = typeof meta.organizer_id === "string" ? meta.organizer_id : "";
  const event_id = typeof meta.event_id === "string" ? meta.event_id : "";
  const planRaw = typeof meta.plan === "string" ? meta.plan : "";

  if (meta.kind !== "upgrade" || !organizer_id || !event_id || !planRaw) {
    return { ok: false, error: "Checkout metadata is incomplete." };
  }

  const planId = normalizePlanId(planRaw);
  if (!isPaidPlanForCheckout(planId)) {
    return { ok: false, error: "Invalid plan for paid checkout." };
  }

  const db = getSupabaseServerClient();

  const { data: existing, error: readError } = await db
    .from("events")
    .select("id, organizer_id, stripe_checkout_session_id")
    .eq("id", event_id)
    .maybeSingle();

  if (readError || !existing || typeof (existing as { id?: unknown }).id !== "string") {
    return { ok: false, error: "Event not found for upgrade." };
  }

  const row = existing as {
    id: string;
    organizer_id: string;
    stripe_checkout_session_id: string | null;
  };

  if (row.organizer_id !== organizer_id) {
    return { ok: false, error: "This checkout belongs to another account." };
  }

  // Idempotent: this exact session already applied (webhook and poll can both land here).
  if (row.stripe_checkout_session_id === sessionId) {
    return { ok: true, eventId: row.id, plan: planId as PaidPlanId, alreadyExisted: true };
  }

  const { error: updateError } = await db
    .from("events")
    .update({ plan: planId, stripe_checkout_session_id: sessionId })
    .eq("id", event_id)
    .eq("organizer_id", organizer_id);

  if (updateError) {
    console.error("[fulfill-upgrade] event plan update failed", {
      sessionId,
      eventId: event_id,
      error: updateError,
    });
    return { ok: false, error: "Could not apply the upgrade. Please try again." };
  }

  return { ok: true, eventId: row.id, plan: planId as PaidPlanId, alreadyExisted: false };
}

/** Ensures the upgrade session belongs to the signed-in organizer before mutating the event. */
export async function fulfillEventUpgradeForAuthenticatedUser(args: Readonly<{
  stripe: Stripe;
  sessionId: string;
  expectedOrganizerId: string;
}>): Promise<
  Readonly<
    | { ok: true; eventId: string; plan: PaidPlanId; alreadyExisted: boolean }
    | { ok: false; error: string; status?: number }
  >
> {
  let session: Stripe.Checkout.Session;
  try {
    session = await args.stripe.checkout.sessions.retrieve(args.sessionId);
  } catch {
    return { ok: false, error: "Invalid or expired checkout session.", status: 404 };
  }

  if (session.metadata?.organizer_id !== args.expectedOrganizerId) {
    return { ok: false, error: "This checkout belongs to another account.", status: 403 };
  }

  const result = await fulfillEventUpgradeFromCheckoutSession(args.stripe, args.sessionId);
  if (!result.ok) {
    const derivedStatus = result.error.includes("yet") ? 409 : 400;
    return { ...result, status: derivedStatus };
  }
  return result;
}

/** Ensures session belongs to the signed-in organizer before inserting the event row. */
export async function fulfillPaidEventForAuthenticatedUser(args: Readonly<{
  stripe: Stripe;
  sessionId: string;
  expectedOrganizerId: string;
}>): Promise<
  Readonly<{ ok: true; eventId: string; alreadyExisted: boolean } | { ok: false; error: string; status?: number }>
> {
  let session: Stripe.Checkout.Session;
  try {
    session = await args.stripe.checkout.sessions.retrieve(args.sessionId);
  } catch {
    return { ok: false, error: "Invalid or expired checkout session.", status: 404 };
  }

  const metaOrganizer = session.metadata?.organizer_id;
  if (metaOrganizer !== args.expectedOrganizerId) {
    return { ok: false, error: "This checkout belongs to another account.", status: 403 };
  }

  const result = await fulfillPaidEventFromCheckoutSession(args.stripe, args.sessionId);
  if (!result.ok) {
    const explicitStatus = "status" in result && typeof result.status === "number" ? result.status : null;
    const derivedStatus = result.error.includes("yet") ? 409 : 400;
    return { ...result, status: explicitStatus ?? derivedStatus };
  }
  return result;
}
