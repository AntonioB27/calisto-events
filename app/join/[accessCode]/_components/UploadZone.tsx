"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePostHog } from "posthog-js/react";
import { useAppUi } from "@/components/AppUiProvider";
import { Aurora } from "@/components/app-ui/Aurora";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
import { interpolate, type AppUiDict } from "@/lib/app-ui";
import { plural } from "@/lib/app-ui/plural";
import { bcp47FromUiLocale } from "@/lib/locale-bcp47";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { formatZipSize } from "@/lib/zip-export-view";

import { scheduleAutoHide, UPLOAD_DONE_HIDE_MS, uploadPillPhase, type UploadPillPhase } from "./upload-pill";
import { UploadSuccess } from "./UploadSuccess";
import "@/app/(app)/events/[id]/_components/zip-dock.css";
import "./upload-dock.css";

const EVENT_MEDIA_BUCKET = "event-media";

type UploadItem = {
  id: string;
  file: File;
  status: "pending" | "done" | "error";
  errorMessage?: string;
  /** Object URL for the pill and list thumbnails (images only); revoked when the item leaves the queue. */
  preview?: string;
};

const revokePreview = (item: UploadItem) => {
  if (item.preview) URL.revokeObjectURL(item.preview);
};

type Props = {
  eventId: string;
  onUploaded: () => void;
  disabled?: boolean;
  /** When true the drop zone renders as an invisible overlay so a parent can act as the visual affordance. */
  ghost?: boolean;
  /** Accessible name for the ghost overlay, which acts as the button. */
  label?: string;
  /** Show the full-screen success moment after a batch finishes with at least one upload (guest flow). */
  celebrate?: boolean;
};

type FlowCopy = AppUiDict["guestFlow"];

function mapUploadError(status: number, raw: unknown, t: FlowCopy, mimeType?: string): string {
  const code = typeof raw === "object" && raw !== null && "error" in raw
    ? (raw as { error?: string }).error
    : undefined;

  switch (status) {
    case 401:
      return t.errNotSignedIn;

    case 400:
      if (code === "Invalid form data.") return t.errInvalidForm;
      if (code === "No file provided.")  return t.errNoFile;
      return t.errBadRequest;

    case 403:
      if (code === "UPLOADS_CLOSED")
        return t.errUploadsClosed;
      if (code === "QUOTA_REACHED")
        return t.errQuota;
      return t.errForbidden;

    case 404:
      return t.errNotFound;

    case 413: {
      const isVideo = mimeType?.startsWith("video/");
      return isVideo
        ? t.errVideoTooLarge
        : t.errPhotoTooLarge;
    }

    case 415:
      return t.errUnsupported;

    case 429:
      return t.errTooMany;

    case 500:
      if (code === "Upload failed.")       return t.errStorage;
      if (code === "Failed to save upload.") return t.errRecord;
      if (code === "Could not start upload.") return t.errStart;
      return t.errServer;

    default:
      return interpolate(t.errHttp, { status });
  }
}

type UploadResult = { ok: true } | { ok: false; status: number; body: unknown };

async function uploadPhotoViaApi(eventId: string, file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`/api/events/${eventId}/guest-upload`, { method: "POST", body: formData });
  if (res.ok) return { ok: true };
  const body = await res.json().catch(() => ({}));
  return { ok: false, status: res.status, body };
}

// Uploads the video straight to Supabase Storage from the browser via a signed URL,
// bypassing the Vercel Function request-body limit that a proxied upload would hit.
async function uploadVideoDirect(eventId: string, file: File): Promise<UploadResult> {
  const initRes = await fetch(`/api/events/${eventId}/guest-video-upload/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mimeType: file.type, sizeBytes: file.size }),
  });
  if (!initRes.ok) {
    const body = await initRes.json().catch(() => ({}));
    return { ok: false, status: initRes.status, body };
  }
  const { path, token } = (await initRes.json()) as { path: string; token: string };

  const { error: storageError } = await getSupabaseBrowserClient()
    .storage.from(EVENT_MEDIA_BUCKET)
    .uploadToSignedUrl(path, token, file, { contentType: file.type });
  if (storageError) {
    return { ok: false, status: 500, body: { error: "Upload failed." } };
  }

  const finalizeRes = await fetch(`/api/events/${eventId}/guest-video-upload/finalize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
  });
  if (!finalizeRes.ok) {
    const body = await finalizeRes.json().catch(() => ({}));
    return { ok: false, status: finalizeRes.status, body };
  }
  return { ok: true };
}

// ── Upload dock: floating pill + list sheet (portalled), same family as the gallery ZIP dock ──
function UploadDock({
  queue,
  phase,
  leaving,
  open,
  onOpen,
  onClose,
  onRetry,
  onRetryAll,
  onDismiss,
}: {
  queue: UploadItem[];
  phase: UploadPillPhase;
  leaving: boolean;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onRetry: (id: string) => void;
  onRetryAll: () => void;
  onDismiss: () => void;
}) {
  const ui = useAppUi();
  const t = ui.guestFlow;
  const locale = bcp47FromUiLocale(ui.locale);
  const sheetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    sheetRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // The queue only fills after a pick in the browser, so the server render is always hidden.
  if (phase === "hidden") return null;

  const total = queue.length;
  const done = queue.filter((i) => i.status === "done").length;
  const errors = queue.filter((i) => i.status === "error").length;
  const settled = done + errors;
  const currentIdx = queue.findIndex((i) => i.status === "pending");
  const top = currentIdx < 0 ? total - 1 : currentIdx;
  // The top print is the file going up right now, the two under it the ones just before.
  const stack = [top - 2, top - 1, top].map((i) => queue[i]?.preview);

  const title =
    phase === "done" ? t.pillDone : phase === "failed" ? plural(locale, errors, t.pillFailed) : t.pillUploading;
  const sub =
    phase === "done"
      ? plural(locale, done, t.pillDoneSub)
      : phase === "failed"
        ? done > 0 ? t.pillFailedSub : t.pillFailedSubAll
        : t.pillUploadingSub;
  const sheetTitle = phase === "failed" ? t.sheetFailedTitle : phase === "done" ? t.pillDone : t.logTitle;
  const sheetBody = interpolate(
    phase === "failed" ? t.sheetFailedBody : phase === "done" ? t.sheetDoneBody : t.sheetBody,
    { done, total },
  );
  const rank = (s: UploadItem["status"]) => (s === "error" ? 0 : s === "pending" ? 1 : 2);
  const rows = queue.map((item, i) => ({ item, i })).sort((a, b) => rank(a.item.status) - rank(b.item.status) || a.i - b.i);
  const hideBroken = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.visibility = "hidden"; // HEIC and friends the browser can't draw
  };

  return createPortal(
    <>
      {!open ? (
        <div className={`zipdock-pill-wrap uploaddock-wrap${phase === "failed" ? " uploaddock-wrap--failed" : ""}`}>
          <button
            type="button"
            className={`zipdock-pill zipdock-pill--${phase === "done" ? "ready" : phase === "failed" ? "failed" : "working"}${leaving ? " uploaddock-leaving" : ""}`}
            aria-label={interpolate(t.logAria, { label: title })}
            onClick={onOpen}
          >
            <span className="zipdock-pill__handle" aria-hidden />
            <span className="zipdock-stack" aria-hidden>
              {stack.map((src, i) => (
                <span key={i} className={`zipdock-stack__photo zipdock-stack__photo--${i}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
                  {src ? <img src={src} alt="" onError={hideBroken} /> : null}
                </span>
              ))}
              {phase === "done" ? (
                <span className="zipdock-stack__badge">
                  <CheckIcon size={11} />
                </span>
              ) : phase === "failed" ? (
                <span className="zipdock-stack__badge uploaddock-badge--failed">!</span>
              ) : null}
            </span>
            <span className="zipdock-pill__text">
              <span className="zipdock-pill__title" aria-live="polite">{title}</span>
              <span className="zipdock-pill__sub">{sub}</span>
            </span>
            {phase === "uploading" ? (
              <span className="zipdock-pill__pct">
                {settled}/{total}
              </span>
            ) : phase === "done" ? (
              <span className="zipdock-pill__cta" aria-hidden>
                <CheckIcon size={20} />
              </span>
            ) : null}
            {phase === "uploading" ? (
              <span className="zipdock-pill__track" aria-hidden>
                <span className="zipdock-pill__fill" style={{ transform: `scaleX(${settled / total})` }} />
              </span>
            ) : phase === "done" ? (
              <span className="uploaddock-drain" style={{ animationDuration: `${UPLOAD_DONE_HIDE_MS}ms` }} aria-hidden />
            ) : null}
          </button>
          {phase === "failed" ? (
            <button type="button" className="zipdock-btn zipdock-btn--gold uploaddock-retry" onClick={onRetryAll}>
              <RetryIcon />
              {t.retryShort}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="zipdock-layer">
          <button type="button" className="zipdock-scrim" aria-label={ui.gallery.zipDockMinimize} onClick={onClose} />
          <section ref={sheetRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="uploaddock-title" className="zipdock-sheet">
            <button type="button" className="zipdock-sheet__grab" aria-label={ui.gallery.zipDockMinimize} onClick={onClose}>
              <span aria-hidden />
            </button>
            <Aurora pose="camera" size={96} className="zipdock-sheet__aurora" />
            <h2 id="uploaddock-title" className="zipdock-sheet__title">
              {sheetTitle}
            </h2>
            <p className="zipdock-sheet__body uploaddock-sheet-body">{sheetBody}</p>

            <ul className="uploaddock-list">
              {rows.map(({ item, i }) => {
                const size = formatZipSize(item.file.size, locale);
                const current = i === currentIdx;
                return (
                  <li key={item.id} className={`uploaddock-row${item.status === "error" ? " uploaddock-row--error" : ""}`}>
                    <span className="uploaddock-thumb" aria-hidden>
                      {/* eslint-disable-next-line @next/next/no-img-element -- local object URL */}
                      {item.preview ? <img src={item.preview} alt="" onError={hideBroken} /> : null}
                    </span>
                    <span className="uploaddock-row__text">
                      <span className="uploaddock-row__name">{item.file.name}</span>
                      <span className="uploaddock-row__sub">
                        {item.status === "error"
                          ? (item.errorMessage ?? t.errFailed)
                          : interpolate(item.status === "done" ? t.rowDone : current ? t.rowUploading : t.rowQueued, { size })}
                      </span>
                      {item.status === "error" ? (
                        <button type="button" className="uploaddock-row__retry" onClick={() => onRetry(item.id)}>
                          {t.retry}
                        </button>
                      ) : null}
                    </span>
                    <span className="uploaddock-row__status" aria-hidden>
                      {item.status === "done" ? (
                        <span className="uploaddock-status--done">
                          <CheckIcon size={13} />
                        </span>
                      ) : item.status === "error" ? (
                        <span className="uploaddock-status--error">!</span>
                      ) : current ? (
                        <span className="zipdock-spinner" />
                      ) : (
                        <span className="uploaddock-status--queued" />
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>

            {phase === "failed" ? (
              <div className="zipdock-actions">
                <button type="button" className="zipdock-btn zipdock-btn--ghost" onClick={onDismiss}>
                  {t.dismissFailed}
                </button>
                <button type="button" className="zipdock-btn zipdock-btn--gold zipdock-btn--wide" onClick={onRetryAll}>
                  {t.retryAll}
                </button>
              </div>
            ) : (
              <button type="button" className="zipdock-btn zipdock-btn--ghost zipdock-btn--block" onClick={onClose}>
                {ui.gallery.zipDockMinimize}
              </button>
            )}
          </section>
        </div>
      )}
    </>,
    document.body,
  );
}

function CheckIcon({ size }: Readonly<{ size: number }>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 12a8 8 0 0 1 13.7-5.6L20 9M20 4v5h-5M20 12a8 8 0 0 1-13.7 5.6L4 15M4 20v-5h5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function UploadZone({ eventId, onUploaded, disabled, ghost, label, celebrate }: Props) {
  const posthog = usePostHog();
  const ui = useAppUi();
  const t = ui.guestFlow;
  const tRef = useRef(t);
  // Files that succeeded since the queue last went idle; shown in the success moment.
  const batchDoneRef = useRef<File[]>([]);
  const [celebration, setCelebration] = useState<File[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const processingRef = useRef(false);
  const onUploadedRef = useRef(onUploaded);
  const queueRef = useRef(queue);
  const phase = uploadPillPhase(queue);

  useEffect(() => { onUploadedRef.current = onUploaded; tRef.current = t; queueRef.current = queue; });
  useEffect(() => () => queueRef.current.forEach(revokePreview), []);

  const removeWhere = useCallback((drop: (item: UploadItem) => boolean) => {
    setQueue((prev) => {
      prev.filter(drop).forEach(revokePreview);
      return prev.filter((item) => !drop(item));
    });
  }, []);

  // All succeeded: the gold pill waits a moment, fades, then the finished items leave the queue.
  useEffect(
    () =>
      scheduleAutoHide(
        phase,
        logOpen,
        () => setLeaving(true),
        () => {
          removeWhere((item) => item.status === "done");
          setLeaving(false);
        },
      ),
    [phase, logOpen, removeWhere],
  );

  useEffect(() => {
    if (processingRef.current || disabled) return;
    const pending = queue.find((item) => item.status === "pending");
    if (!pending) return;

    processingRef.current = true;

    const isVideo = pending.file.type.startsWith("video/");
    const upload = isVideo ? uploadVideoDirect(eventId, pending.file) : uploadPhotoViaApi(eventId, pending.file);

    Promise.resolve()
      .then(() => {
        setUploadingId(pending.id);
        return upload;
      })
      .then((result) => {
        if (!result.ok) {
          setQueue((prev) =>
            prev.map((item) =>
              item.id === pending.id
                ? { ...item, status: "error", errorMessage: mapUploadError(result.status, result.body, tRef.current, pending.file.type) }
                : item,
            ),
          );
        } else {
          setQueue((prev) => prev.map((item) => (item.id === pending.id ? { ...item, status: "done" } : item)));
          batchDoneRef.current.push(pending.file);
          posthog.capture(ANALYTICS_EVENTS.GUEST_MEDIA_UPLOADED, {
            event_id: eventId,
            file_type: isVideo ? "video" : "photo",
            file_size_mb: Math.round(pending.file.size / 1024 / 1024 * 10) / 10,
          });
          onUploadedRef.current();
        }
      })
      .catch(() => {
        setQueue((prev) =>
          prev.map((item) =>
            item.id === pending.id
              ? { ...item, status: "error", errorMessage: tRef.current.errConnection }
              : item,
          ),
        );
      })
      .finally(() => {
        processingRef.current = false;
        setUploadingId(null);
      });
  }, [queue, eventId, disabled]);

  // uploadingId clears after the last item settles, so this fires once per finished batch.
  useEffect(() => {
    if (uploadingId || queue.some((i) => i.status === "pending") || batchDoneRef.current.length === 0) return;
    const files = batchDoneRef.current;
    batchDoneRef.current = [];
    if (celebrate) setCelebration(files);
  }, [queue, uploadingId, celebrate]);

  const enqueue = useCallback(
    (files: File[]) => {
      if (disabled) return;
      const valid = files.filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"));
      if (valid.length === 0) return;
      setLeaving(false);
      const added = valid.map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        status: "pending" as const,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      }));
      setQueue((prev) => [...prev, ...added]);
    },
    [disabled],
  );

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    enqueue(Array.from(files));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFiles(e.dataTransfer.files);
  }

  function retryWhere(pick: (item: UploadItem) => boolean) {
    setQueue((prev) => prev.map((item) => (item.status === "error" && pick(item) ? { ...item, status: "pending", errorMessage: undefined } : item)));
  }

  const closeLog = useCallback(() => setLogOpen(false), []);

  const dropSurface = (() => {
    if (disabled) return { cursor: "not-allowed" as const, opacity: 0.5, border: "2px dashed color-mix(in srgb, var(--app-border) 70%, transparent)", background: "color-mix(in srgb, var(--app-surface-2) 40%, transparent)" };
    if (isDragging) return { cursor: "pointer" as const, border: "2px dashed color-mix(in srgb, var(--app-gold) 70%, transparent)", background: "color-mix(in srgb, var(--app-gold) 10%, transparent)" };
    return { cursor: "pointer" as const, border: "2px dashed var(--app-border-strong)", background: "var(--app-surface-2)" };
  })();

  const sharedDropHandlers = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); if (!disabled) setIsDragging(true); },
    onDragLeave: () => setIsDragging(false),
    onDrop: handleDrop,
    onClick: () => { if (!disabled) inputRef.current?.click(); },
  };

  const fileInput = (
    <input ref={inputRef} type="file" accept="image/*,video/*" multiple disabled={disabled} className="sr-only" onChange={(e) => handleFiles(e.target.files)} />
  );

  const portalElements = (
    <>
      <UploadDock
        queue={queue}
        phase={phase}
        leaving={leaving}
        open={logOpen}
        onOpen={() => setLogOpen(true)}
        onClose={closeLog}
        onRetry={(id) => retryWhere((item) => item.id === id)}
        onRetryAll={() => {
          retryWhere(() => true);
          setLogOpen(false);
        }}
        onDismiss={() => {
          // Dismissing failures ends the batch: the finished ones are already in the album.
          removeWhere((item) => item.status !== "pending");
          setLogOpen(false);
        }}
      />
      {celebration ? (
        <UploadSuccess
          files={celebration}
          onClose={() => setCelebration(null)}
          onAddMore={() => {
            setCelebration(null);
            inputRef.current?.click();
          }}
        />
      ) : null}
    </>
  );

  if (ghost) {
    return (
      <div style={{ position: "absolute", inset: 0, zIndex: 10, overflow: "visible" }}>
        <div
          {...sharedDropHandlers}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={label}
          aria-disabled={disabled || undefined}
          onKeyDown={(e) => {
            if (!disabled && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          style={{
            position: "absolute",
            inset: 0,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: 0,
            background: isDragging ? "rgba(197,146,42,0.15)" : "transparent",
            transition: "background 0.15s",
            zIndex: 10,
          }}
        >
          {fileInput}
        </div>
        {portalElements}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        {...sharedDropHandlers}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, borderRadius: 20, padding: "40px 24px", textAlign: "center", transition: "border-color 0.2s, background 0.2s", ...dropSurface }}
      >
        <span style={{ fontSize: "1.875rem" }}>📷</span>
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--app-text)" }}>{ui.upload.dropPrompt}</p>
        <p style={{ fontSize: 12, color: "var(--app-subtle)" }}>{ui.upload.tapBrowse}</p>
        {fileInput}
      </div>
      {portalElements}
    </div>
  );
}
