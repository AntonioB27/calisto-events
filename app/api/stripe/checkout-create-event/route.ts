import { NextResponse } from "next/server";

import {
  buildEventTitle,
  isPaidPlanForCheckout,
  planUnitAmountEuroCents,
  truncateStripeMetadataTitle,
  type PaidPlanId,
} from "@/lib/event-stripe-checkout";
import { normalizePlanId, type PlanId } from "@/lib/plan-limits";
import { getStripe } from "@/lib/stripe-server";
import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";

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
  name?: unknown;
  emoji?: unknown;
  date?: unknown;
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

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const emoji = typeof body.emoji === "string" ? body.emoji : "";
  const dateRaw = typeof body.date === "string" ? body.date.trim() : "";
  const planId: PlanId = normalizePlanId(body.planId);

  if (!name) {
    return NextResponse.json({ error: "Event name is required." }, { status: 400 });
  }
  if (!dateRaw) {
    return NextResponse.json({ error: "Event date is required." }, { status: 400 });
  }
  if (!isPaidPlanForCheckout(planId)) {
    return NextResponse.json({ error: "This plan does not require checkout." }, { status: 400 });
  }

  const eventMs = new Date(dateRaw).getTime();
  if (Number.isNaN(eventMs)) {
    return NextResponse.json({ error: "Invalid event date." }, { status: 400 });
  }

  const title = buildEventTitle(name, emoji);
  const paidPlanId = planId as PaidPlanId;
  const accessCode = crypto.randomUUID().slice(0, 8).toUpperCase();
  const origin = getAppOrigin(request);

  const displayPlan = `${paidPlanId.charAt(0).toUpperCase()}${paidPlanId.slice(1)}`;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    allow_promotion_codes: true,
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: planUnitAmountEuroCents(paidPlanId),
          product_data: {
            name: `Calisto event — ${displayPlan}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/events/new/complete?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/events/new?step=3&resume=1`,
    metadata: {
      organizer_id: user.id,
      plan: planId,
      event_date: new Date(dateRaw).toISOString(),
      access_code: accessCode,
      event_title: truncateStripeMetadataTitle(title, 480),
    },
    client_reference_id: user.id,
  });

  if (!session.url) {
    return NextResponse.json({ error: "Could not start Checkout." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
