import { EventLeaveBanner } from "./_components/EventLeaveBanner";
import {
  EventAdminTabs,
} from "./_tabs/EventAdminTabs";
import { isEventAdminTabId, type EventAdminTabId } from "./_tabs/event-admin-tabs";
import { displayNavEmoji, splitEventTitleStored } from "@/lib/event-title";
import { getAppStrings } from "@/lib/app-ui";
import { getEventAdminAccess } from "@/lib/event-admin-access";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getPublicOrigin } from "@/lib/public-origin";
import { getUiLocale } from "@/lib/ui-locale";
import { GalleryTab } from "./_tabs/GalleryTab";
import { GuestsTab } from "./_tabs/GuestsTab";
import { OverviewTab } from "./_tabs/OverviewTab";
import { SettingsTab } from "./_tabs/SettingsTab";
import { PrintsTab } from "./_tabs/PrintsTab";
import { ShareTab } from "./_tabs/ShareTab";
import { normalizeEventKind } from "@/lib/event-kind";

type EventPageProps = Readonly<{
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}>;

function pickQueryValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function resolveEventTab(value: string | undefined): EventAdminTabId {
  if (isEventAdminTabId(value)) {
    return value;
  }

  return "overview";
}

export default async function EventPage({ params, searchParams }: EventPageProps) {
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const publicOrigin = await getPublicOrigin();
  const uiLocale = await getUiLocale();
  const uiCopy = getAppStrings(uiLocale);

  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: event } = await supabase
    .from("events")
    .select("id, title, event_date, plan, access_code, organizer_id, scheduled_deletion_at, event_kind, prints_event_kind_set_at")
    .eq("id", id)
    .maybeSingle();

  const [access, guestCountResult, mediaCountResult] = await Promise.all([
    event
      ? getEventAdminAccess(supabase, { eventId: id, userId: user?.id, organizerId: String(event.organizer_id) })
      : Promise.resolve({ canAccess: false, isPrimaryOrganizer: false }),
    supabase.from("event_memberships").select("*", { count: "exact", head: true }).eq("event_id", id),
    supabase.from("media_items").select("*", { count: "exact", head: true }).eq("event_id", id),
  ]);

  const isPrimaryOrganizer = access.isPrimaryOrganizer;

  let selectedTab = resolveEventTab(pickQueryValue(resolvedSearchParams.tab));
  if ((selectedTab === "settings" || selectedTab === "prints") && !isPrimaryOrganizer) {
    selectedTab = "overview";
  }

  let printDraftByTemplateId: Readonly<Record<string, Readonly<Record<string, string>>>> = {};
  if (isPrimaryOrganizer && selectedTab === "prints") {
    const { data: draftRows, error: draftErr } = await supabase
      .from("event_print_template_instances")
      .select("template_id, field_values")
      .eq("event_id", id);

    if (!draftErr && Array.isArray(draftRows)) {
      const acc: Record<string, Record<string, string>> = {};
      for (const row of draftRows) {
        const tid = (row as { template_id?: unknown }).template_id;
        const fv = (row as { field_values?: unknown }).field_values;
        if (typeof tid !== "string" || !tid) continue;
        if (!fv || typeof fv !== "object" || Array.isArray(fv)) {
          acc[tid] = {};
          continue;
        }
        const out: Record<string, string> = {};
        for (const [k, v] of Object.entries(fv as Record<string, unknown>)) {
          if (typeof v === "string") out[k] = v;
        }
        acc[tid] = out;
      }
      printDraftByTemplateId = acc;
    }
  }

  if (!event || !access.canAccess) {
    return (
      <div style={{ padding: '40px 0' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: 'var(--app-text)' }}>
          {uiCopy.forbidden.title}
        </h1>
        <p style={{ marginTop: 8, fontSize: 14, color: 'var(--app-muted)' }}>
          {uiCopy.forbidden.deny}
        </p>
      </div>
    );
  }

  const { emoji: storedEmoji, name: eventName } = splitEventTitleStored(
    String(event.title ?? uiCopy.defaults.eventTitle),
  );
  const navEmoji = displayNavEmoji(storedEmoji);
  const storedEventKind = normalizeEventKind(
    typeof (event as { event_kind?: unknown }).event_kind === "string"
      ? (event as { event_kind: string }).event_kind
      : undefined,
  );
  const printsEventKindSetAtRaw = (event as { prints_event_kind_set_at?: unknown }).prints_event_kind_set_at;
  const printsEventKindSetAt =
    typeof printsEventKindSetAtRaw === "string" && printsEventKindSetAtRaw.length > 0 ? printsEventKindSetAtRaw : null;

  return (
    <div style={{ padding: '0 0 60px' }}>
      <EventAdminTabs
        eventId={id}
        selectedTab={selectedTab}
        eventTitle={eventName}
        eventEmoji={navEmoji}
        showOrganizerOnlyTabs={isPrimaryOrganizer}
        guestCount={guestCountResult.count ?? 0}
        mediaCount={mediaCountResult.count ?? 0}
        eventDate={event.event_date ?? null}
      />

      {!isPrimaryOrganizer ? (
        <div style={{ marginTop: 18 }}>
          <EventLeaveBanner eventId={id} />
        </div>
      ) : null}

      <div style={{ marginTop: 24 }}>
        {selectedTab === "overview" && (
          <OverviewTab
            eventId={id}
            eventDate={event.event_date}
            plan={event.plan}
            scheduledDeletionAt={
              typeof (event as { scheduled_deletion_at?: unknown }).scheduled_deletion_at === "string"
                ? (event as { scheduled_deletion_at: string }).scheduled_deletion_at
                : null
            }
            accessCode={event.access_code}
            publicOrigin={publicOrigin}
            adminRoleLabel={
              isPrimaryOrganizer ? uiCopy.dashboard.roleOrganizer : uiCopy.dashboard.roleCoOrganizer
            }
          />
        )}
        {selectedTab === "guests" && <GuestsTab eventId={id} />}
        {selectedTab === "gallery" && <GalleryTab eventId={id} isPrimaryOrganizer={isPrimaryOrganizer} />}
        {selectedTab === "share" && (
          <ShareTab
            eventId={id}
            eventTitle={eventName}
            accessCode={event.access_code}
            publicOrigin={publicOrigin}
          />
        )}
        {selectedTab === "prints" && isPrimaryOrganizer && (
          <PrintsTab
            key={`prints-${eventName}-${String(event.event_date ?? "")}`}
            eventId={id}
            eventKind={storedEventKind}
            printsEventKindSetAt={printsEventKindSetAt}
            eventDisplayName={eventName}
            eventDateIso={typeof event.event_date === "string" ? event.event_date : ""}
            uiLocale={uiLocale}
            printDraftByTemplateId={printDraftByTemplateId}
          />
        )}
        {selectedTab === "settings" && isPrimaryOrganizer && (
          <SettingsTab
            eventId={id}
            storedEmoji={storedEmoji}
            storedName={eventName}
            fullStoredTitle={String(event.title ?? "")}
            eventDate={event.event_date}
            plan={event.plan}
            accessCode={event.access_code}
          />
        )}
      </div>
    </div>
  );
}
