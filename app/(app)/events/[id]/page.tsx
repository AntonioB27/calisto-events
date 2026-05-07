import {
  EventAdminTabs,
  type EventAdminTabId,
  isEventAdminTabId,
} from "./_tabs/EventAdminTabs";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getPublicOrigin } from "@/lib/public-origin";
import { GalleryTab } from "./_tabs/GalleryTab";
import { GuestsTab } from "./_tabs/GuestsTab";
import { OverviewTab } from "./_tabs/OverviewTab";
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
  const selectedTab = resolveEventTab(pickQueryValue(resolvedSearchParams.tab));
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

  const isOrganizer = Boolean(event && user && event.organizer_id === user.id);

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

  return (
    <div style={{ padding: '40px 0 60px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: 'var(--app-text)' }}>
        {event.title}
      </h1>
      <p style={{ marginTop: 8, fontSize: 14, color: 'var(--app-muted)' }}>
        {new Date(event.event_date).toLocaleDateString()} •{" "}
        <span style={{ fontFamily: 'monospace' }}>Code: {event.access_code}</span>
      </p>

      <div style={{ marginTop: 24 }}>
        <EventAdminTabs eventId={id} selectedTab={selectedTab} />
      </div>

      <div style={{ marginTop: 24 }}>
        {selectedTab === "overview" && (
          <OverviewTab
            eventId={id}
            eventTitle={event.title}
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
            eventTitle={event.title}
            accessCode={event.access_code}
            publicOrigin={publicOrigin}
          />
        )}
      </div>
    </div>
  );
}
