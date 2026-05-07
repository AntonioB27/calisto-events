import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { DashboardClient } from "./DashboardClient";

type EventRow = {
  id: string;
  title: string;
  event_date: string;
  plan: string;
  access_code: string;
};

export default async function DashboardPage() {
  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: events } = await supabase
    .from("events")
    .select("id, title, event_date, plan, access_code")
    .eq("organizer_id", user!.id)
    .order("event_date", { ascending: false });

  return (
    <DashboardClient
      organizerId={user!.id}
      userName={user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'there'}
      events={(events ?? []) as EventRow[]}
    />
  );
}
