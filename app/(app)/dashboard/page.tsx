import { mergeDashboardEvents } from "@/lib/dashboard-events";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: owned }, { data: coOrgMemberships }, { data: guestMemberships }] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, event_date, plan, access_code, scheduled_deletion_at")
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
    const { data: fetched } = await supabase.from("events").select("id, title, event_date, plan, access_code, scheduled_deletion_at").in("id", coIds);
    coEvents = fetched ?? [];
  }

  let guestEvents: typeof owned = [];
  if (guestIds.length > 0) {
    const { data: fetchedGuest } = await supabase
      .from("events")
      .select("id, title, event_date, plan, access_code, scheduled_deletion_at")
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

  // Retention date per event, for "download before {date}" on ended events.
  const deletionDates: Record<string, string> = {};
  for (const row of [...(owned ?? []), ...(coEvents ?? []), ...(guestEvents ?? [])]) {
    const at = (row as { scheduled_deletion_at?: unknown }).scheduled_deletion_at;
    if (typeof at === "string") deletionDates[row.id] = at;
  }

  // Latest photos (up to 3 per event) + memory counts, for the print stacks on the list.
  const photos: Record<string, string[]> = {};
  const memoryCounts: Record<string, number> = {};
  const eventIds = events.map((e) => e.id);
  if (eventIds.length > 0) {
    try {
      const [{ data: mediaRows }] = await Promise.all([
        // shortcut: one query capped at 300 rows, so an older event can miss its thumbnail behind a very busy one; upgrade to an RPC with a per-event limit if that shows up.
        supabase
          .from("media_items")
          .select("event_id, storage_path, mime_type")
          .in("event_id", eventIds)
          .order("created_at", { ascending: false })
          .limit(300),
        ...eventIds.map(async (id) => {
          const { count } = await supabase.from("media_items").select("*", { count: "exact", head: true }).eq("event_id", id);
          if (typeof count === "number") memoryCounts[id] = count;
        }),
      ]);
      const picks: { event_id: string; storage_path: string }[] = [];
      const perEvent: Record<string, number> = {};
      for (const r of (mediaRows ?? []) as { event_id: string; storage_path: string; mime_type: string | null }[]) {
        if (r.mime_type?.startsWith("video/") || (perEvent[r.event_id] ?? 0) >= 3) continue;
        perEvent[r.event_id] = (perEvent[r.event_id] ?? 0) + 1;
        picks.push(r);
      }
      if (picks.length > 0) {
        const { data: signed } = await supabase.storage.from("event-media").createSignedUrls(
          picks.map((p) => p.storage_path),
          3600,
        );
        const byPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
        for (const p of picks) {
          const url = byPath.get(p.storage_path);
          if (url) (photos[p.event_id] ??= []).push(url);
        }
      }
    } catch {
      // media is decorative here; fall back to emoji
    }
  }

  // Guests per own event ("412 memories from 57 guests") and the viewer's own uploads on events they joined.
  const guestCounts: Record<string, number> = {};
  const myUploadCounts: Record<string, number> = {};
  await Promise.all(
    events.map(async (e) => {
      if (e.membershipRole === "guest") {
        const { count } = await supabase
          .from("media_items")
          .select("*", { count: "exact", head: true })
          .eq("event_id", e.id)
          .eq("uploaded_by", user!.id);
        if (typeof count === "number") myUploadCounts[e.id] = count;
      } else {
        const { count } = await supabase
          .from("event_memberships")
          .select("*", { count: "exact", head: true })
          .eq("event_id", e.id);
        if (typeof count === "number") guestCounts[e.id] = count;
      }
    }),
  );

  return (
    <DashboardClient
      organizerId={user!.id}
      events={events}
      newUploadCounts={newUploadCounts}
      photos={photos}
      memoryCounts={memoryCounts}
      deletionDates={deletionDates}
      guestCounts={guestCounts}
      myUploadCounts={myUploadCounts}
    />
  );
}
