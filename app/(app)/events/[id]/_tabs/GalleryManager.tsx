"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppBtn } from "@/components/app-ui/AppBtn";

type MediaRow = {
  id: string;
  storage_path: string;
  mime_type: string | null;
  created_at: string;
  uploaded_by: string;
};

type MediaItem = MediaRow & { signedUrl?: string };

type SignedUrlEntry = {
  path: string | null;
  signedUrl: string;
};

const PAGE_SIZE = 60;

function isVideoMime(mime: string | null | undefined) {
  return Boolean(mime && mime.startsWith("video/"));
}

export function GalleryManager({ eventId }: Readonly<{ eventId: string }>) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const [mediaFilter, setMediaFilter] = useState<'all' | 'photos' | 'videos'>('all');

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const fetchPage = useCallback(
    async (pageIndex: number, replace: boolean) => {
      setError(null);
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const { data: rows, error: fetchErr } = await supabase
        .from("media_items")
        .select("id, storage_path, mime_type, created_at, uploaded_by")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (fetchErr) {
        setError("Failed to load gallery.");
        setLoading(false);
        return;
      }

      const typed = (rows ?? []) as MediaRow[];
      const paths = typed.map((r) => r.storage_path);
      const { data: signedData } = paths.length
        ? await supabase.storage.from("event-media").createSignedUrls(paths, 3600)
        : { data: [] as SignedUrlEntry[] };
      const urlMap = Object.fromEntries((signedData ?? []).map((s: SignedUrlEntry) => [s.path, s.signedUrl]));

      const mapped: MediaItem[] = typed.map((r) => ({
        ...r,
        signedUrl: urlMap[r.storage_path],
      }));

      setItems((prev) => (replace ? mapped : [...prev, ...mapped]));
      setHasMore(typed.length === PAGE_SIZE);
      setLoading(false);
    },
    [eventId, supabase],
  );

  useEffect(() => {
    setLoading(true);
    setPage(0);
    setItems([]);
    void fetchPage(0, true);
  }, [fetchPage]);

  async function deleteItem(item: MediaItem) {
    if (busyId) return;
    const ok = window.confirm("Delete this upload? This cannot be undone.");
    if (!ok) return;

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

      setItems((prev) => prev.filter((x) => x.id !== item.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete media.");
    } finally {
      setBusyId(null);
    }
  }

  function loadMore() {
    const next = page + 1;
    setPage(next);
    void fetchPage(next, false);
  }

  const filtered = items.filter(item => {
    if (mediaFilter === 'all') return true;
    if (mediaFilter === 'videos') return isVideoMime(item.mime_type);
    return !isVideoMime(item.mime_type);
  });

  return (
    <section>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ width: 32, height: 3, background: 'var(--app-gold)', borderRadius: 2, marginBottom: 10 }} />
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 42, color: 'var(--app-text)' }}>
              Gallery
            </h2>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--app-muted)', marginTop: 4 }}>
              Browse uploaded photos &amp; videos
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'var(--app-card)', border: '1.5px solid var(--app-border)', borderRadius: 12, overflow: 'hidden' }}>
              {(['all', 'photos', 'videos'] as const).map(f => (
                <button key={f} type="button" onClick={() => setMediaFilter(f)} style={{
                  padding: '9px 18px', border: 'none',
                  background:
                    mediaFilter === f
                      ? "linear-gradient(135deg, var(--app-purple) 0%, var(--app-purple-2) 100%)"
                      : "transparent",
                  color: mediaFilter === f ? "var(--app-inverse)" : "var(--app-muted)",
                  fontWeight: mediaFilter === f ? 600 : 400,
                  fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                  textTransform: 'capitalize',
                }}>
                  {f}
                </button>
              ))}
            </div>
            <AppBtn variant="ghost" size="sm" type="button" onClick={() => void fetchPage(0, true)}>
              Refresh
            </AppBtn>
          </div>
        </div>
      </div>

      {error ? (
        <p style={{ marginBottom: 16, fontSize: 13, color: "var(--app-danger)" }}>{error}</p>
      ) : null}
      {loading && <p style={{ color: 'var(--app-muted)', fontSize: 14 }}>Loading gallery…</p>}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <span style={{ fontSize: 48, opacity: 0.4 }}>📷</span>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--app-muted)', marginTop: 12 }}>
            No uploads yet.
          </p>
        </div>
      )}

      {/* Masonry grid */}
      {filtered.length > 0 && (
        <div style={{ columns: 'auto 220px', gap: 12 }}>
          {filtered.map(item => {
            const signedUrl = item.signedUrl;
            const isVideo = isVideoMime(item.mime_type);
            const busy = busyId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => !isVideo && setLightbox(item)}
                style={{
                  breakInside: 'avoid', marginBottom: 12, position: 'relative',
                  borderRadius: 14, overflow: 'hidden', cursor: isVideo ? 'default' : 'pointer',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                }}
              >
                {signedUrl ? (
                  isVideo ? (
                    <video src={signedUrl} style={{ width: '100%', display: 'block' }} controls playsInline muted />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={signedUrl} alt=""
                      style={{ width: '100%', display: 'block', transition: 'transform 0.3s' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  )
                ) : (
                  <div style={{ height: 160, background: 'var(--app-border)' }} />
                )}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.55))',
                  padding: '28px 14px 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{item.uploaded_by}</span>
                  <button
                    type="button"
                    disabled={busyId !== null}
                    onClick={e => { e.stopPropagation(); void deleteItem(item); }}
                    style={{
                      background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 20,
                      padding: '4px 10px', color: '#fff', fontSize: 11, fontWeight: 600,
                      cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.5 : 1,
                    }}
                  >
                    {busy ? '…' : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasMore ? (
        <AppBtn variant="outline" type="button" className="mt-4 w-full" onClick={loadMore}>
          Load more
        </AppBtn>
      ) : null}

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 24,
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: 800, maxHeight: '85vh' }}>
            {lightbox.signedUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lightbox.signedUrl} alt="" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 16, display: 'block' }} />
            )}
            <div style={{ position: 'absolute', bottom: 16, left: 16, color: '#fff', fontSize: 14, fontWeight: 600, background: 'rgba(0,0,0,0.5)', padding: '6px 14px', borderRadius: 20 }}>
              📷 {lightbox.uploaded_by}
            </div>
            <button
              type="button"
              aria-label="Close lightbox"
              onClick={() => setLightbox(null)}
              style={{
                position: 'absolute', top: -14, right: -14,
                width: 36, height: 36, borderRadius: '50%',
                background: '#fff', border: 'none', cursor: 'pointer',
                fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

