import { NextResponse } from "next/server";

import { ZIP_SIGNED_URL_SECONDS } from "@/lib/zip-export-constants";
import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string; jobId: string }> },
) {
  void request;
  const { id: eventId, jobId } = await ctx.params;

  const authClient = getSupabaseAuthServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
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

  const { data: job, error: jobErr } = await authClient
    .from("media_zip_exports")
    .select("id, event_id, status, expires_at, storage_path")
    .eq("id", jobId)
    .eq("event_id", eventId)
    .maybeSingle();

  if (jobErr || !job) {
    return NextResponse.json({ error: "Export not found." }, { status: 404 });
  }

  const status = typeof (job as { status?: unknown }).status === "string" ? (job as { status: string }).status : "";
  const storagePath =
    typeof (job as { storage_path?: unknown }).storage_path === "string"
      ? (job as { storage_path: string }).storage_path
      : "";
  const expiresAt =
    typeof (job as { expires_at?: unknown }).expires_at === "string" ? (job as { expires_at: string }).expires_at : null;

  const now = Date.now();
  if (status !== "ready" || !storagePath || !expiresAt || new Date(expiresAt).getTime() <= now) {
    return NextResponse.json({ error: "ZIP_EXPORT_NOT_READY" }, { status: 409 });
  }

  const db = getSupabaseServerClient();
  const { data: signed, error: signErr } = await db.storage
    .from("event-media")
    .createSignedUrl(storagePath, ZIP_SIGNED_URL_SECONDS);

  if (signErr || !signed?.signedUrl) {
    console.error("[zip-export] sign", signErr?.message);
    return NextResponse.json({ error: "Could not sign download URL." }, { status: 500 });
  }

  return NextResponse.json({ url: signed.signedUrl }, { status: 200 });
}
