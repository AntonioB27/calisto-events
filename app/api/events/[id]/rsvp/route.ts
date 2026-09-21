import { NextResponse } from "next/server";

import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { generateRsvpCode } from "@/lib/rsvp-code";
import { normalizePlanId, planRank } from "@/lib/plan-limits";

async function checkOrganizer(eventId: string, userId: string): Promise<{ isOrganizer: boolean; planEligible: boolean }> {
  const db = getSupabaseServerClient();
  const { data } = await db.from("events").select("organizer_id, plan").eq("id", eventId).maybeSingle();
  if (!data) return { isOrganizer: false, planEligible: false };
  const row = data as { organizer_id?: unknown; plan?: unknown };
  const isOrganizer = row.organizer_id === userId;
  const planEligible = planRank(normalizePlanId(row.plan)) >= planRank("standard");
  return { isOrganizer, planEligible };
}

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await ctx.params;

  const authClient = getSupabaseAuthServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { isOrganizer, planEligible } = await checkOrganizer(eventId, user.id);
  if (!isOrganizer) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  if (!planEligible) {
    return NextResponse.json({ error: "PLAN_NOT_ELIGIBLE" }, { status: 403 });
  }

  const db = getSupabaseServerClient();
  const { data: event } = await db.from("events").select("rsvp_code, rsvp_open").eq("id", eventId).maybeSingle();

  let rsvpCode = (event as { rsvp_code?: string | null } | null)?.rsvp_code ?? null;
  if (!rsvpCode) {
    for (let attempt = 0; attempt < 5 && !rsvpCode; attempt++) {
      const candidate = generateRsvpCode();
      const { error } = await db.from("events").update({ rsvp_code: candidate }).eq("id", eventId);
      if (!error) rsvpCode = candidate;
    }
  }

  const { data: rsvps } = await db
    .from("rsvps")
    .select("id, status, submitter_name, contact, attendees, possible_duplicate_of, duplicate_status, created_at, updated_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    rsvpCode,
    rsvpOpen: (event as { rsvp_open?: boolean } | null)?.rsvp_open ?? true,
    rsvps: rsvps ?? [],
  });
}

type PatchBody =
  | { action: "toggle_open"; open: boolean }
  | { action: "regenerate_code" };

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await ctx.params;

  const authClient = getSupabaseAuthServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { isOrganizer, planEligible } = await checkOrganizer(eventId, user.id);
  if (!isOrganizer) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  if (!planEligible) {
    return NextResponse.json({ error: "PLAN_NOT_ELIGIBLE" }, { status: 403 });
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const db = getSupabaseServerClient();

  if (body.action === "toggle_open") {
    const { error } = await db.from("events").update({ rsvp_open: body.open }).eq("id", eventId);
    if (error) return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "regenerate_code") {
    // Retry on the rare unique-index collision rather than trusting a single random draw.
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateRsvpCode();
      const { error } = await db.from("events").update({ rsvp_code: code }).eq("id", eventId);
      if (!error) return NextResponse.json({ ok: true, rsvpCode: code });
    }
    return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
