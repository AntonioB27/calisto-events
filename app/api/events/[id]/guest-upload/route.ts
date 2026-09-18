import { NextResponse } from "next/server";

import { generateImageThumbnail } from "@/lib/image-thumbnail";
import { maxGuestUploadBytesForMime } from "@/lib/guest-upload-limits";
import {
  countMediaForQuota,
  getEventUploadContext,
  insertMediaItem,
  resolveModerationStatus,
  MIME_TO_EXT,
  type MediaType,
} from "@/lib/guest-upload";
import { canGuestUpload } from "@/lib/plan-limits";
import { getPlanLimits } from "@/lib/plan-limits";
import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

// Test seam: override these in route tests to avoid Supabase env requirements.
export const __test = {
  getEventUploadContext,
  countMediaForQuota,
  insertMediaItem,
  maxGuestUploadBytesForMime,
  generateThumbnail: generateImageThumbnail as (buf: ArrayBuffer, mime: string) => Promise<Buffer | null>,
};

export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id: eventId } = await ctx.params;

  // 1) Validate session (guest can be anonymous but must be authenticated)
  const authClient = getSupabaseAuthServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // 2) Parse form data
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const maxBytes = __test.maxGuestUploadBytesForMime(file.type);
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 413 });
  }

  const isPhoto = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isPhoto && !isVideo) {
    return NextResponse.json({ error: "Only image and video files are accepted." }, { status: 415 });
  }
  const mediaType: MediaType = isPhoto ? "photo" : "video";

  // 3) Fetch event context (plan, dates)
  const eventContext = await __test.getEventUploadContext(eventId);
  if (!eventContext) {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }

  const now = new Date().toISOString();
  if (!canGuestUpload({ planId: eventContext.planId, eventDate: eventContext.eventDate, now })) {
    return NextResponse.json({ error: "UPLOADS_CLOSED" }, { status: 403 });
  }

  // 4) Quota check from DB counts (ignore client-supplied counts)
  const limits = getPlanLimits(eventContext.planId);
  const usedCount = await __test.countMediaForQuota(eventId, mediaType);
  const limit = mediaType === "photo" ? limits.photos : limits.videos;
  if (usedCount >= limit) {
    return NextResponse.json({ error: "QUOTA_REACHED" }, { status: 403 });
  }

  // 5) Upload original to Storage
  const ext = MIME_TO_EXT[file.type] ?? "bin";
  const fileUuid = crypto.randomUUID();
  const filePath = `events/${eventId}/${fileUuid}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const db = getSupabaseServerClient();
  const { error: storageError } = await db.storage.from("event-media").upload(filePath, arrayBuffer, {
    contentType: file.type,
    upsert: false,
  });
  if (storageError) {
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }

  // 6) Generate thumbnail (best-effort — failure does not block the upload)
  let thumbnailPath: string | null = null;
  const thumbBuffer = await __test.generateThumbnail(arrayBuffer, file.type);
  if (thumbBuffer) {
    const thumbPath = `events/${eventId}/thumbnails/${fileUuid}.jpg`;
    const { error: thumbErr } = await db.storage.from("event-media").upload(thumbPath, thumbBuffer, {
      contentType: "image/jpeg",
      upsert: false,
    });
    if (!thumbErr) {
      thumbnailPath = thumbPath;
    }
  }

  // 7) Insert media row
  const moderationStatus = resolveModerationStatus({ eventContext, uploaderId: user.id });

  try {
    const inserted = await __test.insertMediaItem({
      eventId,
      uploaderId: user.id,
      filePath,
      mimeType: file.type,
      sizeBytes: file.size,
      thumbnailPath,
      moderationStatus,
    });
    return NextResponse.json({ id: inserted.id, file_path: inserted.storage_path }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save upload." }, { status: 500 });
  }
}

