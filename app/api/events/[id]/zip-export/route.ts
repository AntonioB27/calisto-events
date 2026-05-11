import { NextResponse } from "next/server";

import { ZIP_MAX_MEDIA_ITEMS } from "@/lib/zip-export-constants";
import { wouldExceedMediaLimit } from "@/lib/zip-export-eligibility";
import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";

async function countMediaForZip(
  eventId: string,
  includeVideos: boolean,
  db: ReturnType<typeof getSupabaseAuthServerClient>,
): Promise<number> {
  if (includeVideos) {
    const { count, error } = await db
      .from("media_items")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId);
    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  const { count: nullCount, error: e1 } = await db
    .from("media_items")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .is("mime_type", null);
  if (e1) throw new Error(e1.message);

  const { count: imageCount, error: e2 } = await db
    .from("media_items")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .ilike("mime_type", "image/%");
  if (e2) throw new Error(e2.message);

  return (nullCount ?? 0) + (imageCount ?? 0);
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

  let includeVideos = false;
  try {
    const body = (await request.json()) as { includeVideos?: unknown };
    includeVideos = Boolean(body?.includeVideos);
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
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

  let count: number;
  try {
    count = await countMediaForZip(eventId, includeVideos, authClient);
  } catch (e) {
    console.error("[zip-export] count failed", e);
    return NextResponse.json({ error: "Could not count media." }, { status: 500 });
  }

  if (wouldExceedMediaLimit(count, ZIP_MAX_MEDIA_ITEMS)) {
    return NextResponse.json({ error: "ZIP_TOO_MANY_ITEMS" }, { status: 400 });
  }

  const { data: pending, error: pendErr } = await authClient
    .from("media_zip_exports")
    .select("id")
    .eq("event_id", eventId)
    .in("status", ["queued", "running"])
    .maybeSingle();

  if (pendErr) {
    console.error("[zip-export] pending check", pendErr.message);
    return NextResponse.json({ error: "Could not verify export queue." }, { status: 500 });
  }

  if (pending?.id) {
    return NextResponse.json({ error: "ZIP_JOB_ALREADY_PENDING" }, { status: 409 });
  }

  const { data: inserted, error: insErr } = await authClient
    .from("media_zip_exports")
    .insert({
      event_id: eventId,
      requested_by: user.id,
      include_videos: includeVideos,
      status: "queued",
    })
    .select("id")
    .single();

  if (insErr || !inserted?.id) {
    console.error("[zip-export] insert", insErr?.message);
    return NextResponse.json({ error: "Could not queue export." }, { status: 500 });
  }

  return NextResponse.json({ id: inserted.id }, { status: 201 });
}
