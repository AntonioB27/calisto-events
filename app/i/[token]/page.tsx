import { notFound } from "next/navigation";

import { DigitalInvitationRsvp } from "./DigitalInvitationRsvp";
import type { Locale } from "@/lib/i18n";
import { getSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getSupabaseServerClient } from "@/lib/supabase-server";

type PublicInvitationRow = {
  event_id: string; event_title: string; event_date: string; household_label: string; max_attendees: number;
  response_status: "pending" | "attending" | "declined"; response_deadline: string | null; published_fields: unknown; attendee_names: string[];
};
function strings(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string");
  return entries.length === Object.keys(value).length ? Object.fromEntries(entries) : null;
}
function isUuid(value: string) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }

export const dynamic = "force-dynamic";

export default async function PublicDigitalInvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!isUuid(token)) notFound();
  const supabase = getSupabaseAuthServerClient();
  const { data, error } = await supabase.rpc("get_digital_invitation", { p_token: token });
  const row = (Array.isArray(data) ? data[0] : null) as PublicInvitationRow | null;
  const fields = strings(row?.published_fields);
  if (error || !row || !fields) notFound();
  const locale: Locale = fields.content_locale === "hr" || fields.content_locale === "de" ? fields.content_locale : "en";
  let photoUrl: string | null = null;
  const photoPath = fields.couple_photo_path;
  if (photoPath && photoPath.startsWith(`${row.event_id}/invite-photo/`) && !photoPath.includes("..")) {
    try {
      const service = getSupabaseServerClient();
      const { data: signed } = await service.storage.from("event-media").createSignedUrl(photoPath, 3600);
      photoUrl = signed?.signedUrl ?? null;
    } catch { photoUrl = null; }
  }
  const closed = Boolean(row.response_deadline && Date.parse(row.response_deadline) < Date.now());
  return <DigitalInvitationRsvp token={token} eventTitle={row.event_title} eventDateIso={row.event_date} fields={fields} locale={locale} photoUrl={photoUrl}
    householdLabel={row.household_label} maxAttendees={row.max_attendees} initialStatus={row.response_status}
    initialNames={Array.isArray(row.attendee_names) ? row.attendee_names : []} closed={closed} />;
}
