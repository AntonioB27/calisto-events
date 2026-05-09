import {
  EventAdminTabs,
} from "./_tabs/EventAdminTabs";
import { isEventAdminTabId, type EventAdminTabId } from "./_tabs/event-admin-tabs";
import { displayNavEmoji, splitEventTitleStored } from "@/lib/event-title";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getPublicOrigin } from "@/lib/public-origin";
import { GalleryTab } from "./_tabs/GalleryTab";
import { GuestsTab } from "./_tabs/GuestsTab";
import { OverviewTab } from "./_tabs/OverviewTab";
import { SettingsTab } from "./_tabs/SettingsTab";
import { ShareTab } from "./_tabs/ShareTab";

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

  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: event } = await supabase
    .from("events")
    .select("id, title, event_date, plan, access_code, organizer_id")
    .eq("id", id)
    .maybeSingle();

  const isPrimaryOrganizer = Boolean(event && user && event.organizer_id === user.id);

  /** Today only the primary organizer may open this admin page — keep explicit for organizer-only tabs. */
  const isOrganizer = isPrimaryOrganizer;

  let selectedTab = resolveEventTab(pickQueryValue(resolvedSearchParams.tab));
  if (selectedTab === "settings" && !isPrimaryOrganizer) {
    selectedTab = "overview";
  }

  if (!event || !isOrganizer) {
    return (
      <div style={{ padding: '40px 0' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: 'var(--app-text)' }}>
          Event not found
        </h1>
        <p style={{ marginTop: 8, fontSize: 14, color: 'var(--app-muted)' }}>
          You don&apos;t have access to this event.
        </p>
      </div>
    );
  }

  const { emoji: storedEmoji, name: eventName } = splitEventTitleStored(String(event.title ?? "Event"));
  const navEmoji = displayNavEmoji(storedEmoji);

  return (
    <div style={{ padding: '40px 0 60px' }}>
      <EventAdminTabs
        eventId={id}
        selectedTab={selectedTab}
        eventTitle={eventName}
        eventEmoji={navEmoji}
        showOrganizerOnlyTabs={isPrimaryOrganizer}
      />

      <div style={{ marginTop: 24 }}>
        {selectedTab === "overview" && (
          <OverviewTab
            eventId={id}
            eventTitle={eventName}
            eventDate={event.event_date}
            plan={event.plan}
            accessCode={event.access_code}
          />
        )}
        {selectedTab === "guests" && <GuestsTab eventId={id} />}
        {selectedTab === "gallery" && <GalleryTab eventId={id} />}
        {selectedTab === "share" && (
          <ShareTab
            eventId={id}
            eventTitle={eventName}
            accessCode={event.access_code}
            publicOrigin={publicOrigin}
          />
        )}
        {selectedTab === "settings" && isPrimaryOrganizer && (
          <SettingsTab
            eventId={id}
            storedEmoji={storedEmoji}
            storedName={eventName}
            eventDate={event.event_date}
            plan={event.plan}
            accessCode={event.access_code}
          />
        )}
      </div>
    </div>
  );
}
