import { NextResponse } from "next/server";

import { GUEST_UPLOAD_MAX_VIDEO_BYTES } from "@/lib/guest-upload-limits";
import { countMediaForQuota, getEventUploadContext, MIME_TO_EXT } from "@/lib/guest-upload";
import { canGuestUpload, getPlanLimits } from "@/lib/plan-limits";
import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const EVENT_MEDIA_BUCKET = "event-media";

// Test seam: override these in route tests to avoid Supabase env requirements.
export const __test = {
  getEventUploadContext,
  countMediaForQuota,
};

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await ctx.params;

  const authClient = getSupabaseAuthServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const mimeType = typeof (body as { mimeType?: unknown })?.mimeType === "string"
    ? (body as { mimeType: string }).mimeType
    : "";
  const sizeBytes = typeof (body as { sizeBytes?: unknown })?.sizeBytes === "number"
    ? (body as { sizeBytes: number }).sizeBytes
    : NaN;

  if (!mimeType.startsWith("video/") || !(mimeType in MIME_TO_EXT)) {
    return NextResponse.json({ error: "Only video files are accepted." }, { status: 415 });
  }
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return NextResponse.json({ error: "Invalid file size." }, { status: 400 });
  }
  if (sizeBytes > GUEST_UPLOAD_MAX_VIDEO_BYTES) {
    return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 413 });
  }

  const eventContext = await __test.getEventUploadContext(eventId);
  if (!eventContext) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const now = new Date().toISOString();
  if (!canGuestUpload({ planId: eventContext.planId, eventDate: eventContext.eventDate, now })) {
    return NextResponse.json({ error: "UPLOADS_CLOSED" }, { status: 403 });
  }

  const limits = getPlanLimits(eventContext.planId);
  const usedCount = await __test.countMediaForQuota(eventId, "video");
  if (usedCount >= limits.videos) {
    return NextResponse.json({ error: "QUOTA_REACHED" }, { status: 403 });
  }

  const ext = MIME_TO_EXT[mimeType];
  const filePath = `events/${eventId}/${crypto.randomUUID()}.${ext}`;

  const db = getSupabaseServerClient();
  const { data, error } = await db.storage.from(EVENT_MEDIA_BUCKET).createSignedUploadUrl(filePath);
  if (error || !data) {
    return NextResponse.json({ error: "Could not start upload." }, { status: 500 });
  }

  return NextResponse.json({ path: data.path, token: data.token }, { status: 200 });
}
