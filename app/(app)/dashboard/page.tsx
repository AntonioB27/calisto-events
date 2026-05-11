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

  const [{ data: owned }, { data: coOrgMemberships }] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, event_date, plan, access_code")
      .eq("organizer_id", user!.id),
    supabase.from("event_memberships").select("event_id").eq("user_id", user!.id).eq("role", "co_organizer"),
  ]);

  const coIds = [...new Set((coOrgMemberships ?? []).map((m) => String((m as { event_id?: unknown }).event_id ?? "")))].filter(
    Boolean,
  );

  let coEvents: typeof owned = [];
  if (coIds.length > 0) {
    const { data: fetched } = await supabase.from("events").select("id, title, event_date, plan, access_code").in("id", coIds);
    coEvents = fetched ?? [];
  }

  const events = mergeDashboardEvents(owned ?? [], coEvents ?? []);

  const userName =
    user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? ui.dashboard.fallbackName;

  return (
    <DashboardClient
      organizerId={user!.id}
      userName={userName}
      events={events}
    />
  );
}
