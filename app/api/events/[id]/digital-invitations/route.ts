import { NextResponse } from "next/server";

import { INVITATION_DOCUMENT_ID } from "@/lib/event-print/invitation-document";
import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";

function stringFields(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string");
  return entries.length === Object.keys(value).length ? Object.fromEntries(entries) : null;
}

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await ctx.params;
  const client = getSupabaseAuthServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: event, error: eventError } = await client.from("events")
    .select("id, organizer_id, event_kind").eq("id", eventId).maybeSingle();
  if (eventError || !event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (event.organizer_id !== user.id) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  if (event.event_kind !== "wedding") return NextResponse.json({ error: "Digital invitations require a wedding event." }, { status: 400 });

  let body: { action?: unknown; label?: unknown; maxAttendees?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const action = body.action;
  if (action !== "publish" && action !== "create-household") return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  if (action === "publish") {
    const { data: draft, error: draftError } = await client.from("event_print_template_instances")
      .select("field_values").eq("event_id", eventId).eq("template_id", INVITATION_DOCUMENT_ID).maybeSingle();
    const fields = stringFields(draft?.field_values);
    if (draftError || !fields?.partner_a || !fields.partner_b) {
      return NextResponse.json({ error: "Save a complete invitation before publishing it." }, { status: 409 });
    }
    const { data, error } = await client.from("event_digital_invitations")
      .upsert({ event_id: eventId, published_fields: fields, published_at: new Date().toISOString() }, { onConflict: "event_id" })
      .select("id, published_at, response_deadline").single();
    if (error || !data) return NextResponse.json({ error: "Could not publish invitation." }, { status: 500 });
    return NextResponse.json({ invitation: data });
  }

  const label = typeof body.label === "string" ? body.label.trim() : "";
  const maxAttendees = typeof body.maxAttendees === "number" ? body.maxAttendees : Number(body.maxAttendees);
  if (!label || label.length > 120 || !Number.isInteger(maxAttendees) || maxAttendees < 1 || maxAttendees > 20) {
    return NextResponse.json({ error: "Enter a household name and a party size from 1 to 20." }, { status: 400 });
  }
  const { data: invitation, error: invitationError } = await client.from("event_digital_invitations")
    .select("id").eq("event_id", eventId).maybeSingle();
  if (invitationError || !invitation) return NextResponse.json({ error: "Publish the invitation before creating recipient links." }, { status: 409 });

  const { data: household, error: householdError } = await client.from("digital_invitation_households")
    .insert({ digital_invitation_id: invitation.id, label, max_attendees: maxAttendees })
    .select("id, label, public_token, max_attendees, response_status, responded_at, created_at").single();
  if (householdError || !household) return NextResponse.json({ error: "Could not create recipient link." }, { status: 500 });
  return NextResponse.json({ household }, { status: 201 });
}
