import Link from "next/link";
import { redirect } from "next/navigation";
import { getAppStrings } from "@/lib/app-ui";
import { getEventAdminAccess } from "@/lib/event-admin-access";
import { splitEventTitleStored } from "@/lib/event-title";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getUiLocale } from "@/lib/ui-locale";
import { InvitationsEditor } from "../_tabs/InvitationsEditor";

export default async function InvitationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const uiLocale = await getUiLocale();
  const ui = getAppStrings(uiLocale);
  const supabase = await createSupabaseAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: event } = await supabase.from("events")
    .select("id, title, event_date, event_kind, organizer_id")
    .eq("id", id).maybeSingle();
  if (!event) redirect(`/events/${id}`);
  const access = await getEventAdminAccess(supabase, {
    eventId: id, userId: user?.id, organizerId: String(event.organizer_id ?? ""),
  });
  if (!access.isPrimaryOrganizer) redirect(`/events/${id}`);
  if (event.event_kind !== "wedding") redirect(`/events/${id}?tab=prints`);

  const { data: drafts, error } = await supabase.from("event_print_template_instances")
    .select("template_id, field_values").eq("event_id", id);
  if (error) throw new Error("Could not load invitation drafts.");
  const printDraftByTemplateId: Record<string, Record<string, string>> = {};
  for (const row of drafts ?? []) {
    if (typeof row.template_id !== "string" || !row.field_values || typeof row.field_values !== "object" || Array.isArray(row.field_values)) continue;
    printDraftByTemplateId[row.template_id] = Object.fromEntries(
      Object.entries(row.field_values).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    );
  }
  const { name } = splitEventTitleStored(String(event.title ?? ui.defaults.eventTitle));
  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-6 pb-20">
      <Link href={`/events/${id}?tab=prints`} className="inline-flex items-center gap-2 text-sm text-[var(--app-muted)] hover:text-[var(--app-text)]">
        {ui.print.backPrints}
      </Link>
      <h1 className="mt-5 text-2xl font-semibold text-[var(--app-text)]">{ui.printsTab.categoryInvitation}</h1>
      <p className="mt-2 text-sm text-[var(--app-muted)]">{name}</p>
      <InvitationsEditor eventId={id} eventKind="wedding" eventDisplayName={name}
        eventDateIso={typeof event.event_date === "string" ? event.event_date : ""}
        uiLocale={uiLocale} printDraftByTemplateId={printDraftByTemplateId} />
    </main>
  );
}
