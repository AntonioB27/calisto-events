"use client";

import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useCallback, useEffect, useMemo, useState } from "react";

import { AppBtn } from "@/components/app-ui/AppBtn";

type MediaRow = {
  id: string;
  storage_path: string;
  mime_type: string | null;
  created_at: string;
  uploaded_by: string;
};

type MediaItem = MediaRow & { signedUrl?: string; uploaderLabel: string };

type SignedUrlEntry = {
  path: string | null;
  signedUrl: string;
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

async function downloadFromSignedUrl(signedUrl: string, filename: string) {
  const res = await fetch(signedUrl);
  if (!res.ok) throw new Error(`Download failed (${res.status}).`);
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

const MEDIA_FILTER_OPTS = [
  { id: "all" as const, label: "All" },
  { id: "photos" as const, label: "Photos" },
  { id: "videos" as const, label: "Videos" },
];

type MediaFilterId = (typeof MEDIA_FILTER_OPTS)[number]["id"];

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

/** Same priority as GuestsManager: event display name → profile → Organizer / Guest */
function buildUploaderLabelMap(
  userIds: string[],
  organizerId: string | null,
  memberships: MembershipLabellingRow[] | null | undefined,
  profiles: ProfileLabellingRow[] | null | undefined,
): Map<string, string> {
  const atEvent = new Map<string, string | null>();
  for (const m of memberships ?? []) {
    atEvent.set(m.user_id, m.display_name_at_event);
  }
  const profById = new Map<string, string | null>();
  for (const p of profiles ?? []) {
    profById.set(p.id, p.display_name);
  }

  const out = new Map<string, string>();
  for (const id of userIds) {
    const label =
      atEvent.get(id)?.trim() ||
      profById.get(id)?.trim() ||
      (organizerId !== null && id === organizerId ? "Organizer" : "Guest");
    out.set(id, label);
  }
  return out;
}

export function GalleryManager({ eventId }: Readonly<{ eventId: string }>) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const [lightboxDownloading, setLightboxDownloading] = useState(false);
  const [mediaFilter, setMediaFilter] = useState<MediaFilterId>("all");

  const supabase = useMemo(() => maybeCreateSupabaseBrowserClient(), []);

  useEffect(() => {
    if (!lightbox) setLightboxDownloading(false);
  }, [lightbox]);

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
          Supabase not configured
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--app-muted)", lineHeight: 1.55 }}>
          Set <strong>NEXT_PUBLIC_SUPABASE_URL</strong> and <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong> in <code>.env.local</code> to load the gallery.
        </p>
      </div>
    );
  }

  const fetchPage = useCallback(
    async (pageIndex: number, replace: boolean) => {
      setError(null);
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const [{ data: evRow }, { data: rows, error: fetchErr }] = await Promise.all([
        supabase.from("events").select("organizer_id").eq("id", eventId).maybeSingle(),
        supabase
          .from("media_items")
          .select("id, storage_path, mime_type, created_at, uploaded_by")
          .eq("event_id", eventId)
          .order("created_at", { ascending: false })
          .range(from, to),
      ]);

      if (fetchErr) {
        setError("Failed to load gallery.");
        setLoading(false);
        return;
      }

      const organizerId =
        evRow &&
        typeof (evRow as { organizer_id?: unknown }).organizer_id === "string"
          ? (evRow as { organizer_id: string }).organizer_id
          : null;

      const typed = (rows ?? []) as MediaRow[];
      const uploaderIds = Array.from(new Set(typed.map((r) => r.uploaded_by).filter(Boolean)));

      let labelMap = new Map<string, string>();
      if (uploaderIds.length > 0) {
        const [{ data: mems, error: memErr }, { data: profs, error: profErr }] = await Promise.all([
          supabase
            .from("event_memberships")
            .select("user_id, display_name_at_event")
            .eq("event_id", eventId)
            .in("user_id", uploaderIds),
          supabase.from("profiles").select("id, display_name").in("id", uploaderIds),
        ]);

        labelMap = buildUploaderLabelMap(
          uploaderIds,
          organizerId,
          memErr ? null : (mems as MembershipLabellingRow[] | null),
          profErr ? null : (profs as ProfileLabellingRow[] | null),
        );
      }

      const paths = typed.map((r) => r.storage_path);
      const { data: signedData } = paths.length
        ? await supabase.storage.from("event-media").createSignedUrls(paths, 3600)
        : { data: [] as SignedUrlEntry[] };
      const urlMap = Object.fromEntries((signedData ?? []).map((s: SignedUrlEntry) => [s.path, s.signedUrl]));

      const mapped: MediaItem[] = typed.map((r) => ({
        ...r,
        signedUrl: urlMap[r.storage_path],
        uploaderLabel: labelMap.get(r.uploaded_by) ?? (organizerId !== null && r.uploaded_by === organizerId ? "Organizer" : "Guest"),
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
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <div
              role="tablist"
              aria-label="Filter by media type"
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
                {MEDIA_FILTER_OPTS.map((opt) => {
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
                      src={signedUrl}
                      alt=""
                      className="block h-auto w-full max-w-full"
                      style={{ transition: 'transform 0.3s' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  )
                ) : (
                  <div className="min-h-[160px] w-full bg-[var(--app-border)]" />
                )}
                <div
                  className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 from-30% to-transparent px-2 pb-2 pt-6 md:px-3.5 md:pb-3 md:pt-7"
                >
                  <span className="min-w-0 truncate text-[10px] font-semibold text-white md:text-[13px]">
                    {item.uploaderLabel}
                  </span>
                  <button
                    type="button"
                    disabled={busyId !== null}
                    onClick={e => { e.stopPropagation(); void deleteItem(item); }}
                    className="shrink-0 rounded-full border-0 bg-black/50 px-2 py-1 text-[10px] font-semibold text-white md:px-2.5 md:text-[11px]"
                    style={{
                      cursor: busy ? 'not-allowed' : 'pointer',
                      opacity: busy ? 0.5 : 1,
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
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                right: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, background: 'rgba(0,0,0,0.5)', padding: '6px 14px', borderRadius: 20, minWidth: 0 }}>
                📷 {lightbox.uploaderLabel}
              </div>
              <button
                type="button"
                aria-label="Download this photo"
                disabled={lightboxDownloading || !lightbox.signedUrl}
                onClick={(e) => {
                  e.stopPropagation();
                  const url = lightbox.signedUrl;
                  if (!url || lightboxDownloading) return;
                  void (async () => {
                    setLightboxDownloading(true);
                    try {
                      await downloadFromSignedUrl(url, downloadFilename(lightbox));
                    } catch (err) {
                      window.alert(err instanceof Error ? err.message : "Could not download this photo.");
                    } finally {
                      setLightboxDownloading(false);
                    }
                  })();
                }}
                style={{
                  flexShrink: 0,
                  padding: '8px 18px',
                  borderRadius: 20,
                  border: 'none',
                  cursor: lightboxDownloading ? 'wait' : 'pointer',
                  opacity: lightboxDownloading ? 0.7 : 1,
                  fontFamily: 'inherit',
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  color: '#1b1208',
                  background:
                    'linear-gradient(152deg, var(--app-gold-2) 0%, var(--app-gold) 55%, color-mix(in srgb, var(--app-gold) 88%, #fff) 100%)',
                  boxShadow:
                    '0 1px 0 color-mix(in srgb, #fff 55%, transparent) inset, 0 2px 14px color-mix(in srgb, var(--app-gold) 38%, transparent)',
                }}
              >
                {lightboxDownloading ? "Downloading…" : "Download"}
              </button>
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

