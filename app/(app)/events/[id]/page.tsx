import {
  EventAdminTabs,
} from "./_tabs/EventAdminTabs";
import { isEventAdminTabId, type EventAdminTabId } from "./_tabs/event-admin-tabs";
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

function splitLeadingEmoji(title: string): { emoji: string; title: string } {
  const trimmed = title.trim();
  const parts = Array.from(trimmed);
  if (parts.length < 2) return { emoji: "📅", title: trimmed };
  const first = parts[0] ?? "";
  const afterFirst = trimmed.slice(first.length);
  if (afterFirst.startsWith(" ")) {
    return { emoji: first, title: afterFirst.trimStart() || "Event" };
  }
  return { emoji: "📅", title: trimmed };
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

  const split = splitLeadingEmoji(String(event.title ?? "Event"));

  return (
    <div style={{ padding: '40px 0 60px' }}>
      <EventAdminTabs eventId={id} selectedTab={selectedTab} eventTitle={split.title} eventEmoji={split.emoji} />

      <div style={{ marginTop: 24 }}>
        {selectedTab === "overview" && (
          <OverviewTab
            eventId={id}
            eventTitle={split.title}
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
            eventTitle={split.title}
            accessCode={event.access_code}
            publicOrigin={publicOrigin}
          />
        )}
      </div>
    </div>
  );
}
