import { NextResponse } from "next/server";
import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type ModerationBody =
  | { action: "approve"; mediaItemId: string }
  | { action: "discard"; mediaItemId: string }
  | { action: "approve_all" }
  | { action: "toggle_mode"; enabled: boolean }
  | { action: "mark_reviewed" };

async function checkOrganizer(eventId: string, userId: string): Promise<boolean> {
  const db = getSupabaseServerClient();
  const { data } = await db
    .from("events")
    .select("organizer_id")
    .eq("id", eventId)
    .maybeSingle();
  return Boolean(data && (data as { organizer_id?: unknown }).organizer_id === userId);
}

async function approveItem(eventId: string, mediaItemId: string): Promise<void> {
  const db = getSupabaseServerClient();
  const { error } = await db
    .from("media_items")
    .update({ moderation_status: "approved" })
    .eq("id", mediaItemId)
    .eq("event_id", eventId)
    .eq("moderation_status", "pending");
  if (error) throw error;
}

async function discardItem(
  eventId: string,
  mediaItemId: string,
): Promise<{ storagePaths: string[] }> {
  const db = getSupabaseServerClient();
  const { data, error } = await db
    .from("media_items")
    .delete()
    .eq("id", mediaItemId)
    .eq("event_id", eventId)
    .select("storage_path, thumbnail_path");
  if (error) throw error;
  const rows = (data ?? []) as Array<{ storage_path: string; thumbnail_path: string | null }>;
  const storagePaths = rows
    .flatMap((r) => [r.storage_path, r.thumbnail_path])
    .filter((p): p is string => Boolean(p));
  return { storagePaths };
}

async function deleteStorage(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const db = getSupabaseServerClient();
  const { error } = await db.storage.from("event-media").remove(paths);
  if (error) throw error;
}

async function approveAll(eventId: string): Promise<void> {
  const db = getSupabaseServerClient();
  const { error } = await db
    .from("media_items")
    .update({ moderation_status: "approved" })
    .eq("event_id", eventId)
    .eq("moderation_status", "pending");
  if (error) throw error;
}

async function toggleMode(eventId: string, enabled: boolean): Promise<void> {
  const db = getSupabaseServerClient();
  if (!enabled) {
    const { error: bulkErr } = await db
      .from("media_items")
      .update({ moderation_status: "visible" })
      .eq("event_id", eventId)
      .eq("moderation_status", "pending");
    if (bulkErr) throw bulkErr;
  }
  const update: Record<string, unknown> = { moderation_enabled: enabled };
  // When turning moderation off, stamp reviewed_at so existing photos don't
  // appear as new uploads under the "since last visit" logic.
  if (!enabled) {
    update.organizer_gallery_reviewed_at = new Date().toISOString();
  }
  const { error } = await db
    .from("events")
    .update(update)
    .eq("id", eventId);
  if (error) throw error;
}

async function markReviewed(eventId: string): Promise<void> {
  const db = getSupabaseServerClient();
  const { error } = await db
    .from("events")
    .update({ organizer_gallery_reviewed_at: new Date().toISOString() })
    .eq("id", eventId);
  if (error) throw error;
}

export const __test = {
  checkOrganizer,
  approveItem,
  discardItem,
  deleteStorage,
  approveAll,
  toggleMode,
  markReviewed,
};

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id: eventId } = await ctx.params;

  const authClient = getSupabaseAuthServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const isOrganizer = await __test.checkOrganizer(eventId, user.id);
  if (!isOrganizer) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let body: ModerationBody;
  try {
    body = (await request.json()) as ModerationBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  try {
    if (body.action === "approve") {
      await __test.approveItem(eventId, body.mediaItemId);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "discard") {
      const { storagePaths } = await __test.discardItem(eventId, body.mediaItemId);
      await __test.deleteStorage(storagePaths);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "approve_all") {
      await __test.approveAll(eventId);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "toggle_mode") {
      await __test.toggleMode(eventId, body.enabled);
      return NextResponse.json({ ok: true });
    }
    if (body.action === "mark_reviewed") {
      await __test.markReviewed(eventId);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Action failed." }, { status: 500 });
  }
}
