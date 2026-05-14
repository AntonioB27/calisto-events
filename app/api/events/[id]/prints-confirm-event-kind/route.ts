import { NextResponse } from "next/server";

import { EVENT_KINDS, type EventKind } from "@/lib/event-kind";
import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";

export const runtime = "nodejs";

function isEventKind(value: unknown): value is EventKind {
  return typeof value === "string" && (EVENT_KINDS as readonly string[]).includes(value);
}

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await ctx.params;
  const authClient = getSupabaseAuthServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: { eventKind?: unknown };
  try {
    body = (await request.json()) as { eventKind?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!isEventKind(body.eventKind)) {
    return NextResponse.json({ error: "Invalid event kind." }, { status: 400 });
  }

  const { data: eventRow, error: evErr } = await authClient
    .from("events")
    .select("id, organizer_id, prints_event_kind_set_at")
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

  const already =
    (eventRow as { prints_event_kind_set_at?: string | null }).prints_event_kind_set_at != null;
  if (already) {
    return NextResponse.json({ error: "Event type is already set." }, { status: 409 });
  }

  const now = new Date().toISOString();
  const { error: upErr } = await authClient
    .from("events")
    .update({
      event_kind: body.eventKind,
      prints_event_kind_set_at: now,
    })
    .eq("id", eventId);

  if (upErr) {
    console.error("[prints-confirm-event-kind] update failed", upErr);
    return NextResponse.json({ error: "Could not save event type." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
