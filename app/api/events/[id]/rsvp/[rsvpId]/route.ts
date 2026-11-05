import { NextResponse } from "next/server";

import { getEventAdminAccess } from "@/lib/event-admin-access";
import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type Db = ReturnType<typeof getSupabaseServerClient>;

async function canManage(db: Db, eventId: string, userId: string): Promise<boolean> {
  const { data } = await db.from("events").select("organizer_id").eq("id", eventId).maybeSingle();
  if (!data) return false;
  const organizerId = String((data as { organizer_id?: unknown }).organizer_id ?? "");
  const { canAccess } = await getEventAdminAccess(db, { eventId, userId, organizerId });
  return canAccess;
}

/** Deleting a row nulls `possible_duplicate_of` on rows that pointed at it (FK SET NULL); clear their now-dangling flag too. */
async function clearOrphanedFlags(db: Db, eventId: string) {
  await db
    .from("rsvps")
    .update({ duplicate_status: null })
    .eq("event_id", eventId)
    .eq("duplicate_status", "flagged")
    .is("possible_duplicate_of", null);
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

  const db = getSupabaseServerClient();
  if (!(await canManage(db, eventId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

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
    const { data: flagged } = await db
      .from("rsvps")
      .select("id, possible_duplicate_of, duplicate_status, updated_at")
      .eq("id", rsvpId)
      .eq("event_id", eventId)
      .maybeSingle();
    const row = flagged as { id: string; possible_duplicate_of: string | null; duplicate_status: string | null; updated_at: string } | null;
    if (!row || row.duplicate_status !== "flagged" || !row.possible_duplicate_of) {
      return NextResponse.json({ error: "NOT_FLAGGED" }, { status: 409 });
    }

    const { data: original } = await db
      .from("rsvps")
      .select("id, updated_at")
      .eq("id", row.possible_duplicate_of)
      .eq("event_id", eventId)
      .maybeSingle();
    const other = original as { id: string; updated_at: string } | null;

    // Keep whichever answer was changed most recently (usually the re-submission) so the
    // guest's latest attendee list survives; drop the stale one.
    const keepFlagged = !other || row.updated_at >= other.updated_at;
    const keepId = keepFlagged ? row.id : other.id;
    const dropId = keepFlagged ? other?.id : row.id;

    if (dropId) {
      const { error } = await db.from("rsvps").delete().eq("id", dropId).eq("event_id", eventId);
      if (error) return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
    }
    const { error } = await db
      .from("rsvps")
      .update({ duplicate_status: "merged", possible_duplicate_of: null })
      .eq("id", keepId)
      .eq("event_id", eventId);
    if (error) return NextResponse.json({ error: "UPDATE_FAILED" }, { status: 500 });
    await clearOrphanedFlags(db, eventId);
    return NextResponse.json({ ok: true, keptId: keepId });
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

  const db = getSupabaseServerClient();
  if (!(await canManage(db, eventId, user.id))) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { error } = await db.from("rsvps").delete().eq("id", rsvpId).eq("event_id", eventId);
  if (error) return NextResponse.json({ error: "DELETE_FAILED" }, { status: 500 });
  await clearOrphanedFlags(db, eventId);
  return NextResponse.json({ ok: true });
}
