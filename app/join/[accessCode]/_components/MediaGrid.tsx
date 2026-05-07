"use client";

import { useCallback, useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type MediaItem = {
  id: string;
  storage_path: string;
  mime_type: string | null;
  signedUrl: string | undefined;
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

  const fetchPage = useCallback(
    async (pageIndex: number, replace: boolean) => {
      try {
        const supabase = createSupabaseBrowserClient();
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

        const paths = typedRows.map((r) => r.storage_path);
        const { data: signedData } = await supabase.storage.from("event-media").createSignedUrls(paths, 3600);
        const urlMap = Object.fromEntries((signedData ?? []).map((s: SignedUrlEntry) => [s.path, s.signedUrl]));

        const mapped: MediaItem[] = typedRows.map((r) => ({
          id: r.id,
          storage_path: r.storage_path,
          mime_type: r.mime_type,
          signedUrl: urlMap[r.storage_path],
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
    fetchPage(0, true);
  }, [fetchPage, refreshKey]);

  function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, false);
  }

  return (
    <div>
      {loading && <p className="text-zinc-500">Loading gallery…</p>}
      {error && <p className="text-red-400">{error}</p>}
      {!loading && items.length === 0 && <p className="text-zinc-400">No media yet — be the first to upload!</p>}

      {items.length > 0 && (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.id} className="relative aspect-square overflow-hidden rounded-xl bg-white/10">
              {item.signedUrl ? (
                isVideoMime(item.mime_type) ? (
                  <video
                    src={item.signedUrl}
                    className="h-full w-full object-cover"
                    controls
                    playsInline
                    muted
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.signedUrl} alt="" className="h-full w-full object-cover" />
                )
              ) : (
                <div className="h-full w-full bg-zinc-800" />
              )}
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <button
          onClick={loadMore}
          className="mt-6 w-full rounded-full border border-white/20 bg-white/5 py-2.5 text-sm font-semibold text-zinc-300 transition hover:bg-white/10"
          type="button"
        >
          Load more
        </button>
      )}
    </div>
  );
}
