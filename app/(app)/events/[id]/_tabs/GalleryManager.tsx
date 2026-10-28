"use client";

import { UploadZone } from "@/app/join/[accessCode]/_components/UploadZone";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";

import { interpolate } from "@/lib/app-ui";
import { plural } from "@/lib/app-ui/plural";
import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn, appButtonClassNames } from "@/components/app-ui/AppBtn";
import { Aurora } from "@/components/app-ui/Aurora";
import { AuroraHourglass } from "@/components/app-ui/AuroraHourglass";
import { ConfirmDialog } from "@/components/app-ui/ConfirmDialog";
import { FilterChips, type FilterChip } from "@/components/app-ui/FilterChips";
import { MediaLikeBadge } from "@/components/app-ui/MediaLikeBadge";
import { PhotoLightbox } from "@/components/app-ui/PhotoLightbox";
import { Switch } from "@/components/app-ui/Switch";
import { TabHeader } from "@/components/app-ui/TabHeader";
import { AlbumReview } from "./AlbumReview";
import "./album.css";
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
  thumbnail_path: string | null;
  mime_type: string | null;
  created_at: string;
  uploaded_by: string;
  moderation_status: string;
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

function uploaderColor(seed: string): string {
  const palette = ["#a37118", "#5b2d8e", "#8b6a8c", "#8a5f12", "#6f5c47"];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % palette.length;
  return palette[h];
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

const GRID_SIZES = [2, 3, 4] as const;

function formatDuration(seconds: number): string {
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** Video tile: first frame plus a play badge with the length once the metadata arrives. */
function VideoTile({ src, poster }: Readonly<{ src: string; poster?: string }>) {
  const [duration, setDuration] = useState<number | null>(null);
  return (
    <>
      <video
        src={src}
        poster={poster}
        preload="metadata"
        muted
        playsInline
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        style={{ display: "block", width: "100%", height: "auto" }}
      />
      <span className="org-album-badge">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M7 4v16l13-8z" />
        </svg>
        {duration !== null && Number.isFinite(duration) ? formatDuration(duration) : null}
      </span>
    </>
  );
}

type MembershipLabellingRow = { user_id: string; display_name_at_event: string | null };
type ProfileLabellingRow = { id: string; display_name: string | null };

export function GalleryManager({
  eventId,
  isPrimaryOrganizer,
  moderationEnabled,
  organizerGalleryReviewedAt,
}: Readonly<{
  eventId: string;
  isPrimaryOrganizer: boolean;
  moderationEnabled: boolean;
  organizerGalleryReviewedAt: string | null;
}>) {
  const ui = useAppUi();
  const [eventUpload, setEventUpload] = useState<{ planId: PlanId; eventDate: string } | null>(null);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const [advanceAfterLoad, setAdvanceAfterLoad] = useState(false);
  const [lightboxDownloading, setLightboxDownloading] = useState(false);
  // Download or delete failure, shown inside the full-screen view.
  const [lightboxError, setLightboxError] = useState<string | null>(null);
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
  // ?export=zip (from More / event home "Download all") opens the export dialog straight away.
  const exportRequested = useSearchParams().get("export") === "zip";
  const [zipModalOpen, setZipModalOpen] = useState(() => isPrimaryOrganizer && exportRequested);
  const [zipIncludeVideos, setZipIncludeVideos] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);
  const [zipPanelError, setZipPanelError] = useState<string | null>(null);
  const [columns, setColumns] = useState<(typeof GRID_SIZES)[number]>(3);
  const [loadingMore, setLoadingMore] = useState(false);
  // Exact album counts (header sentence and chips); null until loaded or if the count queries fail.
  const [totals, setTotals] = useState<{ all: number; videos: number; guests: number | null } | null>(null);
  const addZoneRef = useRef<HTMLDivElement>(null);
  const [pendingItems, setPendingItems] = useState<MediaItem[]>([]);
  const [moderationBusy, setModerationBusy] = useState<string | null>(null);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [newCount, setNewCount] = useState(0);
  const [view, setView] = useState<"all" | "new" | null>(null);
  const [reviewedCount, setReviewedCount] = useState(0);

  const supabase = useMemo(() => maybeCreateSupabaseBrowserClient(), []);

  const lightboxCopy = useMemo(
    () => ({
      lightboxAria: ui.gallery.lightboxAria,
      closeLightboxAria: ui.gallery.closeLightboxAria,
      prevPhotoAria: ui.gallery.prevPhotoAria,
      nextPhotoAria: ui.gallery.nextPhotoAria,
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

  useEffect(() => {
    if (!lightbox) {
      setLightboxDownloading(false);
      setLightboxError(null);
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

  useEffect(() => {
    if (!isPrimaryOrganizer) return;
    void fetch(`/api/events/${eventId}/moderation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "mark_reviewed" }),
    }).catch(() => {
      // Non-critical — ignore silently.
    });
  }, [eventId, isPrimaryOrganizer]);

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

      // ── Round-trip 1 ────────────────────────────────────────────────────────
      // Two Postgres queries run in parallel (~50–150 ms on a good connection).
      //
      // SLOW POINT — minor: the `events` row is fetched on every page load,
      // including page 2, 3, … even though organizer_id/plan/event_date never
      // change during a session. Caching this in a ref after the first fetch
      // would save one Postgres query per "Load more" click.
      const [{ data: evRow }, { data: rows, error: fetchErr }, counts] = await Promise.all([
        supabase.from("events").select("organizer_id, plan, event_date").eq("id", eventId).maybeSingle(),
        supabase
          .from("media_items")
          .select("id, storage_path, thumbnail_path, mime_type, created_at, uploaded_by, moderation_status")
          .eq("event_id", eventId)
          .order("created_at", { ascending: false })
          .range(from, to),
        // Guests counted as members, the same number the events list shows.
        replace
          ? Promise.all([
              supabase.from("media_items").select("id", { count: "exact", head: true }).eq("event_id", eventId),
              supabase
                .from("media_items")
                .select("id", { count: "exact", head: true })
                .eq("event_id", eventId)
                .like("mime_type", "video/%"),
              supabase.from("event_memberships").select("user_id", { count: "exact", head: true }).eq("event_id", eventId),
            ])
          : Promise.resolve(null),
      ]);

      if (fetchErr) {
        setError(ui.gallery.loadFailed);
        setLoading(false);
        return;
      }

      if (counts) {
        const [all, videos, guests] = counts;
        setTotals(
          typeof all.count === "number" && typeof videos.count === "number"
            ? { all: all.count, videos: videos.count, guests: guests.count ?? null }
            : null,
        );
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
      const thumbnailPaths = typed
        .map((r) => r.thumbnail_path)
        .filter((p): p is string => Boolean(p));
      const allPaths = Array.from(new Set([
        ...typed.map((r) => r.storage_path),
        ...thumbnailPaths,
      ]));
      const { cached: cachedUrls, missing: missingPaths } = getCachedUrls(allPaths);

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
        thumbnailUrl: r.thumbnail_path ? urlMap[r.thumbnail_path] : undefined,
        uploaderLabel:
          labelMap.get(r.uploaded_by) ??
          (organizerId !== null && r.uploaded_by === organizerId
            ? ui.guests.organizerLabelFallback
            : ui.guests.guestLabelFallback),
      }));

      setItems((prev) => (replace ? mapped : [...prev, ...mapped]));

      if (isPrimaryOrganizer) {
        const reviewedAt = organizerGalleryReviewedAt ? new Date(organizerGalleryReviewedAt).getTime() : 0;
        const newItems = mapped.filter((m) => new Date(m.created_at).getTime() > reviewedAt);
        if (replace) setNewCount(newItems.length);
      }

      if (isPrimaryOrganizer && moderationEnabled) {
        const pending = mapped.filter((m) => m.moderation_status === "pending");
        if (replace) setPendingItems(pending);
        else setPendingItems((prev) => [...prev, ...pending]);
      }

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
    [eventId, supabase, currentUserId, isPrimaryOrganizer, moderationEnabled, organizerGalleryReviewedAt, ui.gallery.loadFailed, ui.guests.guestLabelFallback, ui.guests.organizerLabelFallback],
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

      const pathsToDelete = [item.storage_path, item.thumbnail_path].filter(
        (p): p is string => Boolean(p),
      );
      const { error: storageError } = await supabase.storage.from("event-media").remove(pathsToDelete);
      if (storageError) throw storageError;

      pathsToDelete.forEach(invalidateCachedUrl);
      forgetItem(item);
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
      const message = e instanceof Error ? e.message : ui.gallery.deleteMediaFail;
      setError(message);
      setLightboxError(message);
      setPendingDelete(null);
    } finally {
      setBusyId(null);
    }
  }

  /** Drop a deleted or discarded item from the grid and the counts. */
  function forgetItem(item: MediaItem) {
    setItems((prev) => prev.filter((x) => x.id !== item.id));
    setTotals((t) => t && { ...t, all: t.all - 1, videos: t.videos - (isVideoMime(item.mime_type) ? 1 : 0) });
  }

  function reload() {
    setPage(0);
    void fetchPage(0, true);
  }

  function loadMore() {
    if (loadingMore) return;
    const next = page + 1;
    setPage(next);
    setLoadingMore(true);
    void fetchPage(next, false).finally(() => setLoadingMore(false));
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

  const lightboxIndex = lightbox ? filtered.findIndex((i) => i.id === lightbox.id) : -1;

  function goToPrev() {
    if (lightboxIndex > 0) setLightbox(filtered[lightboxIndex - 1]);
  }

  function goToNext() {
    if (lightboxIndex < 0) return;
    if (lightboxIndex < filtered.length - 1) {
      setLightbox(filtered[lightboxIndex + 1]);
    } else if (hasMore) {
      // At the end of what's loaded — pull the next page, then advance once it lands.
      setAdvanceAfterLoad(true);
      loadMore();
    }
  }

  // When a page requested from the lightbox arrives, step onto the next photo.
  useEffect(() => {
    if (!advanceAfterLoad || !lightbox) return;
    const idx = filtered.findIndex((i) => i.id === lightbox.id);
    if (idx !== -1 && idx < filtered.length - 1) {
      setLightbox(filtered[idx + 1]);
      setAdvanceAfterLoad(false);
    } else if (!hasMore) {
      // Nothing more will load — give up waiting.
      setAdvanceAfterLoad(false);
    }
  }, [advanceAfterLoad, filtered, lightbox, hasMore]);

  // Header avatar stack: the newest uploaders (up to 4), then a "+N" bubble.
  const uniqueUploaderEntries = useMemo(() => {
    const seen = new Map<string, string>();
    for (const item of items) {
      if (!seen.has(item.uploaded_by)) seen.set(item.uploaded_by, item.uploaderLabel);
      if (seen.size >= 4) break;
    }
    return [...seen.entries()];
  }, [items]);
  const totalGuests = useMemo(() => new Set(items.map((i) => i.uploaded_by)).size, [items]);

  async function handleApproveItem(id: string) {
    setModerationBusy(`keep:${id}`);
    setModerationError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/moderation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", mediaItemId: id }),
      });
      if (!res.ok) throw new Error();
      setPendingItems((prev) => prev.filter((p) => p.id !== id));
      setReviewedCount((c) => c + 1);
      setView("new");
      setPage(0);
      void fetchPage(0, true);
    } catch {
      setModerationError(ui.gallery.moderationActionFail);
    } finally {
      setModerationBusy(null);
    }
  }

  async function handleDiscardItem(id: string) {
    setModerationBusy(`hide:${id}`);
    setModerationError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/moderation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "discard", mediaItemId: id }),
      });
      if (!res.ok) throw new Error();
      const discarded = pendingItems.find((p) => p.id === id);
      if (discarded) forgetItem(discarded);
      setPendingItems((prev) => prev.filter((p) => p.id !== id));
      setReviewedCount((c) => c + 1);
      setView("new");
    } catch {
      setModerationError(ui.gallery.moderationActionFail);
    } finally {
      setModerationBusy(null);
    }
  }

  async function handleApproveAll() {
    setModerationBusy("__all__");
    setModerationError(null);
    try {
      const res = await fetch(`/api/events/${eventId}/moderation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_all" }),
      });
      if (!res.ok) throw new Error();
      setReviewedCount((c) => c + pendingItems.length);
      setPendingItems([]);
      setView("new");
      setPage(0);
      void fetchPage(0, true);
    } catch {
      setModerationError(ui.gallery.moderationActionFail);
    } finally {
      setModerationBusy(null);
    }
  }

  const reviewEnabled = isPrimaryOrganizer && moderationEnabled;
  // Open on "New" while something waits for review; an explicit choice (or a review action) sticks.
  const activeView = reviewEnabled ? (view ?? (pendingItems.length > 0 ? "new" : "all")) : "all";

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

  const total = totals?.all ?? items.length;
  const videoTotal = totals?.videos ?? items.filter((i) => isVideoMime(i.mime_type)).length;
  // Without exact counts, the chips say "60+" while more pages exist.
  const more = !totals && hasMore ? "+" : "";
  const guestTotal = totals?.guests ?? totalGuests;
  const showNewChip = reviewEnabled && (pendingItems.length > 0 || activeView === "new");
  const chips: FilterChip<MediaFilterId | "new">[] = [
    { id: "all", label: `${ui.gallery.filterAll} ${total}${more}` },
    ...(showNewChip ? [{ id: "new" as const, label: `${ui.albumReview.newTab} ${pendingItems.length}`, dot: true }] : []),
    { id: "photos", label: `${ui.gallery.filterPhotos} ${total - videoTotal}${more}` },
    { id: "videos", label: `${ui.gallery.filterVideos} ${videoTotal}${more}` },
  ];

  // The header's UploadZone owns the one upload queue; the add tile opens its file picker.
  const openPicker = () => addZoneRef.current?.querySelector<HTMLInputElement>('input[type="file"]')?.click();

  // Round-robin into columns so the newest stay in the top row (same as the guest album); the add tile goes first.
  const buckets: (MediaItem | null)[][] = Array.from({ length: columns }, () => []);
  [null, ...filtered].forEach((cell, i) => buckets[i % columns].push(cell));

  const avatarStyle: React.CSSProperties = {
    width: 30,
    height: 30,
    borderRadius: 99,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    position: "relative",
    border: "2px solid var(--app-bg)",
    fontSize: 12,
    fontWeight: 700,
    color: "#fff",
  };

  const renderMedia = (item: MediaItem) => {
    if (!item.signedUrl) return <span style={{ display: "block", minHeight: 80 }} />;
    if (isVideoMime(item.mime_type)) return <VideoTile src={item.signedUrl} poster={item.thumbnailUrl} />;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.thumbnailUrl ?? item.signedUrl}
        alt=""
        loading="lazy"
        decoding="async"
        style={{ display: "block", width: "100%", height: "auto" }}
      />
    );
  };

  return (
    <section style={{ paddingBottom: 110 }}>
      {/* Portaled so it sits above the full-screen view, which also lives on <body>. */}
      {pendingDelete
        ? createPortal(
            <ConfirmDialog
              open
              title={ui.gallery.deleteTitle}
              message={ui.gallery.deleteBody}
              confirmLabel={ui.common.delete}
              cancelLabel={ui.common.cancel}
              variant="danger"
              busy={busyId === pendingDelete.id}
              onConfirm={() => void confirmDeletePending()}
              onCancel={() => {
                if (busyId) return;
                setPendingDelete(null);
              }}
            />,
            document.body,
          )
        : null}

      {/* ── HEADER ── */}
      <TabHeader
        title={ui.aurora.navAlbum}
        actions={
          <div ref={addZoneRef} className="org-album-add" data-disabled={uploadsOpen ? undefined : ""}>
            <span aria-hidden className={appButtonClassNames({ variant: "gold", className: "org-album-add__btn" })}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
              {ui.albumReview.add}
            </span>
            <UploadZone eventId={eventId} disabled={!uploadsOpen} ghost label={ui.guestJoin.addPhotos} onUploaded={reload} />
          </div>
        }
      >
        {loading ? null : (
          <span style={{ display: "inline-flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            {uniqueUploaderEntries.length > 0 ? (
              <span aria-hidden style={{ display: "inline-flex" }}>
                {uniqueUploaderEntries.map(([userId, label], i) => (
                  <span
                    key={userId}
                    title={label}
                    style={{ ...avatarStyle, background: uploaderColor(userId), marginLeft: i ? -9 : 0, zIndex: 5 - i }}
                  >
                    {label[0]?.toUpperCase()}
                  </span>
                ))}
                {totalGuests > 4 ? (
                  <span style={{ ...avatarStyle, background: "#6f5c47", marginLeft: -9 }}>+{totalGuests - 4}</span>
                ) : null}
              </span>
            ) : null}
            <span>
              {total > 0 ? (
                <>
                  <b>{plural(ui.locale, total, ui.eventsList.memories)}</b>
                  {guestTotal > 0 ? ` ${plural(ui.locale, guestTotal, ui.eventsList.fromGuests)}` : null}
                </>
              ) : (
                ui.eventsList.noMemories
              )}
            </span>
          </span>
        )}
      </TabHeader>

      <div style={{ marginTop: 16 }}>
        <FilterChips
          chips={chips}
          value={activeView === "new" ? "new" : mediaFilter}
          ariaLabel={ui.albumReview.viewAria}
          onChange={(id) => {
            if (id === "new") {
              setView("new");
            } else {
              setView("all");
              setMediaFilter(id);
            }
          }}
        />
      </div>

      {/* ── ZIP MODAL ── */}
      {zipModalOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="zip-export-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            background: "rgba(34,21,9,0.5)",
            backdropFilter: "blur(4px)",
          }}
          onClick={zipBusy ? undefined : () => setZipModalOpen(false)}
        >
          <div className="org-album-sheet" onClick={(e) => e.stopPropagation()}>
            <h2
              id="zip-export-title"
              style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 26, lineHeight: 1.1, color: "var(--app-text)" }}
            >
              {ui.gallery.zipExportModalTitle}
            </h2>
            <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.5, color: "var(--app-text-sub)" }}>
              {ui.gallery.zipExportModalBody}
            </p>
            {zipExports.length > 0 ? (
              <ul className="warm-list" style={{ marginTop: 14 }}>
                {zipExports.map((z) => (
                  <li key={z.id} style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 52, padding: "6px 8px 6px 14px", fontSize: 14 }}>
                    <span
                      aria-hidden
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: z.status === "ready" ? "var(--app-success)" : z.status === "failed" ? "var(--app-danger)" : "var(--app-gold)",
                      }}
                    />
                    <span style={{ flex: 1, minWidth: 0, color: "var(--app-text-sub)" }}>
                      {z.status === "queued"
                        ? ui.gallery.zipExportQueued
                        : z.status === "running"
                          ? ui.gallery.zipExportRunning
                          : z.status === "ready"
                            ? ui.gallery.zipExportReady
                            : z.status === "failed"
                              ? `${ui.gallery.zipExportFailed}${z.error_message ? `: ${z.error_message}` : ""}`
                              : z.status === "expired"
                                ? ui.gallery.zipExportExpired
                                : z.status}
                    </span>
                    {z.status === "ready" ? (
                      <AppBtn
                        type="button"
                        variant="gold"
                        size="sm"
                        style={{ minHeight: 44, borderRadius: 12 }}
                        onClick={() => void downloadZipExport(z.id)}
                      >
                        {ui.gallery.zipExportDownload}
                      </AppBtn>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
            {zipPanelError ? (
              <p role="alert" style={{ margin: "10px 0 0", fontSize: 13, color: "var(--app-danger)" }}>
                {zipPanelError}
              </p>
            ) : null}
            <div style={{ marginTop: 12 }}>
              <Switch
                checked={zipIncludeVideos}
                onChange={setZipIncludeVideos}
                label={ui.gallery.zipExportIncludeVideos}
                disabled={zipBusy}
              />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
              <AppBtn type="button" variant="ghost" size="sm" style={{ minHeight: 44 }} disabled={zipBusy} onClick={() => setZipModalOpen(false)}>
                {ui.common.cancel}
              </AppBtn>
              <AppBtn
                type="button"
                variant="gold"
                size="sm"
                style={{ minHeight: 44, padding: "0 18px", borderRadius: 12 }}
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

      {error ? (
        <p role="alert" style={{ margin: "12px 4px 0", fontSize: 13, color: "var(--app-danger)" }}>
          {error}
        </p>
      ) : null}

      {activeView === "new" ? (
        loading ? (
          <AuroraHourglass size={80} caption={ui.gallery.loading} style={{ padding: "20px 0" }} />
        ) : (
          <div style={{ marginTop: 18 }}>
            <AlbumReview
              current={pendingItems[0]}
              next={pendingItems[1]}
              position={reviewedCount + 1}
              total={reviewedCount + pendingItems.length}
              busyId={moderationBusy}
              error={moderationError}
              onKeep={(id) => void handleApproveItem(id)}
              onHide={(id) => void handleDiscardItem(id)}
              onApproveAll={() => void handleApproveAll()}
              onSeeAll={() => setView("all")}
            />
          </div>
        )
      ) : (
        <>
          {/* ── TOOLBAR ── */}
          <div className="org-album-toolbar">
            <span className="org-album-toolbar__sort">
              {ui.guestFlow.newestFirst}
              {isPrimaryOrganizer && newCount > 0 && !showNewChip ? (
                <span className="org-album-new">{interpolate(ui.gallery.moderationNewBadge, { count: newCount })}</span>
              ) : null}
            </span>
            <div className="org-album-toolbar__actions">
              {isPrimaryOrganizer ? (
                <button type="button" className="org-album-tool" aria-label={ui.gallery.zipExportPrepare} onClick={() => setZipModalOpen(true)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  ZIP
                </button>
              ) : null}
              <button
                type="button"
                className="org-album-tool"
                aria-label={interpolate(ui.albumReview.gridSizeAria, { count: columns })}
                onClick={() => setColumns(GRID_SIZES[(GRID_SIZES.indexOf(columns) + 1) % GRID_SIZES.length])}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  {Array.from({ length: columns }, (_, i) => {
                    const w = (16 - (columns - 1) * 1.5) / columns;
                    return <rect key={i} x={4 + i * (w + 1.5)} y="4" width={w} height="16" rx="1.2" stroke="currentColor" strokeWidth="1.8" />;
                  })}
                </svg>
                {columns}
              </button>
              <button type="button" className="org-album-tool org-album-tool--icon" aria-label={ui.common.refresh} title={ui.common.refresh} onClick={reload}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {loading ? (
            <AuroraHourglass size={80} caption={ui.gallery.loading} style={{ padding: "20px 0" }} />
          ) : (
            <>
              {filtered.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 16px 22px", textAlign: "center" }}>
                  <Aurora pose="gallery" size={110} style={{ marginBottom: 12 }} />
                  <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 19, color: "var(--app-text)", margin: 0 }}>
                    {ui.gallery.empty}
                  </p>
                </div>
              ) : null}

              {/* ── PHOTO GRID ── */}
              <div className="org-album-grid">
                {buckets.map((cells, c) => (
                  <div key={c} className="org-album-col">
                    {cells.map((item) =>
                      item === null ? (
                        <button key="add" type="button" className="org-album-addtile" disabled={!uploadsOpen} onClick={openPicker}>
                          {uploadsOpen ? (
                            <>
                              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path
                                  d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.6l1.2-1.8A1.5 1.5 0 0 1 10.55 3.5h2.9a1.5 1.5 0 0 1 1.25.7L15.9 6h1.6A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinejoin="round"
                                />
                                <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.8" />
                              </svg>
                              {ui.gallery.addMemory}
                            </>
                          ) : (
                            ui.guestJoin.uploadClosedBanner
                          )}
                        </button>
                      ) : (
                        <div key={item.id} className="org-album-tile">
                          <button
                            type="button"
                            className="org-album-tile__open"
                            aria-label={`${ui.gallery.openPhotoAria}. ${interpolate(ui.aurora.fromGuest, { name: item.uploaderLabel })}`}
                            onClick={() => setLightbox(item)}
                          >
                            {renderMedia(item)}
                          </button>
                          {/* Hearts only once a photo has likes (or you liked it). */}
                          {!isVideoMime(item.mime_type) && ((likeCounts.get(item.id) ?? 0) > 0 || likedByMe.has(item.id)) ? (
                            <div style={{ position: "absolute", right: 5, bottom: 5, zIndex: 1 }}>
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
                        </div>
                      ),
                    )}
                  </div>
                ))}
              </div>

              {/* ── LOAD MORE ── */}
              {hasMore ? (
                <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
                  <button type="button" className="guest-load-more" onClick={loadMore} disabled={loadingMore} aria-busy={loadingMore}>
                    {loadingMore ? (
                      <span className="guest-load-more__spinner" aria-hidden />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {loadingMore ? ui.common.loading : ui.gallery.loadMore}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </>
      )}

      {/* ── LIGHTBOX ── */}
      {lightbox ? (
        <PhotoLightbox
          signedUrl={lightbox.signedUrl}
          mimeType={lightbox.mime_type}
          likeCount={likeCounts.get(lightbox.id) ?? 0}
          likedByMe={likedByMe.has(lightbox.id)}
          canViewLikers
          likers={lightboxLikers}
          likersLoading={lightboxLikersLoading}
          togglePending={pendingLikeId === lightbox.id}
          toggleError={likeToggleError}
          secondaryError={lightboxError}
          copy={lightboxCopy}
          uploaderLabel={lightbox.uploaderLabel}
          isMineUpload={Boolean(currentUserId && lightbox.uploaded_by === currentUserId)}
          uploadedByYouAria={ui.gallery.uploadedByYouAria}
          onClose={() => setLightbox(null)}
          onToggleLike={() => void handleToggleLikeForItem(lightbox.id)}
          hasPrev={lightboxIndex > 0}
          hasNext={lightboxIndex >= 0 && (lightboxIndex < filtered.length - 1 || hasMore)}
          onPrev={goToPrev}
          onNext={goToNext}
          onDelete={() => setPendingDelete(lightbox)}
          deleteLabel={ui.common.delete}
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
                  setLightboxError(null);
                  try {
                    await downloadFromSignedUrl(url, downloadFilename(lightbox), (status) =>
                      interpolate(ui.gallery.downloadFailedWithStatus, { status }),
                    );
                  } catch (err) {
                    setLightboxError(err instanceof Error ? err.message : ui.gallery.downloadPhotoFail);
                  } finally {
                    setLightboxDownloading(false);
                  }
                })();
              }}
              style={{
                flexShrink: 0,
                minHeight: 44,
                padding: "0 18px",
                borderRadius: 22,
                border: "none",
                cursor: lightboxDownloading ? "wait" : "pointer",
                opacity: lightboxDownloading ? 0.7 : 1,
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 700,
                color: "#1b1208",
                background: "linear-gradient(135deg, #f5c76b, #f0b34b 55%, #c9912e)",
                boxShadow: "0 8px 18px -8px rgba(150,100,20,0.6), inset 0 1px 0 rgba(255,244,214,0.85)",
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
