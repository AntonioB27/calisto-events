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

const PAGE_SIZE = 24;

function isVideoMime(mime: string | null | undefined) {
  return Boolean(mime && mime.startsWith("video/"));
}

function uploaderColor(seed: string): string {
  const palette = [
    "linear-gradient(135deg, #8B4FD8, #5B2D8E)",
    "linear-gradient(135deg, #D4A843, #A67620)",
    "linear-gradient(135deg, #E08585, #B04A4A)",
    "linear-gradient(135deg, #5BA8D9, #2A6FB0)",
    "linear-gradient(135deg, #6BBE8E, #2E8050)",
  ];
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

      // ── Round-trip 1 ────────────────────────────────────────────────────────
      // Two Postgres queries run in parallel (~50–150 ms on a good connection).
      //
      // SLOW POINT — minor: the `events` row is fetched on every page load,
      // including page 2, 3, … even though organizer_id/plan/event_date never
      // change during a session. Caching this in a ref after the first fetch
      // would save one Postgres query per "Load more" click.
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

      const allPaths = typed.map((r) => r.storage_path);
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

  // Derived for the editorial header: unique uploaders (up to 5) + total counts
  const uniqueUploaderEntries = useMemo(() => {
    const seen = new Map<string, string>();
    for (const item of items) {
      if (!seen.has(item.uploaded_by)) seen.set(item.uploaded_by, item.uploaderLabel);
      if (seen.size >= 5) break;
    }
    return [...seen.entries()];
  }, [items]);
  const totalGuests = useMemo(() => new Set(items.map((i) => i.uploaded_by)).size, [items]);

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

      {/* ── HEADER — Editorial V1 ── */}
      <div style={{ marginBottom: 22 }}>
        {/* Title row + Aurora */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(197,146,42,0.75)" }}>
              {ui.gallery.title}
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 32,
                color: "var(--app-text)",
                lineHeight: 1.05,
                margin: "0 0 12px",
                letterSpacing: "-0.01em",
              }}
            >
              {ui.gallery.subtitle}
            </h2>

            {/* Stacked guest avatars + counts */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {uniqueUploaderEntries.map(([userId, label], i) => (
                  <div
                    key={userId}
                    title={label}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: uploaderColor(userId),
                      marginLeft: i === 0 ? 0 : -7,
                      border: "1.5px solid var(--app-bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      color: "#fff",
                      zIndex: 5 - i,
                      position: "relative",
                      flexShrink: 0,
                    }}
                  >
                    {label[0]?.toUpperCase()}
                  </div>
                ))}
                {totalGuests > 5 ? (
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.08)",
                      marginLeft: -7,
                      border: "1.5px solid var(--app-bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      color: "var(--app-muted)",
                      position: "relative",
                    }}
                  >
                    +{totalGuests - 5}
                  </div>
                ) : null}
              </div>
              {items.length > 0 ? (
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontSize: 11,
                    color: "var(--app-muted)",
                  }}
                >
                  {interpolate(ui.gallery.memoriesCount, { count: items.length })}
                  {totalGuests > 0 ? ` · ${interpolate(ui.gallery.guestsCount, { count: totalGuests })}` : ""}
                </span>
              ) : null}
            </div>
          </div>

          {/* Aurora camera mascot with gold halo */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: -10,
                background: "radial-gradient(circle, rgba(197,146,42,0.28), transparent 70%)",
                filter: "blur(10px)",
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/mascot/aurora_camera.png"
              alt=""
              aria-hidden
              style={{
                width: 72,
                height: 72,
                objectFit: "contain",
                position: "relative",
                zIndex: 1,
                filter: "drop-shadow(0 6px 18px rgba(197,146,42,0.22))",
              }}
            />
          </div>
        </div>

        {/* Filter tabs + refresh */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18 }}>
          <div
            role="tablist"
            aria-label={ui.gallery.filterAria}
            style={{
              flex: 1,
              display: "flex",
              gap: 4,
              padding: 3,
              background: "var(--app-surface-2)",
              borderRadius: 12,
              border: "1px solid var(--app-border)",
            }}
          >
            {mediaFilterOpts.map((opt) => {
              const on = mediaFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setMediaFilter(opt.id)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    border: "none",
                    borderRadius: 10,
                    background: on ? "var(--app-surface)" : "transparent",
                    color: on ? "var(--app-text)" : "var(--app-muted)",
                    fontSize: 12,
                    fontWeight: on ? 600 : 500,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "all 0.18s",
                    boxShadow: on ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <AppBtn variant="ghost" size="sm" type="button" onClick={() => void fetchPage(0, true)}>
            {ui.common.refresh}
          </AppBtn>
          {isPrimaryOrganizer ? (
            <AppBtn variant="outline" size="sm" type="button" onClick={() => setZipModalOpen(true)}>
              {ui.gallery.zipExportPrepare}
            </AppBtn>
          ) : null}
        </div>
      </div>

      {/* ── ZIP MODAL ── */}
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
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          }}
          onClick={zipBusy ? undefined : () => setZipModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 400,
              borderRadius: 16,
              padding: 22,
              background: "var(--app-surface)",
              border: "1px solid var(--app-border)",
              boxShadow: "var(--app-shadow-lg)",
            }}
          >
            <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 20, fontWeight: 700, color: "var(--app-text)" }}>
              {ui.gallery.zipExportModalTitle}
            </h2>
            <p style={{ margin: "10px 0 0", fontSize: 13, lineHeight: 1.55, color: "var(--app-muted)" }}>
              {ui.gallery.zipExportModalBody}
            </p>
            {zipExports.length > 0 ? (
              <ul style={{ margin: "14px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {zipExports.map((z) => (
                  <li key={z.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, padding: "8px 10px", borderRadius: 10, background: "var(--app-surface-2)", border: "1px solid var(--app-border)" }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: z.status === "ready" ? "var(--app-success)" : z.status === "failed" ? "var(--app-danger)" : "var(--app-gold)",
                      }}
                    />
                    <span style={{ flex: 1, color: "var(--app-muted)" }}>
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
                      <AppBtn type="button" variant="gold" size="sm" onClick={() => void downloadZipExport(z.id)}>
                        {ui.gallery.zipExportDownload}
                      </AppBtn>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}
            {zipPanelError ? (
              <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--app-danger)" }}>{zipPanelError}</p>
            ) : null}
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
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
              <AppBtn type="button" variant="ghost" size="sm" disabled={zipBusy} onClick={() => setZipModalOpen(false)}>
                {ui.common.cancel}
              </AppBtn>
              <AppBtn type="button" variant="gold" size="sm" disabled={zipBusy} loading={zipBusy} onClick={() => void confirmStartZip()}>
                {ui.gallery.zipExportStart}
              </AppBtn>
            </div>
          </div>
        </div>
      ) : null}

      {/* ── UPLOAD SECTION — Polaroid style ── */}
      {/* Outer wrapper has overflow:visible so the ghost queue can float below */}
      <div style={{ marginBottom: 28, position: "relative" }}>
        {/* Washi tape strip */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -8,
            left: "33%",
            width: 64,
            height: 14,
            background: "rgba(212,168,67,0.48)",
            border: "0.5px solid rgba(212,168,67,0.6)",
            transform: "rotate(-3deg)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.22)",
            zIndex: 2,
            borderRadius: 2,
            pointerEvents: "none",
          }}
        />
        {/* Polaroid card — position:relative so ghost UploadZone can cover it exactly */}
        <div
          style={{
            position: "relative",
            background: uploadsOpen ? "#f4f0ea" : "rgba(244,240,234,0.55)",
            borderRadius: 2,
            boxShadow: "0 8px 28px rgba(0,0,0,0.42), 0 2px 6px rgba(0,0,0,0.2)",
            transform: "rotate(-0.5deg)",
            padding: "14px 14px 18px",
            opacity: uploadsOpen ? 1 : 0.7,
            cursor: uploadsOpen ? "pointer" : "not-allowed",
            overflow: "visible",
          }}
        >
          {/* Visual affordance — pointer-events:none, ghost UploadZone handles clicks/drops */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, pointerEvents: "none" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 4,
                background: "rgba(0,0,0,0.07)",
                border: "1.5px dashed rgba(0,0,0,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 5v14M5 12h14" stroke="rgba(60,40,20,0.5)" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <p style={{ margin: 0, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 16, fontWeight: 700, color: "#2a1d0f", lineHeight: 1.2 }}>
                {ui.gallery.addMemory}
              </p>
              <p style={{ margin: "3px 0 0", fontSize: 11, color: "rgba(60,40,20,0.55)" }}>
                {uploadsOpen ? ui.gallery.addMemoryHint : ui.guestJoin.uploadClosedBanner}
              </p>
            </div>
          </div>

          {/* Ghost UploadZone — invisible overlay on top of the polaroid, queue floats below */}
          <UploadZone
            eventId={eventId}
            disabled={!uploadsOpen}
            ghost
            onUploaded={() => {
              setPage(0);
              void fetchPage(0, true);
            }}
          />
        </div>
      </div>

      {/* ── ERROR / LOADING / EMPTY ── */}
      {error ? (
        <p style={{ marginBottom: 16, fontSize: 13, color: "var(--app-danger)" }}>{error}</p>
      ) : null}

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 0" }}>
          <span
            className="animate-pulse"
            style={{
              display: "inline-block",
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--app-gold)",
              boxShadow: "0 0 6px var(--app-gold)",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 15,
              color: "var(--app-muted)",
            }}
          >
            {ui.gallery.loading}
          </span>
        </div>
      ) : null}

      {!loading && filtered.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "44px 16px 64px",
            textAlign: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/mascot/aurora_gallery.png"
            alt=""
            aria-hidden
            style={{
              width: 112,
              height: 112,
              objectFit: "contain",
              marginBottom: 18,
              filter: "drop-shadow(0 8px 22px color-mix(in srgb, var(--app-gold) 25%, transparent))",
              opacity: 0.9,
            }}
          />
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 20,
              color: "var(--app-text)",
              margin: "0 0 6px",
            }}
          >
            {ui.gallery.empty}
          </p>
        </div>
      ) : null}

      {/* ── PHOTO GRID ── */}
      {filtered.length > 0 ? (() => {
        const renderBottomBar = (item: MediaItem) => {
          const busy = busyId === item.id;
          return (
            <div
              style={{
                position: "absolute",
                inset: "auto 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 4,
                padding: "40px 10px 10px",
                background: "linear-gradient(transparent, rgba(0,0,0,0.72))",
              }}
            >
              <MediaUploaderChip
                label={item.uploaderLabel}
                isMine={Boolean(currentUserId && item.uploaded_by === currentUserId)}
                mineAria={ui.gallery.uploadedByYouAria}
              />
              <button
                type="button"
                disabled={busyId !== null}
                onClick={(e) => { e.stopPropagation(); setPendingDelete(item); }}
                style={{
                  flexShrink: 0,
                  background: "rgba(0,0,0,0.52)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: 20,
                  padding: "3px 9px",
                  fontSize: 10,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.88)",
                  cursor: busy ? "not-allowed" : "pointer",
                  opacity: busy ? 0.5 : 1,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  fontFamily: "inherit",
                }}
              >
                {busy ? ui.gallery.deleteBusy : ui.common.delete}
              </button>
            </div>
          );
        };

        const renderLikeBadge = (item: MediaItem) => (
          <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1 }} onClick={(e) => e.stopPropagation()}>
            <MediaLikeBadge
              liked={likedByMe.has(item.id)}
              count={likeCounts.get(item.id) ?? 0}
              pending={pendingLikeId === item.id}
              likeAria={ui.likes.heartLikeAria}
              unlikeAria={ui.likes.heartUnlikeAria}
              onToggle={() => void handleToggleLikeForItem(item.id)}
            />
          </div>
        );

        const renderMedia = (item: MediaItem) => {
          const isVideo = isVideoMime(item.mime_type);
          if (!item.signedUrl) return <div style={{ width: "100%", minHeight: 80, background: "var(--app-surface-2)" }} />;
          if (isVideo) return <video src={item.signedUrl} style={{ display: "block", width: "100%", height: "auto" }} controls playsInline muted />;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.thumbnailUrl ?? item.signedUrl}
              alt=""
              loading="lazy"
              decoding="async"
              style={{ display: "block", width: "100%", height: "auto", transition: "transform 0.35s" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          );
        };

        return (
          <div style={{ columnCount: 3, columnGap: 4 }}>
            {filtered.map((item) => {
              const isVideo = isVideoMime(item.mime_type);
              return (
                <div
                  key={item.id}
                  onClick={() => !isVideo && setLightbox(item)}
                  style={{
                    position: "relative",
                    breakInside: "avoid",
                    marginBottom: 4,
                    borderRadius: 8,
                    overflow: "hidden",
                    cursor: isVideo ? "default" : "pointer",
                  }}
                >
                  {renderMedia(item)}
                  {renderBottomBar(item)}
                  {!isVideo ? renderLikeBadge(item) : null}
                </div>
              );
            })}
          </div>
        );
      })() : null}

      {/* ── LOAD MORE ── */}
      {hasMore ? (
        <div style={{ marginTop: 18 }}>
          <AppBtn variant="outline" type="button" className="w-full" onClick={loadMore}>
            {ui.gallery.loadMore}
          </AppBtn>
        </div>
      ) : null}

      {/* ── LIGHTBOX ── */}
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

