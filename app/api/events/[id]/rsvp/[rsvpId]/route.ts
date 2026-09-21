import { NextResponse } from "next/server";

import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

async function checkOrganizer(eventId: string, userId: string): Promise<boolean> {
  const db = getSupabaseServerClient();
  const { data } = await db.from("events").select("organizer_id").eq("id", eventId).maybeSingle();
  return Boolean(data && (data as { organizer_id?: unknown }).organizer_id === userId);
}

type PatchBody = { action: "dismiss" | "merge" };

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string; rsvpId: string }> },
) {
  const { id: eventId, rsvpId } = await ctx.params;

  const authClient = getSupabaseAuthServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!(await checkOrganizer(eventId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const db = getSupabaseServerClient();

  if (body.action === "dismiss") {
    const { error } = await db
      .from("rsvps")
      .update({ duplicate_status: "dismissed" })
      .eq("id", rsvpId)
      .eq("event_id", eventId);
    if (error) return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "merge") {
    // The flagged row is presumed to be a re-submission of the same party as
    // `possible_duplicate_of` — drop it and keep the earlier, canonical entry.
    const { error } = await db.from("rsvps").delete().eq("id", rsvpId).eq("event_id", eventId);
    if (error) return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string; rsvpId: string }> }) {
  const { id: eventId, rsvpId } = await ctx.params;

  const authClient = getSupabaseAuthServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!(await checkOrganizer(eventId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const db = getSupabaseServerClient();
  const { error } = await db.from("rsvps").delete().eq("id", rsvpId).eq("event_id", eventId);
  if (error) return NextResponse.json({ error: "DELETE_FAILED" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
