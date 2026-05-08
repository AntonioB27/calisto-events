import type { PlanId } from "@/lib/plan-limits";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export type GuestEventContext = Readonly<{
  accessCode: string;
  planId: PlanId;
  eventDate: string;
  mediaItems: string[];
}>;

function isPlanId(value: string): value is PlanId {
  return (
    value === "free" ||
    value === "standard" ||
    value === "plus" ||
    value === "premium" ||
    value === "max"
  );
}

export async function getGuestEventContextByAccessCode(accessCode: string): Promise<GuestEventContext | null> {
  const db = getSupabaseServerClient();

  const { data: event, error: eventError } = await db
    .from("events")
    .select("id, access_code, plan, event_date")
    .eq("access_code", accessCode)
    .maybeSingle();

  if (
    eventError ||
    !event ||
    typeof event.plan !== "string" ||
    !isPlanId(event.plan) ||
    typeof event.event_date !== "string" ||
    !event.event_date
  ) {
    return null;
  }

  const { data: media } = await db
    .from("media_items")
    .select("storage_path")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false })
    .limit(12);

  const mediaItems = (media ?? [])
    .map((item) => item.storage_path)
    .filter((item): item is string => typeof item === "string" && item.length > 0);

  return {
    accessCode: typeof event.access_code === "string" ? event.access_code : accessCode,
    planId: event.plan,
    eventDate: event.event_date,
    mediaItems,
  };
}
