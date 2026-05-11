import { NextResponse } from "next/server";

import { fulfillPaidEventForAuthenticatedUser } from "@/lib/event-stripe-checkout";
import { getStripe } from "@/lib/stripe-server";
import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";

export const runtime = "nodejs";

type Body = Readonly<{ sessionId?: unknown }>;

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

  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  }

  const result = await fulfillPaidEventForAuthenticatedUser({
    stripe,
    sessionId,
    expectedOrganizerId: user.id,
  });

  if (!result.ok) {
    const status = "status" in result && typeof result.status === "number" ? result.status : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({
    eventId: result.eventId,
    alreadyExisted: result.alreadyExisted,
  });
}
