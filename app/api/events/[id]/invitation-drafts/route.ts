import { NextResponse } from "next/server";
import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { INVITATION_DOCUMENT_ID, validateInvitationDocument } from "@/lib/event-print/invitation-document";

export const runtime = "nodejs";

/** Atomically save one canonical invitation with optimistic concurrency. */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await ctx.params;
  const client = getSupabaseAuthServerClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { data: event, error } = await client.from("events")
    .select("id, organizer_id, event_kind").eq("id", eventId).maybeSingle();
  if (error || !event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  if (event.organizer_id !== user.id) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  if (event.event_kind !== "wedding") return NextResponse.json({ error: "Invitations require a wedding event." }, { status: 400 });

  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const fields = body?.fieldValues;
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
    return NextResponse.json({ error: "Invalid invitation fields." }, { status: 400 });
  }
  if (!Object.prototype.hasOwnProperty.call(body, "expectedFields") ||
      (body.expectedFields !== null && (typeof body.expectedFields !== "object" || Array.isArray(body.expectedFields)))) {
    return NextResponse.json({ error: "Missing draft revision." }, { status: 400 });
  }
  const result = validateInvitationDocument(fields, eventId);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  const row = { event_id: eventId, template_id: INVITATION_DOCUMENT_ID, field_values: result.values };
  // JSONB equality is checked by Postgres in the same statement as the update.
  // Insert-on-conflict DO NOTHING also protects simultaneous first saves.
  const query = body.expectedFields === null
    ? client.from("event_print_template_instances").upsert(row, { onConflict: "event_id,template_id", ignoreDuplicates: true }).select("field_values")
    : client.from("event_print_template_instances").update({ field_values: result.values })
        .eq("event_id", eventId).eq("template_id", INVITATION_DOCUMENT_ID)
        .eq("field_values", JSON.stringify(body.expectedFields)).select("field_values");
  const { data: saved, error: saveError } = await query;
  if (saveError) {
    console.error("[invitation-drafts] save failed", saveError);
    return NextResponse.json({ error: "Could not save invitation." }, { status: 500 });
  }
  if (!saved?.length) return NextResponse.json({ error: "Draft changed elsewhere." }, { status: 409 });
  return NextResponse.json({ ok: true, fieldValues: result.values });
}
