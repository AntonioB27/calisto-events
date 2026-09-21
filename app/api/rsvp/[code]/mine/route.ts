import { NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase-server";
import { normalizeRsvpCode } from "@/lib/rsvp-code";

export async function GET(request: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code } = await ctx.params;
  const url = new URL(request.url);
  const clientToken = url.searchParams.get("clientToken");
  if (!clientToken) {
    return NextResponse.json({ error: "MISSING_CLIENT_TOKEN" }, { status: 400 });
  }

  const db = getSupabaseServerClient();
  const { data: event } = await db
    .from("events")
    .select("id")
    .eq("rsvp_code", normalizeRsvpCode(code))
    .maybeSingle();
  if (!event) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }

  const { data: rsvp } = await db
    .from("rsvps")
    .select("id, status, submitter_name, contact, attendees")
    .eq("event_id", (event as { id: string }).id)
    .eq("client_token", clientToken)
    .maybeSingle();

  return NextResponse.json({ rsvp: rsvp ?? null });
}
