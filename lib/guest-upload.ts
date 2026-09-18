import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { PlanId } from "@/lib/plan-limits";

export type MediaType = "photo" | "video";

export type EventUploadContext = {
  planId: PlanId;
  eventDate: string;
  moderationEnabled: boolean;
  organizerId: string;
};

export async function getEventUploadContext(eventId: string): Promise<EventUploadContext | null> {
  const db = getSupabaseServerClient();
  const { data, error } = await db
    .from("events")
    .select("id, plan, event_date, moderation_enabled, organizer_id")
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

  return {
    planId,
    eventDate: data.event_date,
    moderationEnabled: Boolean((data as { moderation_enabled?: unknown }).moderation_enabled),
    organizerId: typeof (data as { organizer_id?: unknown }).organizer_id === "string"
      ? (data as { organizer_id: string }).organizer_id
      : "",
  };
}

export const MIME_TO_EXT: Record<string, string> = {
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
export async function countMediaForQuota(eventId: string, mediaType: MediaType): Promise<number> {
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

export async function insertMediaItem(params: {
  eventId: string;
  uploaderId: string;
  filePath: string;
  mimeType: string;
  sizeBytes: number;
  thumbnailPath: string | null;
  moderationStatus: "visible" | "pending";
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
      thumbnail_path: params.thumbnailPath,
      moderation_status: params.moderationStatus,
    })
    .select("id, storage_path")
    .single();

  if (error) {
    throw error;
  }
  return data as { id: string; storage_path: string };
}

export function resolveModerationStatus(args: {
  eventContext: EventUploadContext;
  uploaderId: string;
}): "visible" | "pending" {
  // Organizer uploads always land as visible regardless of moderation mode.
  return args.eventContext.moderationEnabled && args.uploaderId !== args.eventContext.organizerId
    ? "pending"
    : "visible";
}
