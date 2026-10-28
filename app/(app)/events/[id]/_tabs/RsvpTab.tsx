import { normalizePlanId, planRank } from "@/lib/plan-limits";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";

import { RsvpManager } from "./RsvpManager";
import { RsvpUpgradePrompt } from "./RsvpUpgradePrompt";

type RsvpTabProps = Readonly<{
  eventId: string;
  plan: string;
  publicOrigin: string;
}>;

export async function RsvpTab({ eventId, plan, publicOrigin }: RsvpTabProps) {
  const planEligible = planRank(normalizePlanId(plan)) >= planRank("standard");

  if (!planEligible) {
    // The upsell links to Settings, which only the primary organizer (events.organizer_id) can open.
    const supabase = await createSupabaseAuthServerClient();
    const [{ data: auth }, { data: event }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("events").select("organizer_id").eq("id", eventId).maybeSingle(),
    ]);
    const canChangePlan = Boolean(auth.user && event && auth.user.id === String(event.organizer_id));
    return <RsvpUpgradePrompt eventId={eventId} canChangePlan={canChangePlan} />;
  }

  return <RsvpManager eventId={eventId} publicOrigin={publicOrigin} />;
}
