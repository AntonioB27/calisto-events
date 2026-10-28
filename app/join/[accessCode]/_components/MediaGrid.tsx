"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { Aurora } from "@/components/app-ui/Aurora";
import { AuroraHourglass } from "@/components/app-ui/AuroraHourglass";
import { MediaLikeBadge } from "@/components/app-ui/MediaLikeBadge";
import { PhotoLightbox } from "@/components/app-ui/PhotoLightbox";
import { buildMemberLabelMap } from "@/lib/event-member-labels";
import { interpolate } from "@/lib/app-ui";
import {
  canViewLikers,
  fetchLikeSummaryForMedia,
  fetchLikersForMedia,
  toggleLike,
  type LikerRow,
} from "@/lib/media-likes";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getCachedUrls, storeCachedUrls, warmCache } from "@/lib/signed-url-cache";

type MediaItem = {
  id: string;
  storage_path: string;
  mime_type: string | null;
  uploaded_by: string;
  signedUrl: string | undefined;
  thumbnailUrl: string | undefined;
  uploaderLabel: string;
  moderation_status: string;
};

type MediaRow = {
  id: string;
  storage_path: string;
  thumbnail_path: string | null;
  mime_type: string | null;
  uploaded_by: string;
  moderation_status: string;
};

type SignedUrlEntry = {
  path: string | null;
  signedUrl: string;
};

const PAGE_SIZE = 24;

function isVideoMime(mime: string | null | undefined) {
  return Boolean(mime && mime.startsWith("video/"));
}

type Props = {
  eventId: string;
  refreshKey: number;
  userId: string | null;
  organizerUserId: string;
  canManageEvent: boolean;
  /** Only the viewer's own uploads (the album's "Mine" switch). */
  onlyMine?: boolean;
  /** Receives display URLs of the newest (up to 2) loaded photos, for the album header prints. */
  onLatestPhotos?: (urls: string[]) => void;
};

export function MediaGrid({ eventId, refreshKey, userId, organizerUserId, canManageEvent, onlyMine = false, onLatestPhotos }: Props) {
  const ui = useAppUi();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [likeCounts, setLikeCounts] = useState<Map<string, number>>(() => new Map());
  const [likedByMe, setLikedByMe] = useState<Set<string>>(() => new Set());
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const [advanceAfterLoad, setAdvanceAfterLoad] = useState(false);
  const [lightboxLikers, setLightboxLikers] = useState<LikerRow[]>([]);
  const [lightboxLikersLoading, setLightboxLikersLoading] = useState(false);
  const [likeToggleError, setLikeToggleError] = useState<string | null>(null);
  const [pendingLikeId, setPendingLikeId] = useState<string | null>(null);
  const [columnCount, setColumnCount] = useState(3);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setColumnCount(mq.matches ? 4 : 3);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!onLatestPhotos) return;
    onLatestPhotos(
      items
        .filter((i) => !isVideoMime(i.mime_type) && (i.thumbnailUrl ?? i.signedUrl))
        .slice(0, 2)
        .map((i) => (i.thumbnailUrl ?? i.signedUrl) as string),
    );
  }, [items, onLatestPhotos]);

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

  const lightboxIndex = lightbox ? items.findIndex((i) => i.id === lightbox.id) : -1;

  function goToPrevLightbox() {
    if (lightboxIndex > 0) setLightbox(items[lightboxIndex - 1]);
  }

  function goToNextLightbox() {
    if (lightboxIndex < 0) return;
    if (lightboxIndex < items.length - 1) {
      setLightbox(items[lightboxIndex + 1]);
    } else if (hasMore) {
      // At the end of what's loaded — pull the next page, then advance once it lands.
      setAdvanceAfterLoad(true);
      loadMore();
    }
  }

  // When a page requested from the lightbox arrives, step onto the next photo.
  useEffect(() => {
    if (!advanceAfterLoad || !lightbox) return;
    const idx = items.findIndex((i) => i.id === lightbox.id);
    if (idx !== -1 && idx < items.length - 1) {
      setLightbox(items[idx + 1]);
      setAdvanceAfterLoad(false);
    } else if (!hasMore) {
      setAdvanceAfterLoad(false);
    }
  }, [advanceAfterLoad, items, lightbox, hasMore]);

  useEffect(() => {
    warmCache(eventId);
  }, [eventId]);

  const fetchPage = useCallback(
    async (pageIndex: number, replace: boolean) => {
      try {
        const supabase = maybeCreateSupabaseBrowserClient();
        if (!supabase) {
          setError(ui.supabase.galleryBody);
          setLoading(false);
          setHasMore(false);
          return;
        }
        const from = pageIndex * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        // ── Round-trip 1 ──────────────────────────────────────────────────────
        // Fetches 24 rows of metadata from Postgres (~50–150 ms).
        // Fast and cheap — only paths and mime types, no heavy columns.
        let query = supabase
          .from("media_items")
          .select("id, storage_path, thumbnail_path, mime_type, uploaded_by, moderation_status")
          .eq("event_id", eventId);
        if (onlyMine && userId) query = query.eq("uploaded_by", userId);
        const { data: rows, error: fetchErr } = await query
          .order("created_at", { ascending: false })
          .range(from, to);
        if (fetchErr) throw fetchErr;

        const typedRows = (rows ?? []) as MediaRow[];
        if (typedRows.length === 0) {
          if (replace) setItems([]);
          setHasMore(false);
          setLoading(false);
          return;
        }

        const photoIds = typedRows.filter((r) => !isVideoMime(r.mime_type)).map((r) => r.id);
        const uploaderIds = Array.from(new Set(typedRows.map((r) => r.uploaded_by).filter(Boolean)));

        const thumbnailPaths = typedRows
          .map((r) => r.thumbnail_path)
          .filter((p): p is string => Boolean(p));
        const allPaths = Array.from(new Set([
          ...typedRows.map((r) => r.storage_path),
          ...thumbnailPaths,
        ]));
        const { cached: cachedUrls, missing: missingPaths } = getCachedUrls(allPaths);

        const [likeSummary, labelResult, signedData] = await Promise.all([
          fetchLikeSummaryForMedia(supabase, photoIds, userId),
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
          missingPaths.length
            ? supabase.storage.from("event-media").createSignedUrls(missingPaths, 3600)
            : Promise.resolve({ data: [] as SignedUrlEntry[] }),
        ]);

        let labelMap = new Map<string, string>();
        if (labelResult) {
          const [{ data: mems, error: memErr }, { data: profs, error: profErr }] = labelResult;
          labelMap = buildMemberLabelMap(
            uploaderIds,
            organizerUserId,
            memErr ? null : (mems as Array<{ user_id: string; display_name_at_event: string | null }> | null),
            profErr ? null : (profs as Array<{ id: string; display_name: string | null }> | null),
            { organizer: ui.guests.organizerLabelFallback, guest: ui.guests.guestLabelFallback },
          );
        }

        // Only keep successful signs. On RLS denial / error, createSignedUrls returns
        // entries with an empty signedUrl — caching those poisons sessionStorage and
        // blocks re-signing until the TTL expires, so drop them and retry next fetch.
        const freshUrlMap = Object.fromEntries(
          ((signedData as { data: SignedUrlEntry[] | null }).data ?? [])
            .filter((s: SignedUrlEntry) => Boolean(s.path && s.signedUrl))
            .map((s: SignedUrlEntry) => [s.path, s.signedUrl]),
        );
        if (Object.keys(freshUrlMap).length > 0) {
          storeCachedUrls(eventId, freshUrlMap);
        }
        const urlMap = { ...cachedUrls, ...freshUrlMap };

        const mapped: MediaItem[] = typedRows.map((r) => ({
          id: r.id,
          storage_path: r.storage_path,
          mime_type: r.mime_type,
          uploaded_by: r.uploaded_by,
          moderation_status: r.moderation_status,
          signedUrl: urlMap[r.storage_path],
          thumbnailUrl: r.thumbnail_path ? urlMap[r.thumbnail_path] : undefined,
          uploaderLabel:
            labelMap.get(r.uploaded_by) ??
            (r.uploaded_by === organizerUserId
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
        setHasMore(typedRows.length === PAGE_SIZE);
        setLoading(false);
      } catch {
        setError(ui.gallery.loadFailed);
        setLoading(false);
      }
    },
    [eventId, userId, onlyMine, organizerUserId, ui.gallery.loadFailed, ui.guests.guestLabelFallback, ui.guests.organizerLabelFallback, ui.supabase.galleryBody],
  );

  useEffect(() => {
    setLoading(true);
    setPage(0);
    setItems([]);
    void fetchPage(0, true);
  }, [fetchPage, refreshKey]);

  useEffect(() => {
    if (!lightbox) {
      setLightboxLikers([]);
      setLightboxLikersLoading(false);
      setLikeToggleError(null);
      return;
    }

    const showLikers = canViewLikers({
      viewerId: userId,
      organizerId: organizerUserId,
      canManageEvent,
      uploadedBy: lightbox.uploaded_by,
    });
    if (!showLikers) return;

    let cancelled = false;
    const supabase = maybeCreateSupabaseBrowserClient();
    if (!supabase) return;

    setLightboxLikersLoading(true);
    void fetchLikersForMedia(supabase, lightbox.id, {
      eventId,
      organizerId: organizerUserId,
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
    userId,
    organizerUserId,
    canManageEvent,
    eventId,
    ui.guests.guestLabelFallback,
    ui.guests.organizerLabelFallback,
  ]);

  function loadMore() {
    if (loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    void fetchPage(nextPage, false).finally(() => setLoadingMore(false));
  }

  async function handleToggleLikeForItem(mediaItemId: string, uploadedBy: string) {
    if (pendingLikeId) return;
    const supabase = maybeCreateSupabaseBrowserClient();
    if (!supabase) return;

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

      const showLikers = canViewLikers({
        viewerId: userId,
        organizerId: organizerUserId,
        canManageEvent,
        uploadedBy,
      });
      if (lightbox?.id === mediaItemId && showLikers) {
        const likers = await fetchLikersForMedia(supabase, mediaItemId, {
          eventId,
          organizerId: organizerUserId,
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

  const lightboxCanViewLikers = lightbox
    ? canViewLikers({
        viewerId: userId,
        organizerId: organizerUserId,
        canManageEvent,
        uploadedBy: lightbox.uploaded_by,
      })
    : false;

  return (
    <div>
      {loading ? (
        <AuroraHourglass size={80} caption={ui.gallery.loading} style={{ padding: "20px 0" }} />
      ) : null}
      {error ? <p style={{ color: "var(--app-danger)" }}>{error}</p> : null}
      {!loading && items.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "44px 16px 64px", textAlign: "center" }}>
          <Aurora pose="gallery" size={110} style={{ marginBottom: 16 }} />
          <p style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 700, fontSize: 19, color: "var(--app-text)", margin: "0 0 6px" }}>
            {ui.gallery.emptyGuest}
          </p>
        </div>
      ) : null}

      {items.length > 0 ? (() => {
        const renderMedia = (item: MediaItem) => {
          const isVideo = isVideoMime(item.mime_type);
          if (!item.signedUrl) return <div style={{ width: "100%", minHeight: 80, background: "var(--app-surface-2)" }} />;
          if (isVideo) return (
            <div style={{ position: "relative", width: "100%", lineHeight: 0 }}>
              <video src={item.signedUrl} preload="metadata" style={{ display: "block", width: "100%", height: "auto" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" aria-hidden><path d="M8 5v14l11-7z"/></svg>
                </div>
              </div>
            </div>
          );
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

        const renderOverlay = (item: MediaItem) => {
          const isVideo = isVideoMime(item.mime_type);
          const isPending = item.moderation_status === "pending";
          return (
            <>
              {isPending ? (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "inherit",
                    pointerEvents: "none",
                  }}
                >
                  <span
                    style={{
                      padding: "3px 9px",
                      borderRadius: 999,
                      background: "rgba(197,146,42,0.22)",
                      border: "1px solid rgba(197,146,42,0.5)",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--app-gold)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {ui.gallery.moderationPendingBadge}
                  </span>
                </div>
              ) : null}
              {/* Hearts only once a photo has likes (or you liked it); the uploader's name lives in the full-screen view. */}
              {!isVideo && ((likeCounts.get(item.id) ?? 0) > 0 || likedByMe.has(item.id)) ? (
                <div style={{ position: "absolute", right: 5, bottom: 5, zIndex: 1 }}>
                  <MediaLikeBadge
                    liked={likedByMe.has(item.id)}
                    count={likeCounts.get(item.id) ?? 0}
                    pending={pendingLikeId === item.id}
                    likeAria={ui.likes.heartLikeAria}
                    unlikeAria={ui.likes.heartUnlikeAria}
                    onToggle={(e) => { e.stopPropagation(); void handleToggleLikeForItem(item.id, item.uploaded_by); }}
                  />
                </div>
              ) : null}
            </>
          );
        };

        // `items` is already newest-first. CSS multi-column layout (columnCount) fills one
        // column top-to-bottom before moving to the next, which buries newest items down the
        // first column instead of across the top row. Distributing round-robin across N column
        // buckets keeps the newest items in the top row while still allowing per-column masonry
        // (variable tile heights) below it.
        const columnBuckets: MediaItem[][] = Array.from({ length: columnCount }, () => []);
        items.forEach((item, index) => {
          columnBuckets[index % columnCount].push(item);
        });

        return (
          <div style={{ display: "flex", gap: 6 }}>
            {columnBuckets.map((columnItems, columnIndex) => (
              <div key={columnIndex} style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
                {columnItems.map((item) => {
                  return (
                    <div
                      key={item.id}
                      onClick={() => setLightbox(item)}
                      style={{ position: "relative", borderRadius: 10, overflow: "hidden", cursor: "pointer", background: "var(--app-surface-2)", boxShadow: "0 6px 14px -10px rgba(60, 35, 10, 0.45)" }}
                    >
                      {renderMedia(item)}
                      {renderOverlay(item)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })() : null}

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

      {lightbox ? (
        <PhotoLightbox
          signedUrl={lightbox.signedUrl}
          mimeType={lightbox.mime_type}
          likeCount={likeCounts.get(lightbox.id) ?? 0}
          likedByMe={likedByMe.has(lightbox.id)}
          canViewLikers={lightboxCanViewLikers}
          likers={lightboxLikers}
          likersLoading={lightboxLikersLoading}
          togglePending={pendingLikeId === lightbox.id}
          toggleError={likeToggleError}
          copy={lightboxCopy}
          uploaderLabel={lightbox.uploaderLabel}
          isMineUpload={Boolean(userId && lightbox.uploaded_by === userId)}
          uploadedByYouAria={ui.gallery.uploadedByYouAria}
          onClose={() => setLightbox(null)}
          onToggleLike={() => void handleToggleLikeForItem(lightbox.id, lightbox.uploaded_by)}
          hasPrev={lightboxIndex > 0}
          hasNext={lightboxIndex >= 0 && (lightboxIndex < items.length - 1 || hasMore)}
          onPrev={goToPrevLightbox}
          onNext={goToNextLightbox}
        />
      ) : null}
    </div>
  );
}
