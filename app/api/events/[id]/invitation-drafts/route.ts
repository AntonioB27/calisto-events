import { NextResponse } from "next/server";
import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { listPrintTemplatesForEventKind } from "@/lib/event-print/template-catalog";
import { validatePrintTemplateFieldValues } from "@/lib/event-print/validate-print-template-fields";

export const runtime = "nodejs";

/** Save all invitation designs in one database statement, so designs cannot partially save. */
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
  const rows = [];
  for (const template of listPrintTemplatesForEventKind("wedding").filter((t) => t.category === "invitation")) {
    const result = validatePrintTemplateFieldValues(template.id, fields);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
    rows.push({ event_id: eventId, template_id: template.id, field_values: result.values });
  }
  const { error: saveError } = await client.from("event_print_template_instances")
    .upsert(rows, { onConflict: "event_id,template_id" });
  if (saveError) {
    console.error("[invitation-drafts] save failed", saveError);
    return NextResponse.json({ error: "Could not save invitation." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
