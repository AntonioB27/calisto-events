import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Primary organizer (`events.organizer_id`) full access including Settings.
 * Co-organizers (`event_memberships.role === co_organizer`) get the same tabs except organizer-only tabs.
 */
export async function getEventAdminAccess(
  supabase: SupabaseClient,
  params: Readonly<{ eventId: string; userId: string | null | undefined; organizerId: string }>,
): Promise<{ canAccess: boolean; isPrimaryOrganizer: boolean }> {
  const { eventId, userId, organizerId } = params;
  if (!userId) return { canAccess: false, isPrimaryOrganizer: false };
  if (userId === organizerId) return { canAccess: true, isPrimaryOrganizer: true };

  const { data, error } = await supabase
    .from("event_memberships")
    .select("role")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return { canAccess: false, isPrimaryOrganizer: false };
  const role = typeof (data as { role?: string }).role === "string" ? (data as { role: string }).role : "";
  if (role === "co_organizer") return { canAccess: true, isPrimaryOrganizer: false };

  return { canAccess: false, isPrimaryOrganizer: false };
}
