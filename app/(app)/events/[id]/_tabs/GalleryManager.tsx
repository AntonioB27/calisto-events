"use client";

import { UploadZone } from "@/app/join/[accessCode]/_components/UploadZone";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toThumbnailUrl } from "@/lib/supabase-storage-transform";

import { interpolate } from "@/lib/app-ui";
import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { ConfirmDialog } from "@/components/app-ui/ConfirmDialog";
import { MediaLikeBadge } from "@/components/app-ui/MediaLikeBadge";
import { MediaUploaderChip } from "@/components/app-ui/MediaUploaderChip";
import { PhotoLightbox } from "@/components/app-ui/PhotoLightbox";
import { buildMemberLabelMap } from "@/lib/event-member-labels";
import {
  fetchLikeSummaryForMedia,
  fetchLikersForMedia,
  toggleLike,
  type LikerRow,
} from "@/lib/media-likes";
import { canGuestUpload, normalizePlanId, type PlanId } from "@/lib/plan-limits";
import { getCachedUrls, invalidateCachedUrl, storeCachedUrls, warmCache } from "@/lib/signed-url-cache";

type MediaRow = {
  id: string;
  storage_path: string;
  mime_type: string | null;
  created_at: string;
  uploaded_by: string;
};

type MediaItem = MediaRow & { signedUrl?: string; thumbnailUrl?: string; uploaderLabel: string };

type SignedUrlEntry = {
  path: string | null;
  signedUrl: string;
};

type ZipExportRow = {
  id: string;
  status: string;
  include_videos: boolean;
  error_message: string | null;
  expires_at: string | null;
  created_at: string;
};

const PAGE_SIZE = 60;

function isVideoMime(mime: string | null | undefined) {
  return Boolean(mime && mime.startsWith("video/"));
}

const MIME_EXT: Partial<Record<string, string>> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
};

function downloadFilename(item: Pick<MediaRow, "id" | "storage_path" | "mime_type">): string {
  const tail = item.storage_path.split("/").pop()?.trim();
  let name = tail && /\.[a-z0-9]+$/i.test(tail) ? tail : `${tail ?? item.id}.${MIME_EXT[item.mime_type ?? ""] ?? "jpg"}`;
  name = name.replace(/[/\\]/g, "_");
  return name.startsWith(".") ? `photo-${item.id}${name}` : name;
}

async function downloadFromSignedUrl(
  signedUrl: string,
  filename: string,
  badStatusMessage: (status: number) => string,
) {
  const res = await fetch(signedUrl);
  if (!res.ok) throw new Error(badStatusMessage(res.status));
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

type MediaFilterId = "all" | "photos" | "videos";

function mediaFilterSlideIndex(f: MediaFilterId) {
  if (f === "all") return 0;
  if (f === "photos") return 1;
  return 2;
}

/** Sliding thumb `left` — track is `p-0.5` + `gap-0.5` (2px each), three equal segments */
function segmentedHighlightLeft(idx: number) {
  const step = "((100% - 8px) / 3 + 2px)";
  if (idx <= 0) return "2px";
  if (idx === 1) return `calc(2px + ${step})`;
  return `calc(2px + 2 * ${step})`;
}

type MembershipLabellingRow = { user_id: string; display_name_at_event: string | null };
type ProfileLabellingRow = { id: string; display_name: string | null };

export function GalleryManager({
  eventId,
  isPrimaryOrganizer,
}: Readonly<{ eventId: string; isPrimaryOrganizer: boolean }>) {
  const ui = useAppUi();
  const [eventUpload, setEventUpload] = useState<{ planId: PlanId; eventDate: string } | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const [lightboxDownloading, setLightboxDownloading] = useState(false);
  const [lightboxDownloadError, setLightboxDownloadError] = useState<string | null>(null);
  const [eventOrganizerId, setEventOrganizerId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [likeCounts, setLikeCounts] = useState<Map<string, number>>(() => new Map());
  const [likedByMe, setLikedByMe] = useState<Set<string>>(() => new Set());
  const [lightboxLikers, setLightboxLikers] = useState<LikerRow[]>([]);
  const [lightboxLikersLoading, setLightboxLikersLoading] = useState(false);
  const [likeToggleError, setLikeToggleError] = useState<string | null>(null);
  const [pendingLikeId, setPendingLikeId] = useState<string | null>(null);
  const [mediaFilter, setMediaFilter] = useState<MediaFilterId>("all");
  const [pendingDelete, setPendingDelete] = useState<MediaItem | null>(null);
  const [zipExports, setZipExports] = useState<ZipExportRow[]>([]);
  const [zipModalOpen, setZipModalOpen] = useState(false);
  const [zipIncludeVideos, setZipIncludeVideos] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);
  const [zipPanelError, setZipPanelError] = useState<string | null>(null);

  const supabase = useMemo(() => maybeCreateSupabaseBrowserClient(), []);

  const lightboxCopy = useMemo(
    () => ({
      lightboxAria: ui.gallery.lightboxAria,
      closeLightboxAria: ui.gallery.closeLightboxAria,
      heartLikeAria: ui.likes.heartLikeAria,
      heartUnlikeAria: ui.likes.heartUnlikeAria,
      likeCount: (count: number) => interpolate(ui.likes.likeCount, { count }),
      likersHeading: ui.likes.likersHeading,
      likersEmpty: ui.likes.likersEmpty,
      toggleFail: ui.likes.toggleFail,
    }),
    [ui],
  );

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getUser().then((res: { data: { user: { id: string } | null } | null }) => {
      setCurrentUserId(res.data?.user?.id ?? null);
    });
  }, [supabase]);

  const uploadsOpen = useMemo(
    () =>
      eventUpload
        ? canGuestUpload({
            planId: eventUpload.planId,
            eventDate: eventUpload.eventDate,
            now: new Date().toISOString(),
          })
        : false,
    [eventUpload],
  );

  const mediaFilterOpts = useMemo(
    () =>
      [
        { id: "all" as const, label: ui.gallery.filterAll },
        { id: "photos" as const, label: ui.gallery.filterPhotos },
        { id: "videos" as const, label: ui.gallery.filterVideos },
      ] as const,
    [ui.gallery.filterAll, ui.gallery.filterPhotos, ui.gallery.filterVideos],
  );

  useEffect(() => {
    if (!lightbox) {
      setLightboxDownloading(false);
      setLightboxDownloadError(null);
      setLightboxLikers([]);
      setLightboxLikersLoading(false);
      setLikeToggleError(null);
      return;
    }

    if (!supabase || !eventOrganizerId) return;

    let cancelled = false;
    setLightboxLikersLoading(true);
    void fetchLikersForMedia(supabase, lightbox.id, {
      eventId,
      organizerId: eventOrganizerId,
      labelDefaults: { organizer: ui.guests.organizerLabelFallback, guest: ui.guests.guestLabelFallback },
    })
      .then((likers) => {
        if (!cancelled) setLightboxLikers(likers);
      })
      .catch(() => {
        if (!cancelled) setLightboxLikers([]);
      })
      .finally(() => {
        if (!cancelled) setLightboxLikersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    lightbox,
    supabase,
    eventOrganizerId,
    eventId,
    ui.guests.guestLabelFallback,
    ui.guests.organizerLabelFallback,
  ]);

  useEffect(() => {
    if (!supabase || !isPrimaryOrganizer) return;
    let cancelled = false;
    const tick = async () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      const { data, error } = await supabase
        .from("media_zip_exports")
        .select("id, status, include_videos, error_message, expires_at, created_at")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })
        .limit(5);
      if (!cancelled && !error) {
        setZipExports((data ?? []) as ZipExportRow[]);
      }
    };
    void tick();
    const id = window.setInterval(() => void tick(), 4000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [supabase, isPrimaryOrganizer, eventId]);

  const downloadZipExport = useCallback(
    async (jobId: string) => {
      setZipPanelError(null);
      try {
        const res = await fetch(`/api/events/${eventId}/zip-export/${jobId}/sign`, { method: "POST" });
        const body = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !body.url) throw new Error(body.error ?? ui.gallery.zipExportErrorGeneric);
        window.location.href = body.url;
      } catch (e) {
        setZipPanelError(e instanceof Error ? e.message : ui.gallery.zipExportErrorGeneric);
      }
    },
    [eventId, ui.gallery.zipExportErrorGeneric],
  );

  const confirmStartZip = useCallback(async () => {
    setZipBusy(true);
    setZipPanelError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/zip-export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ includeVideos: zipIncludeVideos }),
      });
      const body = (await res.json()) as { error?: string };
      if (res.status === 400 && body.error === "ZIP_TOO_MANY_ITEMS") {
        setZipPanelError(ui.gallery.zipExportErrorTooMany);
      } else if (res.status === 409) {
        setZipPanelError(ui.gallery.zipExportErrorPending);
      } else if (res.status === 500 && body.error === "ZIP_QUEUE_CHECK_FAILED") {
        setZipPanelError(ui.gallery.zipExportErrorQueue);
      } else if (!res.ok) {
        setZipPanelError(body.error ?? ui.gallery.zipExportErrorGeneric);
      } else {
        setZipModalOpen(false);
        if (supabase) {
          const { data } = await supabase
            .from("media_zip_exports")
            .select("id, status, include_videos, error_message, expires_at, created_at")
            .eq("event_id", eventId)
            .order("created_at", { ascending: false })
            .limit(5);
          setZipExports((data ?? []) as ZipExportRow[]);
        }
      }
    } finally {
      setZipBusy(false);
    }
  }, [
    eventId,
    supabase,
    zipIncludeVideos,
    ui.gallery.zipExportErrorGeneric,
    ui.gallery.zipExportErrorPending,
    ui.gallery.zipExportErrorQueue,
    ui.gallery.zipExportErrorTooMany,
  ]);

  const fetchPage = useCallback(
    async (pageIndex: number, replace: boolean) => {
      if (!supabase) return;
      setError(null);
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const [{ data: evRow }, { data: rows, error: fetchErr }] = await Promise.all([
        supabase.from("events").select("organizer_id, plan, event_date").eq("id", eventId).maybeSingle(),
        supabase
          .from("media_items")
          .select("id, storage_path, mime_type, created_at, uploaded_by")
          .eq("event_id", eventId)
          .order("created_at", { ascending: false })
          .range(from, to),
      ]);

      if (fetchErr) {
        setError(ui.gallery.loadFailed);
        setLoading(false);
        return;
      }

      const ev = evRow as { organizer_id?: unknown; plan?: unknown; event_date?: unknown } | null;
      const organizerId = ev && typeof ev.organizer_id === "string" ? ev.organizer_id : null;
      if (organizerId) setEventOrganizerId(organizerId);
      if (ev && typeof ev.plan === "string" && typeof ev.event_date === "string" && ev.event_date) {
        setEventUpload({ planId: normalizePlanId(ev.plan), eventDate: ev.event_date });
      } else {
        setEventUpload(null);
      }

      const typed = (rows ?? []) as MediaRow[];
      const uploaderIds = Array.from(new Set(typed.map((r) => r.uploaded_by).filter(Boolean)));
      const photoIds = typed.filter((r) => !isVideoMime(r.mime_type)).map((r) => r.id);

      // Split paths into already-cached signed URLs and those that still need signing.
      const allPaths = typed.map((r) => r.storage_path);
      const { cached: cachedUrls, missing: missingPaths } = getCachedUrls(allPaths);

      // Parallelise: uploader label lookups ∥ signing only the uncached paths (RT2)
      const [labelResult, signedResult, likeSummary] = await Promise.all([
        uploaderIds.length > 0
          ? Promise.all([
              supabase
                .from("event_memberships")
                .select("user_id, display_name_at_event")
                .eq("event_id", eventId)
                .in("user_id", uploaderIds),
              supabase.from("profiles").select("id, display_name").in("id", uploaderIds),
            ])
          : Promise.resolve(null),
        missingPaths.length > 0
          ? supabase.storage.from("event-media").createSignedUrls(missingPaths, 3600)
          : Promise.resolve({ data: [] as SignedUrlEntry[] }),
        fetchLikeSummaryForMedia(supabase, photoIds, currentUserId),
      ]);

      let labelMap = new Map<string, string>();
      if (labelResult) {
        const [{ data: mems, error: memErr }, { data: profs, error: profErr }] = labelResult;
        labelMap = buildMemberLabelMap(
          uploaderIds,
          organizerId,
          memErr ? null : (mems as MembershipLabellingRow[] | null),
          profErr ? null : (profs as ProfileLabellingRow[] | null),
          { organizer: ui.guests.organizerLabelFallback, guest: ui.guests.guestLabelFallback },
        );
      }

      const freshUrlMap = Object.fromEntries(
        ((signedResult as { data: SignedUrlEntry[] | null }).data ?? []).map((s: SignedUrlEntry) => [s.path, s.signedUrl]),
      );
      if (Object.keys(freshUrlMap).length > 0) {
        storeCachedUrls(eventId, freshUrlMap);
      }
      const urlMap = { ...cachedUrls, ...freshUrlMap };

      const mapped: MediaItem[] = typed.map((r) => ({
        ...r,
        signedUrl: urlMap[r.storage_path],
        thumbnailUrl: urlMap[r.storage_path] ? toThumbnailUrl(urlMap[r.storage_path]) : undefined,
        uploaderLabel:
          labelMap.get(r.uploaded_by) ??
          (organizerId !== null && r.uploaded_by === organizerId
            ? ui.guests.organizerLabelFallback
            : ui.guests.guestLabelFallback),
      }));

      setItems((prev) => (replace ? mapped : [...prev, ...mapped]));
      setLikeCounts((prev) => {
        const next = replace ? new Map<string, number>() : new Map(prev);
        for (const [id, count] of likeSummary.counts) next.set(id, count);
        return next;
      });
      setLikedByMe((prev) => {
        const next = replace ? new Set<string>() : new Set(prev);
        for (const id of likeSummary.likedByMe) next.add(id);
        return next;
      });
      setHasMore(typed.length === PAGE_SIZE);
      setLoading(false);
    },
    [eventId, supabase, currentUserId, ui.gallery.loadFailed, ui.guests.guestLabelFallback, ui.guests.organizerLabelFallback],
  );

  useEffect(() => {
    warmCache(eventId);
  }, [eventId]);

  useEffect(() => {
    if (!supabase) return;
    setLoading(true);
    setPage(0);
    setItems([]);
    void fetchPage(0, true);
  }, [fetchPage, supabase, currentUserId]);

  async function confirmDeletePending() {
    if (!supabase) return;
    const item = pendingDelete;
    if (!item || busyId) return;

    setBusyId(item.id);
    setError(null);

    try {
      const { error: dbError } = await supabase
        .from("media_items")
        .delete()
        .eq("id", item.id)
        .eq("event_id", eventId);
      if (dbError) throw dbError;

      const { error: storageError } = await supabase.storage.from("event-media").remove([item.storage_path]);
      if (storageError) throw storageError;

      invalidateCachedUrl(item.storage_path);
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      setLikeCounts((prev) => {
        const next = new Map(prev);
        next.delete(item.id);
        return next;
      });
      setLikedByMe((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      if (lightbox?.id === item.id) setLightbox(null);
      setPendingDelete(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : ui.gallery.deleteMediaFail);
    } finally {
      setBusyId(null);
    }
  }

  function loadMore() {
    const next = page + 1;
    setPage(next);
    void fetchPage(next, false);
  }

  async function handleToggleLikeForItem(mediaItemId: string) {
    if (!supabase || pendingLikeId) return;

    const wasLiked = likedByMe.has(mediaItemId);
    const prevCount = likeCounts.get(mediaItemId) ?? 0;

    setPendingLikeId(mediaItemId);
    setLikeToggleError(null);
    setLikedByMe((prev) => {
      const next = new Set(prev);
      if (wasLiked) next.delete(mediaItemId);
      else next.add(mediaItemId);
      return next;
    });
    setLikeCounts((prev) => {
      const next = new Map(prev);
      next.set(mediaItemId, Math.max(0, prevCount + (wasLiked ? -1 : 1)));
      return next;
    });

    try {
      await toggleLike(supabase, {
        mediaItemId,
        eventId,
        currentlyLiked: wasLiked,
      });
      if (eventOrganizerId && lightbox?.id === mediaItemId) {
        const likers = await fetchLikersForMedia(supabase, mediaItemId, {
          eventId,
          organizerId: eventOrganizerId,
          labelDefaults: { organizer: ui.guests.organizerLabelFallback, guest: ui.guests.guestLabelFallback },
        });
        setLightboxLikers(likers);
      }
    } catch {
      setLikedByMe((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.add(mediaItemId);
        else next.delete(mediaItemId);
        return next;
      });
      setLikeCounts((prev) => {
        const next = new Map(prev);
        next.set(mediaItemId, prevCount);
        return next;
      });
      setLikeToggleError(ui.likes.toggleFail);
    } finally {
      setPendingLikeId(null);
    }
  }

  const filtered = items.filter(item => {
    if (mediaFilter === 'all') return true;
    if (mediaFilter === 'videos') return isVideoMime(item.mime_type);
    return !isVideoMime(item.mime_type);
  });

  if (!supabase) {
    return (
      <div
        style={{
          marginTop: 12,
          borderRadius: "var(--app-radius-lg)",
          border: "1.5px solid color-mix(in srgb, var(--app-danger) 35%, var(--app-border))",
          background: "color-mix(in srgb, var(--app-danger) 8%, var(--app-surface))",
          padding: 16,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--app-danger)" }}>
          {ui.supabase.missingTitle}
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--app-muted)", lineHeight: 1.55 }}>
          {ui.supabase.galleryBody}
        </p>
      </div>
    );
  }

  return (
    <section>
      <ConfirmDialog
        open={pendingDelete !== null}
        title={ui.gallery.deleteTitle}
        message={ui.gallery.deleteBody}
        confirmLabel={ui.common.delete}
        cancelLabel={ui.common.cancel}
        variant="danger"
        busy={Boolean(pendingDelete && busyId === pendingDelete.id)}
        onConfirm={() => void confirmDeletePending()}
        onCancel={() => {
          if (busyId) return;
          setPendingDelete(null);
        }}
      />
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ width: 32, height: 3, background: 'var(--app-gold)', borderRadius: 2, marginBottom: 10 }} />
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 42, color: 'var(--app-text)' }}>
              {ui.gallery.title}
            </h2>
            <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 15, color: "var(--app-muted)", marginTop: 4 }}>
              {ui.gallery.subtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <div
              role="tablist"
              aria-label={ui.gallery.filterAria}
              className="flex shrink-0 rounded-[14px] p-[3px] shadow-[0_10px_28px_-14px_rgba(0,0,0,0.18)]"
              style={{
                background:
                  "linear-gradient(145deg, color-mix(in srgb, var(--app-gold) 22%, var(--app-border)), color-mix(in srgb, var(--app-border) 55%, var(--app-surface)))",
                boxShadow:
                  "0 0 0 1px color-mix(in srgb, var(--app-gold) 12%, transparent), 0 10px 28px -14px rgba(0,0,0,0.18)",
              }}
            >
              <div
                className="relative flex min-w-0 gap-0.5 rounded-[11px] p-0.5"
                style={{ background: "color-mix(in srgb, var(--app-surface) 96%, var(--app-card))" }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute bottom-0.5 left-0 top-0.5 z-0 rounded-[9px] motion-reduce:transition-none motion-reduce:duration-0"
                  style={{
                    width: "calc((100% - 8px) / 3)",
                    left: segmentedHighlightLeft(mediaFilterSlideIndex(mediaFilter)),
                    transition:
                      "left 400ms cubic-bezier(0.32, 0.76, 0.15, 1), opacity 260ms ease, box-shadow 400ms cubic-bezier(0.32, 0.76, 0.15, 1), transform 400ms cubic-bezier(0.32, 0.76, 0.15, 1)",
                    background:
                      "linear-gradient(152deg, var(--app-gold-2) 0%, var(--app-gold) 55%, color-mix(in srgb, var(--app-gold) 88%, #fff) 100%)",
                    boxShadow:
                      "0 1px 0 color-mix(in srgb, #fff 55%, transparent) inset, 0 2px 14px color-mix(in srgb, var(--app-gold) 34%, transparent)",
                  }}
                />
                {mediaFilterOpts.map((opt) => {
                  const on = mediaFilter === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => setMediaFilter(opt.id)}
                      className={`relative z-10 flex min-w-0 flex-1 items-center justify-center rounded-[9px] border-0 px-2 py-2.5 text-[12px] transition-[color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--app-gold)_55%,transparent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--app-surface)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 sm:min-w-[5.5rem] sm:px-3.5 sm:text-[13px] ${
                        on
                          ? ""
                          : "text-[var(--app-muted)] hover:bg-[color-mix(in_srgb,var(--app-text)_5%,transparent)] hover:text-[var(--app-text)]"
                      } `}
                      style={{
                        cursor: "pointer",
                        fontWeight: on ? 600 : 500,
                        letterSpacing: on ? "-0.01em" : "0.01em",
                        color: on ? "#1b1208" : undefined,
                      }}
                    >
                      <span className="whitespace-nowrap">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <AppBtn variant="ghost" size="sm" type="button" onClick={() => void fetchPage(0, true)}>
              {ui.common.refresh}
            </AppBtn>
          </div>
        </div>
      </div>

      {isPrimaryOrganizer ? (
        <div
          style={{
            marginBottom: 24,
            padding: "16px 18px",
            borderRadius: 16,
            border: "1.5px solid color-mix(in srgb, var(--app-gold) 28%, var(--app-border))",
            background: "color-mix(in srgb, var(--app-gold) 6%, var(--app-surface))",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--app-muted)",
            }}
          >
            {ui.gallery.zipExportCardEyebrow}
          </p>
          <h3
            style={{
              margin: "8px 0 0",
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 22,
              color: "var(--app-text)",
            }}
          >
            {ui.gallery.zipExportTitle}
          </h3>
          <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--app-muted)", lineHeight: 1.55 }}>
            {ui.gallery.zipExportBlurb}
          </p>
          {zipPanelError ? (
            <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--app-danger)" }}>{zipPanelError}</p>
          ) : null}
          {zipExports.length > 0 ? (
            <ul style={{ margin: "14px 0 0", paddingLeft: 18, fontSize: 13, color: "var(--app-text)" }}>
              {zipExports.map((z) => (
                <li key={z.id} style={{ marginBottom: 8 }}>
                  <span style={{ color: "var(--app-muted)" }}>
                    {z.status === "queued"
                      ? ui.gallery.zipExportQueued
                      : z.status === "running"
                        ? ui.gallery.zipExportRunning
                        : z.status === "ready"
                          ? ui.gallery.zipExportReady
                          : z.status === "failed"
                            ? `${ui.gallery.zipExportFailed}${z.error_message ? ` — ${z.error_message}` : ""}`
                            : z.status === "expired"
                              ? ui.gallery.zipExportExpired
                              : z.status}
                  </span>
                  {z.status === "ready" ? (
                    <span style={{ marginLeft: 10 }}>
                      <AppBtn
                        type="button"
                        variant="gold"
                        size="sm"
                        onClick={() => void downloadZipExport(z.id)}
                      >
                        {ui.gallery.zipExportDownload}
                      </AppBtn>
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
          <div style={{ marginTop: 14 }}>
            <AppBtn type="button" variant="gold" size="sm" onClick={() => setZipModalOpen(true)}>
              {ui.gallery.zipExportPrepare}
            </AppBtn>
          </div>
        </div>
      ) : null}

      {zipModalOpen ? (
        <div
          role="alertdialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            background: "rgba(0,0,0,0.55)",
          }}
          onClick={zipBusy ? undefined : () => setZipModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 420,
              borderRadius: 18,
              padding: 22,
              background: "var(--app-surface)",
              border: "1.5px solid var(--app-border)",
              boxShadow: "var(--app-shadow-lg)",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--app-text)" }}>
              {ui.gallery.zipExportModalTitle}
            </h2>
            <p style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.5, color: "var(--app-muted)" }}>
              {ui.gallery.zipExportModalBody}
            </p>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 16,
                fontSize: 14,
                color: "var(--app-text)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={zipIncludeVideos}
                onChange={(e) => setZipIncludeVideos(e.target.checked)}
                disabled={zipBusy}
              />
              <span>{ui.gallery.zipExportIncludeVideos}</span>
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "flex-end", marginTop: 22 }}>
              <AppBtn type="button" variant="ghost" size="sm" disabled={zipBusy} onClick={() => setZipModalOpen(false)}>
                {ui.common.cancel}
              </AppBtn>
              <AppBtn
                type="button"
                variant="gold"
                size="sm"
                disabled={zipBusy}
                loading={zipBusy}
                onClick={() => void confirmStartZip()}
              >
                {ui.gallery.zipExportStart}
              </AppBtn>
            </div>
          </div>
        </div>
      ) : null}

      <div style={{ marginBottom: 28 }}>
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "var(--app-muted)",
          }}
        >
          {ui.guestJoin.sectionUpload}
        </p>
        {!uploadsOpen ? (
          <p
            style={{
              margin: "0 0 14px",
              padding: "12px 14px",
              borderRadius: 12,
              fontSize: 13,
              color: "var(--app-warn)",
              background: "color-mix(in srgb, var(--app-warn) 12%, transparent)",
              border: "1.5px solid color-mix(in srgb, var(--app-warn) 45%, transparent)",
              lineHeight: 1.5,
            }}
          >
            {ui.guestJoin.uploadClosedBanner}
          </p>
        ) : null}
        <UploadZone
          eventId={eventId}
          disabled={!uploadsOpen}
          onUploaded={() => {
            setPage(0);
            void fetchPage(0, true);
          }}
        />
      </div>

      {error ? (
        <p style={{ marginBottom: 16, fontSize: 13, color: "var(--app-danger)" }}>{error}</p>
      ) : null}
      {loading && (
        <p style={{ color: "var(--app-muted)", fontSize: 14 }}>{ui.gallery.loading}</p>
      )}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <span style={{ fontSize: 48, opacity: 0.4 }}>📷</span>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--app-muted)', marginTop: 12 }}>
            {ui.gallery.empty}
          </p>
        </div>
      )}

      {/* Column flow avoids grid “row lanes” — variable heights stack without hollow gaps */}
      {filtered.length > 0 && (
        <div className="columns-3 [column-gap:8px] md:columns-[220px] md:[column-gap:12px]">
          {filtered.map(item => {
            const signedUrl = item.signedUrl;
            const isVideo = isVideoMime(item.mime_type);
            const busy = busyId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => !isVideo && setLightbox(item)}
                className="relative mb-2 break-inside-avoid overflow-hidden rounded-[14px] md:mb-3"
                style={{
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                  cursor: isVideo ? 'default' : 'pointer',
                }}
              >
                {signedUrl ? (
                  isVideo ? (
                    <video
                      src={signedUrl}
                      className="block h-auto w-full max-w-full"
                      controls
                      playsInline
                      muted
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnailUrl ?? signedUrl}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="block h-auto w-full max-w-full"
                      style={{ transition: 'transform 0.3s' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  )
                ) : (
                  <div className="min-h-[160px] w-full bg-[var(--app-border)]" />
                )}
                {!isVideo ? (
                  <div
                    className="absolute right-2 top-2 z-[1]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MediaLikeBadge
                      liked={likedByMe.has(item.id)}
                      count={likeCounts.get(item.id) ?? 0}
                      pending={pendingLikeId === item.id}
                      likeAria={ui.likes.heartLikeAria}
                      unlikeAria={ui.likes.heartUnlikeAria}
                      onToggle={() => void handleToggleLikeForItem(item.id)}
                    />
                  </div>
                ) : null}
                <div
                  className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 from-30% to-transparent px-2 pb-2 pt-6 md:px-3.5 md:pb-3 md:pt-7"
                >
                  <MediaUploaderChip
                    label={item.uploaderLabel}
                    isMine={Boolean(currentUserId && item.uploaded_by === currentUserId)}
                    mineAria={ui.gallery.uploadedByYouAria}
                  />
                  <button
                    type="button"
                    disabled={busyId !== null}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPendingDelete(item);
                    }}
                    className="shrink-0 rounded-full border-0 bg-black/50 px-2 py-1 text-[10px] font-semibold text-white md:px-2.5 md:text-[11px]"
                    style={{
                      cursor: busy ? 'not-allowed' : 'pointer',
                      opacity: busy ? 0.5 : 1,
                    }}
                  >
                    {busy ? ui.gallery.deleteBusy : ui.common.delete}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore ? (
        <AppBtn variant="outline" type="button" className="mt-4 w-full" onClick={loadMore}>
          {ui.gallery.loadMore}
        </AppBtn>
      ) : null}

      {lightbox ? (
        <PhotoLightbox
          signedUrl={lightbox.signedUrl}
          likeCount={likeCounts.get(lightbox.id) ?? 0}
          likedByMe={likedByMe.has(lightbox.id)}
          canViewLikers
          likers={lightboxLikers}
          likersLoading={lightboxLikersLoading}
          togglePending={pendingLikeId === lightbox.id}
          toggleError={likeToggleError}
          secondaryError={lightboxDownloadError}
          copy={lightboxCopy}
          uploaderLabel={lightbox.uploaderLabel}
          isMineUpload={Boolean(currentUserId && lightbox.uploaded_by === currentUserId)}
          uploadedByYouAria={ui.gallery.uploadedByYouAria}
          onClose={() => setLightbox(null)}
          onToggleLike={() => void handleToggleLikeForItem(lightbox.id)}
          footerActions={
            <button
              type="button"
              aria-label={ui.gallery.downloadPhotoAria}
              disabled={lightboxDownloading || !lightbox.signedUrl}
              onClick={(e) => {
                e.stopPropagation();
                const url = lightbox.signedUrl;
                if (!url || lightboxDownloading) return;
                void (async () => {
                  setLightboxDownloading(true);
                  setLightboxDownloadError(null);
                  try {
                    await downloadFromSignedUrl(url, downloadFilename(lightbox), (status) =>
                      interpolate(ui.gallery.downloadFailedWithStatus, { status }),
                    );
                  } catch (err) {
                    setLightboxDownloadError(err instanceof Error ? err.message : ui.gallery.downloadPhotoFail);
                  } finally {
                    setLightboxDownloading(false);
                  }
                })();
              }}
              style={{
                flexShrink: 0,
                padding: "8px 18px",
                borderRadius: 20,
                border: "none",
                cursor: lightboxDownloading ? "wait" : "pointer",
                opacity: lightboxDownloading ? 0.7 : 1,
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.02em",
                color: "#1b1208",
                background:
                  "linear-gradient(152deg, var(--app-gold-2) 0%, var(--app-gold) 55%, color-mix(in srgb, var(--app-gold) 88%, #fff) 100%)",
                boxShadow:
                  "0 1px 0 color-mix(in srgb, #fff 55%, transparent) inset, 0 2px 14px color-mix(in srgb, var(--app-gold) 38%, transparent)",
              }}
            >
              {lightboxDownloading ? ui.gallery.downloadWorking : ui.gallery.downloadBtn}
            </button>
          }
        />
      ) : null}
    </section>
  );
}

