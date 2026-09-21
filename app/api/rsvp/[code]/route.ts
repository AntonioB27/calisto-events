import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase-server";
import { normalizeRsvpCode } from "@/lib/rsvp-code";
import { normalizePlanId, planRank } from "@/lib/plan-limits";

export async function GET(_request: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const db = getSupabaseServerClient();

  const { data: event } = await db
    .from("events")
    .select("id, title, plan, rsvp_open")
    .eq("rsvp_code", normalizeRsvpCode(code))
    .maybeSingle();

  if (!event) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const planId = normalizePlanId((event as { plan?: unknown }).plan);
  const planEligible = planRank(planId) >= planRank("standard");

  return NextResponse.json({
    eventId: (event as { id: string }).id,
    eventTitle: (event as { title: string }).title,
    open: planEligible && Boolean((event as { rsvp_open?: unknown }).rsvp_open),
  });
}
