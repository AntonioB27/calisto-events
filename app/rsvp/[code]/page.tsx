import { getSupabaseServerClient } from "@/lib/supabase-server";
import { normalizeRsvpCode } from "@/lib/rsvp-code";
import { normalizePlanId, planRank } from "@/lib/plan-limits";
import { getAppStrings } from "@/lib/app-ui";
import { getUiLocale } from "@/lib/ui-locale";

import { RsvpForm } from "./RsvpForm";

type RsvpPageProps = Readonly<{
  params: Promise<{ code: string }>;
}>;

export default async function RsvpPage({ params }: RsvpPageProps) {
  const { code } = await params;
  const uiLocale = await getUiLocale();
  const ui = getAppStrings(uiLocale);
  const normalizedCode = normalizeRsvpCode(code);

  const db = getSupabaseServerClient();
  const { data: event } = await db
    .from("events")
    .select("id, title, plan, rsvp_open")
    .eq("rsvp_code", normalizedCode)
    .maybeSingle();

  if (!event) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "64px 20px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 24, color: "var(--app-text)" }}>
          {ui.rsvpPublic.notFoundTitle}
        </h1>
        <p style={{ marginTop: 8, color: "var(--app-muted)" }}>{ui.rsvpPublic.notFoundBody}</p>
      </main>
    );
  }

  const eventRow = event as { id: string; title: string; plan: string; rsvp_open: boolean };
  const planEligible = planRank(normalizePlanId(eventRow.plan)) >= planRank("standard");
  const isOpen = planEligible && eventRow.rsvp_open;

  if (!isOpen) {
    return (
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "64px 20px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 24, color: "var(--app-text)" }}>
          {ui.rsvpPublic.closedTitle}
        </h1>
        <p style={{ marginTop: 8, color: "var(--app-muted)" }}>{ui.rsvpPublic.closedBody}</p>
      </main>
    );
  }

  return <RsvpForm code={normalizedCode} eventId={eventRow.id} eventTitle={eventRow.title} />;
}
