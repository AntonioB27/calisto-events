import { NextResponse } from "next/server";

import { getPrintTemplateDef } from "@/lib/event-print/template-catalog";
import { validatePrintTemplateFieldValues } from "@/lib/event-print/validate-print-template-fields";
import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";

export const runtime = "nodejs";

type Body = Readonly<{
  templateId?: unknown;
  fieldValues?: unknown;
}>;

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await ctx.params;
  const authClient = getSupabaseAuthServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const templateId = typeof body.templateId === "string" ? body.templateId.trim() : "";
  if (!templateId || !getPrintTemplateDef(templateId)) {
    return NextResponse.json({ error: "Invalid template." }, { status: 400 });
  }

  const fieldValuesRaw =
    body.fieldValues && typeof body.fieldValues === "object" && !Array.isArray(body.fieldValues)
      ? (body.fieldValues as Record<string, unknown>)
      : {};

  const validated = validatePrintTemplateFieldValues(templateId, fieldValuesRaw);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const { data: eventRow, error: evErr } = await authClient
    .from("events")
    .select("id, organizer_id")
    .eq("id", eventId)
    .maybeSingle();

  if (evErr || !eventRow) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const organizerId =
    typeof (eventRow as { organizer_id?: unknown }).organizer_id === "string"
      ? (eventRow as { organizer_id: string }).organizer_id
      : "";

  if (!organizerId || organizerId !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { data: existing, error: exErr } = await authClient
    .from("event_print_template_instances")
    .select("id")
    .eq("event_id", eventId)
    .eq("template_id", templateId)
    .maybeSingle();

  if (exErr) {
    console.error("[print-template-instance] select failed", exErr);
    return NextResponse.json({ error: "Could not load print draft." }, { status: 500 });
  }

  if (existing && typeof (existing as { id?: unknown }).id === "string") {
    const { error: upErr } = await authClient
      .from("event_print_template_instances")
      .update({ field_values: validated.values })
      .eq("id", (existing as { id: string }).id);

    if (upErr) {
      console.error("[print-template-instance] update failed", upErr);
      return NextResponse.json({ error: "Could not save print draft." }, { status: 500 });
    }
  } else {
    const { error: insErr } = await authClient.from("event_print_template_instances").insert({
      event_id: eventId,
      template_id: templateId,
      field_values: validated.values,
    });

    if (insErr) {
      console.error("[print-template-instance] insert failed", insErr);
      return NextResponse.json({ error: "Could not save print draft." }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
