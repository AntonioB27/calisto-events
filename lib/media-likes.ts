import type { SupabaseClient } from "@supabase/supabase-js";

import { buildMemberLabelMap } from "@/lib/event-member-labels";

export type LikeSummary = {
  counts: Map<string, number>;
  likedByMe: Set<string>;
};

export type LikerRow = {
  userId: string;
  label: string;
};

export type CanViewLikersParams = Readonly<{
  viewerId: string | null;
  organizerId: string;
  canManageEvent: boolean;
  uploadedBy: string | null;
}>;

export function canViewLikers(params: CanViewLikersParams): boolean {
  const { viewerId, organizerId, canManageEvent, uploadedBy } = params;
  if (!viewerId) return false;
  if (canManageEvent || viewerId === organizerId) return true;
  if (uploadedBy && viewerId === uploadedBy) return true;
  return false;
}

export function summarizeLikeRows(
  rows: ReadonlyArray<{ media_item_id: string; user_id: string }>,
  currentUserId: string | null,
): LikeSummary {
  const counts = new Map<string, number>();
  const likedByMe = new Set<string>();
  for (const row of rows) {
    counts.set(row.media_item_id, (counts.get(row.media_item_id) ?? 0) + 1);
    if (currentUserId && row.user_id === currentUserId) {
      likedByMe.add(row.media_item_id);
    }
  }
  return { counts, likedByMe };
}

export async function fetchLikeSummaryForMedia(
  supabase: SupabaseClient,
  mediaIds: string[],
  currentUserId: string | null,
): Promise<LikeSummary> {
  if (mediaIds.length === 0) {
    return { counts: new Map(), likedByMe: new Set() };
  }

  const { data, error } = await supabase
    .from("media_likes")
    .select("media_item_id, user_id")
    .in("media_item_id", mediaIds);

  if (error) throw error;
  return summarizeLikeRows((data ?? []) as Array<{ media_item_id: string; user_id: string }>, currentUserId);
}

type LabelContext = Readonly<{
  eventId: string;
  organizerId: string;
  labelDefaults: Readonly<{ organizer: string; guest: string }>;
}>;

export async function fetchLikersForMedia(
  supabase: SupabaseClient,
  mediaItemId: string,
  ctx: LabelContext,
): Promise<LikerRow[]> {
  const { data: likeRows, error: likeErr } = await supabase
    .from("media_likes")
    .select("user_id, created_at")
    .eq("media_item_id", mediaItemId)
    .order("created_at", { ascending: false });

  if (likeErr) throw likeErr;

  const userIds = [...new Set((likeRows ?? []).map((r) => (r as { user_id: string }).user_id))];
  if (userIds.length === 0) return [];

  const [{ data: memberships }, { data: profiles }] = await Promise.all([
    supabase
      .from("event_memberships")
      .select("user_id, display_name_at_event")
      .eq("event_id", ctx.eventId)
      .in("user_id", userIds),
    supabase.from("profiles").select("id, display_name").in("id", userIds),
  ]);

  const labels = buildMemberLabelMap(
    userIds,
    ctx.organizerId,
    memberships as Array<{ user_id: string; display_name_at_event: string | null }> | null,
    profiles as Array<{ id: string; display_name: string | null }> | null,
    ctx.labelDefaults,
  );

  return userIds.map((userId) => ({
    userId,
    label: labels.get(userId) ?? ctx.labelDefaults.guest,
  }));
}

export async function toggleLike(
  supabase: SupabaseClient,
  params: Readonly<{ mediaItemId: string; eventId: string; currentlyLiked: boolean }>,
): Promise<void> {
  const { mediaItemId, eventId, currentlyLiked } = params;

  if (currentlyLiked) {
    const { error } = await supabase.from("media_likes").delete().eq("media_item_id", mediaItemId);
    if (error) throw error;
    return;
  }

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase.from("media_likes").insert({
    media_item_id: mediaItemId,
    user_id: user.id,
    event_id: eventId,
  });
  if (error) throw error;
}
