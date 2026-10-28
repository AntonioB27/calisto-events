import Link from "next/link";

import { EventAdminTabs } from "./_tabs/EventAdminTabs";
import { isEventAdminTabId, type EventAdminTabId } from "./_tabs/event-admin-tabs";
import { displayNavEmoji, splitEventTitleStored } from "@/lib/event-title";
import { getAppStrings } from "@/lib/app-ui";
import { getEventAdminAccess } from "@/lib/event-admin-access";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { getPublicOrigin } from "@/lib/public-origin";
import { getUiLocale } from "@/lib/ui-locale";
import { GalleryTab } from "./_tabs/GalleryTab";
import { GuestsTab } from "./_tabs/GuestsTab";
import { OverviewTab, type HomePhoto } from "./_tabs/OverviewTab";
import { SettingsTab } from "./_tabs/SettingsTab";
import { PrintsTab } from "./_tabs/PrintsTab";
import { ShareTab } from "./_tabs/ShareTab";
import { RsvpTab } from "./_tabs/RsvpTab";
import { MoreTab } from "./_tabs/MoreTab";
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

const MEDIA_COLS = "id, storage_path, thumbnail_path, mime_type";
type MediaRow = { id: string; storage_path: string; thumbnail_path: string | null; mime_type: string | null };

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

  const [access, mediaCountResult] = await Promise.all([
    event
      ? getEventAdminAccess(supabase, { eventId: id, userId: user?.id, organizerId: String(event.organizer_id) })
      : Promise.resolve({ canAccess: false, isPrimaryOrganizer: false }),
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

  // Fetch banner_theme separately — safe before migration is applied
  let bannerTheme: string | undefined;
  if (event) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: themeRow, error: themeErr } = await (supabase as any)
        .from("events")
        .select("banner_theme")
        .eq("id", id)
        .maybeSingle();
      if (!themeErr && typeof (themeRow as Record<string, unknown> | null)?.banner_theme === "string") {
        bannerTheme = (themeRow as Record<string, string>).banner_theme;
      }
    } catch {
      // column not yet added — use default
    }
  }

  // Fetch moderation columns — safe before migration is applied
  let moderationEnabled = false;
  let organizerGalleryReviewedAt: string | null = null;
  if (event && isPrimaryOrganizer) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: modRow } = await (supabase as any)
        .from("events")
        .select("moderation_enabled, organizer_gallery_reviewed_at")
        .eq("id", id)
        .maybeSingle();
      if (modRow) {
        moderationEnabled = Boolean((modRow as Record<string, unknown>).moderation_enabled);
        const rat = (modRow as Record<string, unknown>).organizer_gallery_reviewed_at;
        organizerGalleryReviewedAt = typeof rat === "string" ? rat : null;
      }
    } catch {
      // column not yet added — use defaults
    }
  }

  // New since the organizer last looked: pending items under moderation, else uploads after the last review.
  // The newest three come along for Home's next-step card.
  let newUploadsCount = 0;
  let newRows: MediaRow[] = [];
  if (event && isPrimaryOrganizer && (moderationEnabled || organizerGalleryReviewedAt)) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const base = (supabase as any).from("media_items").select(MEDIA_COLS, { count: "exact" }).eq("event_id", id);
      const { count, data } = await (moderationEnabled
        ? base.eq("moderation_status", "pending")
        : base.gt("created_at", organizerGalleryReviewedAt)
      ).order("created_at", { ascending: false }).limit(3);
      newUploadsCount = typeof count === "number" ? count : 0;
      newRows = (data ?? []) as MediaRow[];
    } catch {
      // moderation columns missing — no badge
    }
  }

  // Home: newest photos (cover + "Latest"), the new ones, and how many guests joined.
  let latestPhotos: HomePhoto[] = [];
  let newPhotos: HomePhoto[] = [];
  let guestCount = 0;
  if (event && selectedTab === "overview") {
    try {
      const [{ data: latestRows }, { count: members }] = await Promise.all([
        supabase.from("media_items").select(MEDIA_COLS).eq("event_id", id).order("created_at", { ascending: false }).limit(12),
        supabase.from("event_memberships").select("*", { count: "exact", head: true }).eq("event_id", id),
      ]);
      guestCount = members ?? 0;
      const photosOnly = (rows: MediaRow[], n: number) =>
        rows.filter((r) => !r.mime_type?.startsWith("video/")).slice(0, n).map((r) => ({ id: r.id, path: r.thumbnail_path ?? r.storage_path }));
      const latest = photosOnly((latestRows ?? []) as MediaRow[], 6);
      const fresh = photosOnly(newRows, 3);
      const paths = [...new Set([...latest, ...fresh].map((p) => p.path))];
      if (paths.length > 0) {
        const { data: signed } = await supabase.storage.from("event-media").createSignedUrls(paths, 3600);
        const byPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
        const sign = (list: { id: string; path: string }[]) =>
          list.flatMap((p) => {
            const src = byPath.get(p.path);
            return src ? [{ id: p.id, src }] : [];
          });
        latestPhotos = sign(latest);
        newPhotos = sign(fresh);
      }
    } catch {
      // photos are decorative here; the cover falls back to the emoji
    }
  }

  let photoCount = 0;
  if (event && selectedTab === "more") {
    const { count } = await supabase
      .from("media_items")
      .select("*", { count: "exact", head: true })
      .eq("event_id", id)
      .or("mime_type.is.null,mime_type.ilike.image/%");
    photoCount = count ?? 0;
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
        {/* Phones hide the app header on event routes, so this is the way back. */}
        <Link href="/dashboard" style={{ marginTop: 12, minHeight: 44, display: 'inline-flex', alignItems: 'center', fontSize: 15, fontWeight: 700, color: 'var(--app-purple)', textDecoration: 'none' }}>
          {uiCopy.eventShell.yourEvents}
        </Link>
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

  const scheduledDeletionAt =
    typeof (event as { scheduled_deletion_at?: unknown }).scheduled_deletion_at === "string"
      ? (event as { scheduled_deletion_at: string }).scheduled_deletion_at
      : null;

  return (
    <div style={{ padding: '0 0 calc(124px + env(safe-area-inset-bottom, 0px))' }}>
      <EventAdminTabs
        eventId={id}
        selectedTab={selectedTab}
        eventTitle={eventName}
        eventEmoji={navEmoji}
        accessCode={event.access_code}
        mediaCount={mediaCountResult.count ?? 0}
        guestCount={guestCount}
        eventDate={event.event_date ?? null}
        coverPhoto={latestPhotos[0]?.src ?? null}
        bannerTheme={bannerTheme}
        moderationEnabled={moderationEnabled}
        pendingReviewCount={moderationEnabled ? newUploadsCount : 0}
      />

      <div style={{ marginTop: selectedTab === "overview" ? 0 : 18 }}>
        {selectedTab === "overview" && (
          <OverviewTab
            eventId={id}
            eventDate={event.event_date}
            plan={event.plan}
            scheduledDeletionAt={scheduledDeletionAt}
            accessCode={event.access_code}
            isPrimaryOrganizer={isPrimaryOrganizer}
            newUploadsCount={newUploadsCount}
            latestPhotos={latestPhotos}
            newPhotos={newPhotos}
          />
        )}
        {selectedTab === "more" && (
          <MoreTab
            eventId={id}
            accessCode={event.access_code}
            isPrimaryOrganizer={isPrimaryOrganizer}
            plan={event.plan}
            eventDate={event.event_date}
            scheduledDeletionAt={scheduledDeletionAt}
            photoCount={photoCount}
          />
        )}
        {selectedTab === "guests" && <GuestsTab eventId={id} />}
        {selectedTab === "gallery" && (
          <GalleryTab
            eventId={id}
            isPrimaryOrganizer={isPrimaryOrganizer}
            moderationEnabled={moderationEnabled}
            organizerGalleryReviewedAt={organizerGalleryReviewedAt}
          />
        )}
        {selectedTab === "share" && (
          <ShareTab
            eventId={id}
            eventTitle={eventName}
            accessCode={event.access_code}
            publicOrigin={publicOrigin}
          />
        )}
        {selectedTab === "rsvp" && (
          <RsvpTab eventId={id} plan={event.plan} publicOrigin={publicOrigin} />
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
            bannerTheme={bannerTheme}
            moderationEnabled={moderationEnabled}
          />
        )}
      </div>
    </div>
  );
}
