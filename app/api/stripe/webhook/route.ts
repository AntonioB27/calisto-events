import { NextResponse } from "next/server";

import Stripe from "stripe";

import { fulfillPaidEventFromCheckoutSession } from "@/lib/event-stripe-checkout";
import { getStripe } from "@/lib/stripe-server";

export const runtime = "nodejs";

/**
 * Fulfillment mistakes that Stripe retries cannot fix — respond 2xx after logging so
 * Stripe stops hammering the endpoint; fix operationally (metadata, plan, session mode).
 */
export function isPermanentCheckoutFulfillmentError(message: string): boolean {
  return (
    message.includes("Checkout session is not a one-time payment") ||
    message.includes("Checkout metadata is incomplete") ||
    message.includes("Invalid plan for paid checkout")
  );
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }

  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (typeof session.id === "string") {
      const result = await fulfillPaidEventFromCheckoutSession(stripe, session.id);
      if (!result.ok) {
        const msg = result.error;
        console.error("[stripe-webhook] fulfill failed after checkout.session.completed", {
          sessionId: session.id,
          error: msg,
          permanentFailure: isPermanentCheckoutFulfillmentError(msg),
        });
        if (!isPermanentCheckoutFulfillmentError(msg)) {
          return NextResponse.json({ error: msg }, { status: 500 });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
