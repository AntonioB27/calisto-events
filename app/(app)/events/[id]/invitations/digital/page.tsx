import { redirect } from "next/navigation";

import { getPublicOrigin } from "@/lib/public-origin";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getUiLocale } from "@/lib/ui-locale";
import { splitEventTitleStored } from "@/lib/event-title";
import { DigitalInvitationsDashboard } from "./DigitalInvitationsDashboard";

type HouseholdRow = {
  id: string; label: string; public_token: string; max_attendees: number; response_status: "pending" | "attending" | "declined";
  responded_at: string | null; digital_invitation_attendees?: Array<{ name?: string | null }> | null;
};

export default async function DigitalInvitationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const uiLocale = await getUiLocale();
  const supabase = await createSupabaseAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: event } = await supabase.from("events")
    .select("id, title, organizer_id, event_kind").eq("id", id).maybeSingle();
  if (!event || event.organizer_id !== user?.id || event.event_kind !== "wedding") redirect(`/events/${id}/invitations`);

  const { data: invitation } = await supabase.from("event_digital_invitations")
    .select("id, published_at").eq("event_id", id).maybeSingle();
  let households: HouseholdRow[] = [];
  if (invitation) {
    const { data } = await supabase.from("digital_invitation_households")
      .select("id, label, public_token, max_attendees, response_status, responded_at, digital_invitation_attendees(name)")
      .eq("digital_invitation_id", invitation.id).order("created_at", { ascending: true });
    households = (data ?? []) as HouseholdRow[];
  }
  const { name } = splitEventTitleStored(String(event.title ?? ""));
  const origin = await getPublicOrigin();
  return <DigitalInvitationsDashboard
    eventId={id} eventName={name} origin={origin} locale={uiLocale}
    publishedAt={typeof invitation?.published_at === "string" ? invitation.published_at : null}
    households={households.map(household => ({
      id: household.id, label: household.label, token: household.public_token, maxAttendees: household.max_attendees,
      responseStatus: household.response_status, respondedAt: household.responded_at,
      attendeeNames: (household.digital_invitation_attendees ?? []).flatMap(attendee => typeof attendee.name === "string" ? [attendee.name] : []),
    }))}
  />;
}
