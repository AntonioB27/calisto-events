import { NextResponse } from "next/server";

import { GUEST_UPLOAD_MAX_VIDEO_BYTES } from "@/lib/guest-upload-limits";
import {
  countMediaForQuota,
  getEventUploadContext,
  insertMediaItem,
  resolveModerationStatus,
} from "@/lib/guest-upload";
import { canGuestUpload, getPlanLimits } from "@/lib/plan-limits";
import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const EVENT_MEDIA_BUCKET = "event-media";

// Test seam: override these in route tests to avoid Supabase env requirements.
export const __test = {
  getEventUploadContext,
  countMediaForQuota,
  insertMediaItem,
  getObjectInfo: async (path: string) => {
    const db = getSupabaseServerClient();
    return db.storage.from(EVENT_MEDIA_BUCKET).info(path);
  },
  removeObject: async (path: string) => {
    const db = getSupabaseServerClient();
    await db.storage.from(EVENT_MEDIA_BUCKET).remove([path]);
  },
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

  const path = typeof (body as { path?: unknown })?.path === "string" ? (body as { path: string }).path : "";
  if (!path.startsWith(`events/${eventId}/`)) {
    return NextResponse.json({ error: "Invalid file path." }, { status: 400 });
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

  const { data: info, error: infoError } = await __test.getObjectInfo(path);
  if (infoError || !info) {
    return NextResponse.json({ error: "Upload not found." }, { status: 400 });
  }

  const sizeBytes = info.size ?? 0;
  if (sizeBytes > GUEST_UPLOAD_MAX_VIDEO_BYTES) {
    await __test.removeObject(path);
    return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 413 });
  }

  const mimeType = info.contentType ?? "video/mp4";
  const moderationStatus = resolveModerationStatus({ eventContext, uploaderId: user.id });

  try {
    const inserted = await __test.insertMediaItem({
      eventId,
      uploaderId: user.id,
      filePath: path,
      mimeType,
      sizeBytes,
      thumbnailPath: null,
      moderationStatus,
    });
    return NextResponse.json({ id: inserted.id, file_path: inserted.storage_path }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save upload." }, { status: 500 });
  }
}
