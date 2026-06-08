import { mergeDashboardEvents } from "@/lib/dashboard-events";
import { getAppStrings } from "@/lib/app-ui";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getUiLocale } from "@/lib/ui-locale";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const ui = getAppStrings(await getUiLocale());
  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: owned }, { data: coOrgMemberships }, { data: guestMemberships }] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, event_date, plan, access_code")
      .eq("organizer_id", user!.id),
    supabase.from("event_memberships").select("event_id").eq("user_id", user!.id).eq("role", "co_organizer"),
    supabase.from("event_memberships").select("event_id").eq("user_id", user!.id).eq("role", "guest"),
  ]);

  const coIds = [...new Set((coOrgMemberships ?? []).map((m) => String((m as { event_id?: unknown }).event_id ?? "")))].filter(
    Boolean,
  );

  const guestIds = [...new Set((guestMemberships ?? []).map((m) => String((m as { event_id?: unknown }).event_id ?? "")))].filter(
    Boolean,
  );

  let coEvents: typeof owned = [];
  if (coIds.length > 0) {
    const { data: fetched } = await supabase.from("events").select("id, title, event_date, plan, access_code").in("id", coIds);
    coEvents = fetched ?? [];
  }

  let guestEvents: typeof owned = [];
  if (guestIds.length > 0) {
    const { data: fetchedGuest } = await supabase
      .from("events")
      .select("id, title, event_date, plan, access_code")
      .in("id", guestIds);
    guestEvents = fetchedGuest ?? [];
  }

  const events = mergeDashboardEvents(owned ?? [], coEvents ?? [], guestEvents ?? []);

  // Fetch new-upload counts for owned + co-organised events (badge on dashboard cards)
  const newUploadCounts: Record<string, number> = {};
  const ownedIds = [...(owned ?? []).map((e) => e.id), ...coIds];
  if (ownedIds.length > 0) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: modRows } = await (supabase as any)
        .from("events")
        .select("id, moderation_enabled, organizer_gallery_reviewed_at")
        .in("id", ownedIds);

      if (Array.isArray(modRows)) {
        await Promise.all(
          modRows.map(async (row: Record<string, unknown>) => {
            const eventId = String(row.id ?? "");
            if (!eventId) return;
            const moderationEnabled = Boolean(row.moderation_enabled);
            const reviewedAt = typeof row.organizer_gallery_reviewed_at === "string"
              ? row.organizer_gallery_reviewed_at
              : null;

            let count = 0;
            if (moderationEnabled) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const { count: c } = await (supabase as any)
                .from("media_items")
                .select("*", { count: "exact", head: true })
                .eq("event_id", eventId)
                .eq("moderation_status", "pending");
              count = typeof c === "number" ? c : 0;
            } else if (reviewedAt) {
              const { count: c } = await supabase
                .from("media_items")
                .select("*", { count: "exact", head: true })
                .eq("event_id", eventId)
                .gt("created_at", reviewedAt);
              count = typeof c === "number" ? c : 0;
            }

            if (count > 0) newUploadCounts[eventId] = count;
          }),
        );
      }
    } catch {
      // moderation columns not yet applied — skip counts
    }
  }

  const userName =
    user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? ui.dashboard.fallbackName;

  return (
    <DashboardClient
      organizerId={user!.id}
      userName={userName}
      events={events}
      newUploadCounts={newUploadCounts}
    />
  );
}
