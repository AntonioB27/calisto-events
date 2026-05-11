import { NextResponse } from "next/server";

import { maxGuestUploadBytesForMime } from "@/lib/guest-upload-limits";
import { canGuestUpload } from "@/lib/plan-limits";
import { getPlanLimits, type PlanId } from "@/lib/plan-limits";
import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type MediaType = "photo" | "video";

type EventUploadContext = {
  planId: PlanId;
  eventDate: string;
};

async function getEventUploadContext(eventId: string): Promise<EventUploadContext | null> {
  const db = getSupabaseServerClient();
  const { data, error } = await db
    .from("events")
    .select("id, plan, event_date")
    .eq("id", eventId)
    .maybeSingle();

  if (error || !data || typeof data.plan !== "string" || typeof data.event_date !== "string" || !data.event_date) {
    return null;
  }

  const planId = data.plan;
  if (
    planId !== "free" &&
    planId !== "standard" &&
    planId !== "plus" &&
    planId !== "premium" &&
    planId !== "max"
  ) {
    return null;
  }

  return { planId, eventDate: data.event_date };
}

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
  "video/x-msvideo": "avi",
  "video/x-matroska": "mkv",
};

/**
 * Counts align with `media_items_enforce_plan_limits` in Postgres (photos = null or image/*, videos = video/*).
 */
async function countMediaForQuota(eventId: string, mediaType: MediaType): Promise<number> {
  const db = getSupabaseServerClient();
  if (mediaType === "photo") {
    const { count: nullCount } = await db
      .from("media_items")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .is("mime_type", null);
    const { count: imageCount } = await db
      .from("media_items")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .ilike("mime_type", "image/%");
    return (nullCount ?? 0) + (imageCount ?? 0);
  }

  const { count } = await db
    .from("media_items")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .ilike("mime_type", "video/%");

  return count ?? 0;
}

async function insertMediaItem(params: {
  eventId: string;
  uploaderId: string;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
}) {
  const db = getSupabaseServerClient();
  const { data, error } = await db
    .from("media_items")
    .insert({
      event_id: params.eventId,
      uploaded_by: params.uploaderId,
      storage_path: params.filePath,
      mime_type: params.mimeType,
      size_bytes: params.sizeBytes,
    })
    .select("id, storage_path")
    .single();

  if (error) {
    throw error;
  }
  return data as { id: string; storage_path: string };
}

// Test seam: override these in route tests to avoid Supabase env requirements.
export const __test = {
  getEventUploadContext,
  countMediaForQuota,
  insertMediaItem,
  maxGuestUploadBytesForMime,
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

  // 5) Upload to Storage
  const ext = MIME_TO_EXT[file.type] ?? "bin";
  const filePath = `events/${eventId}/${crypto.randomUUID()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const db = getSupabaseServerClient();
  const { error: storageError } = await db.storage.from("event-media").upload(filePath, arrayBuffer, {
    contentType: file.type,
    upsert: false,
  });
  if (storageError) {
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }

  // 6) Insert media row
  try {
    const inserted = await __test.insertMediaItem({
      eventId,
      uploaderId: user.id,
      filePath,
      mimeType: file.type,
      sizeBytes: file.size,
    });
    return NextResponse.json({ id: inserted.id, file_path: inserted.storage_path }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save upload." }, { status: 500 });
  }
}

