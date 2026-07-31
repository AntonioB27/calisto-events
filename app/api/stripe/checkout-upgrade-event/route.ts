import { NextResponse } from "next/server";

import {
  isPaidPlanForCheckout,
  planCreditEuroCents,
  planUnitAmountEuroCents,
  type PaidPlanId,
} from "@/lib/event-stripe-checkout";
import { normalizePlanId, planRank, type PlanId } from "@/lib/plan-limits";
import { getStripe } from "@/lib/stripe-server";
import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getUiLocale } from "@/lib/ui-locale";

export const runtime = "nodejs";

/**
 * Stripe success/cancel URLs need an absolute origin.
 * On Vercel, `VERCEL_URL` is set automatically (no protocol). Prefer
 * `NEXT_PUBLIC_APP_URL` in production when using a custom domain so redirects
 * match the URL users see (Dashboard → Environment Variables).
 */
function getAppOrigin(request: Request): string {
  const canonical = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (canonical) return canonical.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//i, "").replace(/\/$/, "");
    return `https://${host}`;
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "http";

  if (host) return `${proto}://${host}`;
  return "http://localhost:3000";
}

type Body = Readonly<{
  eventId?: unknown;
  planId?: unknown;
}>;

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }

  const authClient = getSupabaseAuthServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const eventId = typeof body.eventId === "string" ? body.eventId.trim() : "";
  const planId: PlanId = normalizePlanId(body.planId);

  if (!eventId) {
    return NextResponse.json({ error: "Event is required." }, { status: 400 });
  }
  if (!isPaidPlanForCheckout(planId)) {
    return NextResponse.json({ error: "Choose a paid plan to upgrade to." }, { status: 400 });
  }

  // RLS scopes this read to events the caller can see; re-check ownership + free tier.
  const { data: event } = await authClient
    .from("events")
    .select("id, plan, organizer_id, title")
    .eq("id", eventId)
    .maybeSingle();

  if (!event || (event as { organizer_id?: unknown }).organizer_id !== user.id) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const currentPlan = normalizePlanId((event as { plan?: unknown }).plan);
  if (planRank(planId) <= planRank(currentPlan)) {
    return NextResponse.json({ error: "Choose a higher plan to upgrade to." }, { status: 409 });
  }

  const paidPlanId = planId as PaidPlanId;
  const displayPlan = `${paidPlanId.charAt(0).toUpperCase()}${paidPlanId.slice(1)}`;
  const creditEuroCents = planCreditEuroCents(currentPlan);
  const chargeEuroCents = planUnitAmountEuroCents(paidPlanId) - creditEuroCents;
  const origin = getAppOrigin(request);
  const locale = await getUiLocale();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    allow_promotion_codes: true,
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: chargeEuroCents,
          product_data: {
            name: `Calisto event upgrade: ${displayPlan}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/events/${eventId}?tab=overview&upgraded=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/events/${eventId}?tab=overview`,
    metadata: {
      kind: "upgrade",
      event_id: eventId,
      organizer_id: user.id,
      plan: planId,
      previous_plan: currentPlan,
      credit_applied_cents: String(creditEuroCents),
      locale,
      ...(user.email ? { organizer_email: user.email } : {}),
    },
    client_reference_id: user.id,
  });

  if (!session.url) {
    return NextResponse.json({ error: "Could not start Checkout." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
