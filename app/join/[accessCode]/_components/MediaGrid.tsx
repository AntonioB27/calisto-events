"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { MediaLikeBadge } from "@/components/app-ui/MediaLikeBadge";
import { MediaUploaderChip } from "@/components/app-ui/MediaUploaderChip";
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
import { toThumbnailUrl } from "@/lib/supabase-storage-transform";

type MediaItem = {
  id: string;
  storage_path: string;
  mime_type: string | null;
  uploaded_by: string;
  signedUrl: string | undefined;
  thumbnailUrl: string | undefined;
  uploaderLabel: string;
};

type MediaRow = {
  id: string;
  storage_path: string;
  mime_type: string | null;
  uploaded_by: string;
};

type SignedUrlEntry = {
  path: string | null;
  signedUrl: string;
};

const PAGE_SIZE = 50;

function isVideoMime(mime: string | null | undefined) {
  return Boolean(mime && mime.startsWith("video/"));
}

type Props = {
  eventId: string;
  refreshKey: number;
  userId: string | null;
  organizerUserId: string;
  canManageEvent: boolean;
};

export function MediaGrid({ eventId, refreshKey, userId, organizerUserId, canManageEvent }: Props) {
  const ui = useAppUi();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);
  const [likeCounts, setLikeCounts] = useState<Map<string, number>>(() => new Map());
  const [likedByMe, setLikedByMe] = useState<Set<string>>(() => new Set());
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const [lightboxLikers, setLightboxLikers] = useState<LikerRow[]>([]);
  const [lightboxLikersLoading, setLightboxLikersLoading] = useState(false);
  const [likeToggleError, setLikeToggleError] = useState<string | null>(null);
  const [pendingLikeId, setPendingLikeId] = useState<string | null>(null);

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

        const { data: rows, error: fetchErr } = await supabase
          .from("media_items")
          .select("id, storage_path, mime_type, uploaded_by")
          .eq("event_id", eventId)
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

        const allPaths = typedRows.map((r) => r.storage_path);
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

        const freshUrlMap = Object.fromEntries(
          ((signedData as { data: SignedUrlEntry[] | null }).data ?? []).map((s: SignedUrlEntry) => [s.path, s.signedUrl]),
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
          signedUrl: urlMap[r.storage_path],
          thumbnailUrl: urlMap[r.storage_path] ? toThumbnailUrl(urlMap[r.storage_path]) : undefined,
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
    [eventId, userId, organizerUserId, ui.gallery.loadFailed, ui.guests.guestLabelFallback, ui.guests.organizerLabelFallback, ui.supabase.galleryBody],
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
    const nextPage = page + 1;
    setPage(nextPage);
    void fetchPage(nextPage, false);
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
      {loading ? <p style={{ color: "var(--app-muted)" }}>{ui.gallery.loading}</p> : null}
      {error ? <p style={{ color: "var(--app-danger)" }}>{error}</p> : null}
      {!loading && items.length === 0 ? (
        <p style={{ color: "var(--app-muted)" }}>{ui.gallery.emptyGuest}</p>
      ) : null}

      {items.length > 0 ? (
        <ul className="m-0 list-none columns-2 [column-gap:8px] p-0 sm:columns-3 lg:columns-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="mb-2 break-inside-avoid overflow-hidden rounded-xl bg-[var(--app-surface-2)]"
            >
              {item.signedUrl ? (
                isVideoMime(item.mime_type) ? (
                  <div className="relative">
                    <video
                      src={item.signedUrl}
                      className="block h-auto w-full max-w-full"
                      controls
                      playsInline
                      muted
                    />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 from-25% to-transparent px-2 pb-2 pt-5">
                      <MediaUploaderChip
                        label={item.uploaderLabel}
                        isMine={Boolean(userId && item.uploaded_by === userId)}
                        mineAria={ui.gallery.uploadedByYouAria}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      aria-label={ui.gallery.openPhotoAria}
                      onClick={() => setLightbox(item)}
                      className="block w-full cursor-pointer border-0 bg-transparent p-0"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.thumbnailUrl ?? item.signedUrl}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="block h-auto w-full max-w-full"
                      />
                    </button>
                    <div className="pointer-events-none absolute right-2 top-2">
                      <div className="pointer-events-auto">
                        <MediaLikeBadge
                          liked={likedByMe.has(item.id)}
                          count={likeCounts.get(item.id) ?? 0}
                          pending={pendingLikeId === item.id}
                          likeAria={ui.likes.heartLikeAria}
                          unlikeAria={ui.likes.heartUnlikeAria}
                          onToggle={(e) => {
                            e.stopPropagation();
                            void handleToggleLikeForItem(item.id, item.uploaded_by);
                          }}
                        />
                      </div>
                    </div>
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 from-25% to-transparent px-2 pb-2 pt-5">
                      <MediaUploaderChip
                        label={item.uploaderLabel}
                        isMine={Boolean(userId && item.uploaded_by === userId)}
                        mineAria={ui.gallery.uploadedByYouAria}
                      />
                    </div>
                  </div>
                )
              ) : (
                <div className="min-h-32 w-full bg-[var(--app-border)]" />
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {hasMore ? (
        <AppBtn variant="outline" type="button" className="mt-6 w-full" onClick={loadMore}>
          {ui.gallery.loadMore}
        </AppBtn>
      ) : null}

      {lightbox ? (
        <PhotoLightbox
          signedUrl={lightbox.signedUrl}
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
        />
      ) : null}
    </div>
  );
}
