import { NextResponse } from "next/server";

import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: Request, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  if (!isUuid(token)) return NextResponse.json({ error: "Invitation not found." }, { status: 404 });
  let body: { status?: unknown; attendeeNames?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  if ((body.status !== "attending" && body.status !== "declined") || !Array.isArray(body.attendeeNames) || body.attendeeNames.length > 20 ||
    body.attendeeNames.some(name => typeof name !== "string" || name.length > 120)) {
    return NextResponse.json({ error: "Invalid RSVP." }, { status: 400 });
  }

  const client = getSupabaseAuthServerClient();
  const { data, error } = await client.rpc("submit_digital_invitation_rsvp", {
    p_token: token,
    p_status: body.status,
    p_attendee_names: body.attendeeNames,
  });
  if (error) {
    const message = error.message ?? "";
    const status = message.includes("RSVP_CLOSED") ? 403 : message.includes("INVITATION_NOT_FOUND") ? 404 : 400;
    return NextResponse.json({ error: status === 403 ? "RSVPs are closed." : status === 404 ? "Invitation not found." : "Please check the attendee names and try again." }, { status });
  }
  return NextResponse.json({ response: Array.isArray(data) ? data[0] : data });
}
