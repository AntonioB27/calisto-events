import { redirect } from "next/navigation";
import { getAppStrings } from "@/lib/app-ui";
import { getEventAdminAccess } from "@/lib/event-admin-access";
import { normalizeEventKind } from "@/lib/event-kind";
import { listPrintTemplatesForEventKind } from "@/lib/event-print/template-catalog";
import {
  formatEventDateForPrintField,
  guessPartnerNamesFromEventTitle,
} from "@/lib/event-print/print-field-defaults";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getUiLocale } from "@/lib/ui-locale";
import { PrintsSetupWizard } from "./PrintsSetupWizard";

type Props = Readonly<{
  params: Promise<{ id: string }>;
}>;

export default async function PrintsSetupPage({ params }: Props) {
  const { id } = await params;
  const uiLocale = await getUiLocale();
  const ui = getAppStrings(uiLocale);

  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: event } = await supabase
    .from("events")
    .select("id, title, event_date, event_kind, prints_event_kind_set_at, organizer_id")
    .eq("id", id)
    .maybeSingle();

  if (!event) redirect(`/events/${id}`);

  const access = await getEventAdminAccess(supabase, {
    eventId: id,
    userId: user?.id,
    organizerId: String(event.organizer_id ?? ""),
  });

  if (!access.isPrimaryOrganizer) redirect(`/events/${id}`);

  const eventKind = normalizeEventKind(event.event_kind);
  const invitationTemplateIds = listPrintTemplatesForEventKind(eventKind)
    .filter((t) => t.category === "invitation")
    .map((t) => t.id);

  const { data: draftRows } = await supabase
    .from("event_print_template_instances")
    .select("template_id, field_values")
    .eq("event_id", id);

  const existingDraft: Record<string, string> = {};
  if (Array.isArray(draftRows)) {
    for (const row of draftRows) {
      const fv = (row as { field_values?: unknown }).field_values;
      if (!fv || typeof fv !== "object" || Array.isArray(fv)) continue;
      for (const [k, v] of Object.entries(fv as Record<string, unknown>)) {
        if (typeof v === "string" && !(k in existingDraft)) existingDraft[k] = v;
      }
    }
  }

  const eventDateIso = typeof event.event_date === "string" ? event.event_date : "";
  const eventDisplayName = typeof event.title === "string" ? event.title : "";
  const { partnerA, partnerB } = guessPartnerNamesFromEventTitle(eventDisplayName);
  const formattedDate = formatEventDateForPrintField(eventDateIso, uiLocale);

  return (
    <PrintsSetupWizard
      eventId={id}
      eventDisplayName={eventDisplayName}
      formattedDate={formattedDate}
      partnerADefault={existingDraft.partner_a ?? partnerA}
      partnerBDefault={existingDraft.partner_b ?? (partnerB || partnerA)}
      existingDraft={existingDraft}
      invitationTemplateIds={invitationTemplateIds}
      userInitial={(user?.user_metadata?.full_name?.[0] ?? user?.email?.[0] ?? "U").toUpperCase()}
      ui={ui}
    />
  );
}
