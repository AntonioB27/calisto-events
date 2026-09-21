import { normalizePlanId, planRank } from "@/lib/plan-limits";

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
    return <RsvpUpgradePrompt eventId={eventId} />;
  }

  return <RsvpManager eventId={eventId} publicOrigin={publicOrigin} />;
}
