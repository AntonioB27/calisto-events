"use client";

import { useCallback, useEffect, useState } from "react";

import { AppBtn } from "@/components/app-ui/AppBtn";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getCachedUrls, storeCachedUrls, warmCache } from "@/lib/signed-url-cache";
import { toThumbnailUrl } from "@/lib/supabase-storage-transform";

type MediaItem = {
  id: string;
  storage_path: string;
  mime_type: string | null;
  signedUrl: string | undefined;
  thumbnailUrl: string | undefined;
};

type MediaRow = {
  id: string;
  storage_path: string;
  mime_type: string | null;
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
};

export function MediaGrid({ eventId, refreshKey }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    warmCache(eventId);
  }, [eventId]);

  const fetchPage = useCallback(
    async (pageIndex: number, replace: boolean) => {
      try {
        const supabase = maybeCreateSupabaseBrowserClient();
        if (!supabase) {
          setError("Supabase is not configured.");
          setLoading(false);
          setHasMore(false);
          return;
        }
        const from = pageIndex * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data: rows, error: fetchErr } = await supabase
          .from("media_items")
          .select("id, storage_path, mime_type")
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

        const allPaths = typedRows.map((r) => r.storage_path);
        const { cached: cachedUrls, missing: missingPaths } = getCachedUrls(allPaths);

        const { data: signedData } = missingPaths.length
          ? await supabase.storage.from("event-media").createSignedUrls(missingPaths, 3600)
          : { data: [] as SignedUrlEntry[] };

        const freshUrlMap = Object.fromEntries((signedData ?? []).map((s: SignedUrlEntry) => [s.path, s.signedUrl]));
        if (Object.keys(freshUrlMap).length > 0) {
          storeCachedUrls(eventId, freshUrlMap);
        }
        const urlMap = { ...cachedUrls, ...freshUrlMap };

        const mapped: MediaItem[] = typedRows.map((r) => ({
          id: r.id,
          storage_path: r.storage_path,
          mime_type: r.mime_type,
          signedUrl: urlMap[r.storage_path],
          thumbnailUrl: urlMap[r.storage_path] ? toThumbnailUrl(urlMap[r.storage_path]) : undefined,
        }));

        setItems((prev) => (replace ? mapped : [...prev, ...mapped]));
        setHasMore(typedRows.length === PAGE_SIZE);
        setLoading(false);
      } catch {
        setError("Failed to load gallery. Please refresh.");
        setLoading(false);
      }
    },
    [eventId],
  );

  useEffect(() => {
    setLoading(true);
    setPage(0);
    setItems([]);
    void fetchPage(0, true);
  }, [fetchPage, refreshKey]);

  function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    void fetchPage(nextPage, false);
  }

  return (
    <div>
      {loading ? <p style={{ color: "var(--app-muted)" }}>Loading gallery…</p> : null}
      {error ? <p style={{ color: "var(--app-danger)" }}>{error}</p> : null}
      {!loading && items.length === 0 ? (
        <p style={{ color: "var(--app-muted)" }}>No media yet — be the first to upload!</p>
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
                  <video
                    src={item.signedUrl}
                    className="block h-auto w-full max-w-full"
                    controls
                    playsInline
                    muted
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.thumbnailUrl ?? item.signedUrl} alt="" loading="lazy" decoding="async" className="block h-auto w-full max-w-full" />
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
          Load more
        </AppBtn>
      ) : null}
    </div>
  );
}
