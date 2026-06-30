"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePostHog } from "posthog-js/react";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";

type UploadItem = {
  id: string;
  file: File;
  status: "pending" | "done" | "error";
  errorMessage?: string;
};

type Props = {
  eventId: string;
  onUploaded: () => void;
  disabled?: boolean;
  /** When true the drop zone renders as an invisible overlay so a parent can act as the visual affordance. */
  ghost?: boolean;
};

function mapUploadError(status: number, raw: unknown, mimeType?: string): string {
  const code = typeof raw === "object" && raw !== null && "error" in raw
    ? (raw as { error?: string }).error
    : undefined;

  switch (status) {
    case 401:
      return "You're not signed in. Please sign in and try again.";

    case 400:
      if (code === "Invalid form data.") return "The file couldn't be read by the server. Try selecting it again.";
      if (code === "No file provided.")  return "No file was attached to the request. Please try again.";
      return "The upload request was invalid. Please try again.";

    case 403:
      if (code === "UPLOADS_CLOSED")
        return "The upload window for this event has closed. New files can no longer be added by guests.";
      if (code === "QUOTA_REACHED")
        return "This event has reached its media limit. The organizer's plan doesn't allow any more photos or videos.";
      return "You don't have permission to upload to this event.";

    case 404:
      return "Event not found. It may have been deleted or the link is incorrect.";

    case 413: {
      const isVideo = mimeType?.startsWith("video/");
      return isVideo
        ? "This video is too large. Videos must be under 280 MB."
        : "This photo is too large. Photos must be under 35 MB.";
    }

    case 415:
      return "Unsupported file type. Only photos (JPG, PNG, HEIC, WebP…) and videos (MP4, MOV, WebM…) are accepted.";

    case 429:
      return "Too many uploads at once. Please wait a moment and try again.";

    case 500:
      if (code === "Upload failed.")       return "The file reached the server but couldn't be saved to storage. Please try again.";
      if (code === "Failed to save upload.") return "The file was stored but couldn't be recorded. Please try again.";
      return "A server error occurred. Please try again in a moment.";

    default:
      return `Upload failed (HTTP ${status}). Please try again.`;
  }
}

// ── Spinner SVG ───────────────────────────────────────────────────────────────
function Spinner({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden style={{ animation: "uz-spin 0.75s linear infinite", flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ── Status icon ───────────────────────────────────────────────────────────────
function StatusIcon({ status, isUploading }: { status: UploadItem["status"]; isUploading: boolean }) {
  if (isUploading) return <Spinner size={14} color="var(--app-gold, #C5922A)" />;
  if (status === "done")  return <span style={{ color: "var(--app-success, #4caf50)", fontSize: 14, lineHeight: 1 }}>✓</span>;
  if (status === "error") return <span style={{ color: "var(--app-danger, #e04a4a)", fontSize: 14, lineHeight: 1 }}>✕</span>;
  return <span style={{ color: "var(--app-muted)", fontSize: 11 }}>···</span>;
}

// ── Upload log popup (portalled) ──────────────────────────────────────────────
function UploadLog({
  queue,
  open,
  onClose,
  onRetry,
  onClearDone,
  expandedId,
  onToggleExpand,
}: {
  queue: UploadItem[];
  open: boolean;
  onClose: () => void;
  onRetry: (id: string) => void;
  onClearDone: () => void;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
}) {
  const hasDone   = queue.some((i) => i.status === "done");
  const hasErrors = queue.some((i) => i.status === "error");
  const uploading = queue.filter((i) => i.status === "pending");
  const done      = queue.filter((i) => i.status === "done").length;
  const total     = queue.length;

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9000,
          background: open ? "rgba(0,0,0,0.45)" : "transparent",
          backdropFilter: open ? "blur(2px)" : "none",
          pointerEvents: open ? "auto" : "none",
          transition: "background 200ms, backdrop-filter 200ms",
        }}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Upload log"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9001,
          transform: open ? "translateY(0)" : "translateY(110%)",
          transition: "transform 280ms cubic-bezier(0.32, 0.72, 0, 1)",
          background: "var(--app-surface, #1a1410)",
          borderRadius: "20px 20px 0 0",
          border: "1px solid var(--app-border, rgba(255,255,255,0.1))",
          borderBottom: "none",
          boxShadow: "0 -12px 40px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "72vh",
          paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: "var(--app-border-strong, rgba(255,255,255,0.2))" }} />
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 18px 12px", borderBottom: "1px solid var(--app-border)" }}>
          <div>
            <span style={{ fontFamily: "var(--font-display, serif)", fontStyle: "italic", fontWeight: 700, fontSize: 18, color: "var(--app-text)" }}>
              Upload log
            </span>
            <span style={{ marginLeft: 10, fontSize: 11, color: "var(--app-muted)", fontWeight: 600 }}>
              {done}/{total}
              {hasErrors ? ` · ${queue.filter(i => i.status === "error").length} failed` : ""}
              {uploading.length > 0 ? " · uploading…" : ""}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {hasDone && (
              <button
                type="button"
                onClick={onClearDone}
                style={{ fontSize: 11, fontWeight: 600, color: "var(--app-muted)", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: 6 }}
              >
                Clear done
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close upload log"
              style={{ width: 28, height: 28, borderRadius: 8, background: "var(--app-surface-2)", border: "1px solid var(--app-border)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--app-muted)", fontSize: 16 }}
            >
              ×
            </button>
          </div>
        </div>

        {/* File list */}
        <div style={{ overflowY: "auto", flex: 1, padding: "8px 12px" }}>
          {queue.map((item, i) => {
            const isUploading = item.status === "pending" && i === queue.findIndex(q => q.status === "pending");
            const isExpanded  = expandedId === item.id;
            const isError     = item.status === "error";

            return (
              <div key={item.id}>
                <div
                  onClick={() => isError && onToggleExpand(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 8px",
                    borderRadius: 10,
                    cursor: isError ? "pointer" : "default",
                    background: isExpanded ? "var(--app-surface-2)" : "transparent",
                    transition: "background 150ms",
                  }}
                >
                  <StatusIcon status={item.status} isUploading={isUploading} />
                  <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: "var(--app-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.file.name}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--app-muted)", flexShrink: 0, fontWeight: 600, letterSpacing: "0.04em" }}>
                    {(item.file.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                  {isError && (
                    <span style={{ fontSize: 11, color: "var(--app-muted)", flexShrink: 0 }}>
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  )}
                </div>

                {/* Expanded error row */}
                {isExpanded && isError && (
                  <div style={{ margin: "0 8px 6px", padding: "10px 12px", borderRadius: 8, background: "color-mix(in srgb, var(--app-danger, #e04a4a) 10%, var(--app-surface))", border: "1px solid color-mix(in srgb, var(--app-danger, #e04a4a) 30%, transparent)" }}>
                    <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--app-danger, #e04a4a)", lineHeight: 1.5 }}>
                      {item.errorMessage ?? "Upload failed."}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onRetry(item.id); }}
                      style={{
                        padding: "6px 14px",
                        borderRadius: 8,
                        border: "none",
                        background: "var(--app-gold, #C5922A)",
                        color: "#1b1208",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        letterSpacing: "0.02em",
                      }}
                    >
                      Retry
                    </button>
                  </div>
                )}

                {i < queue.length - 1 && (
                  <div style={{ height: 1, background: "var(--app-border)", margin: "0 8px", opacity: 0.5 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>,
    document.body,
  );
}

// ── Floating status button (portalled) ───────────────────────────────────────
function UploadStatusButton({ queue, onClick }: { queue: UploadItem[]; onClick: () => void }) {
  const done     = queue.filter((i) => i.status === "done").length;
  const errors   = queue.filter((i) => i.status === "error").length;
  const pending  = queue.filter((i) => i.status === "pending").length;
  const total    = queue.length;
  const isActive = pending > 0;

  if (typeof document === "undefined" || queue.length === 0) return null;

  const accent = errors > 0 ? "var(--app-danger, #e04a4a)" : isActive ? "var(--app-gold, #C5922A)" : "var(--app-success, #4caf50)";
  const label  = isActive
    ? `${done}/${total}`
    : errors > 0
      ? `${errors} failed`
      : `${done} uploaded`;

  return createPortal(
    <button
      type="button"
      onClick={onClick}
      aria-label={`Upload log: ${label}`}
      style={{
        position: "fixed",
        right: 18,
        bottom: "calc(92px + env(safe-area-inset-bottom, 0px))",
        zIndex: 8999,
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "9px 14px",
        borderRadius: 22,
        border: `1px solid ${accent}`,
        background: "var(--app-surface, #1a1410)",
        boxShadow: `0 4px 20px rgba(0,0,0,0.35), 0 0 0 1px ${accent}30`,
        cursor: "pointer",
        transition: "transform 180ms, box-shadow 180ms",
        fontFamily: "inherit",
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
    >
      {isActive ? (
        <Spinner size={13} color={accent} />
      ) : errors > 0 ? (
        <span style={{ fontSize: 13, color: accent, lineHeight: 1 }}>⚠</span>
      ) : (
        <span style={{ fontSize: 13, color: accent, lineHeight: 1 }}>✓</span>
      )}
      <span style={{ fontSize: 12, fontWeight: 700, color: accent, letterSpacing: "0.02em" }}>
        {label}
      </span>
      <span style={{ fontSize: 10, color: "var(--app-muted)", fontWeight: 500 }}>
        uploads
      </span>
    </button>,
    document.body,
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function UploadZone({ eventId, onUploaded, disabled, ghost }: Props) {
  const posthog = usePostHog();
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const processingRef = useRef(false);
  const onUploadedRef = useRef(onUploaded);

  useEffect(() => { onUploadedRef.current = onUploaded; });

  useEffect(() => {
    if (processingRef.current || disabled) return;
    const pending = queue.find((item) => item.status === "pending");
    if (!pending) return;

    processingRef.current = true;

    const formData = new FormData();
    formData.append("file", pending.file);

    Promise.resolve()
      .then(() => {
        setUploadingId(pending.id);
        return fetch(`/api/events/${eventId}/guest-upload`, { method: "POST", body: formData });
      })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setQueue((prev) =>
            prev.map((item) =>
              item.id === pending.id
                ? { ...item, status: "error", errorMessage: mapUploadError(res.status, body, pending.file.type) }
                : item,
            ),
          );
        } else {
          setQueue((prev) => prev.map((item) => (item.id === pending.id ? { ...item, status: "done" } : item)));
          posthog.capture(ANALYTICS_EVENTS.GUEST_MEDIA_UPLOADED, {
            event_id: eventId,
            file_type: pending.file.type.startsWith("video/") ? "video" : "photo",
            file_size_mb: Math.round(pending.file.size / 1024 / 1024 * 10) / 10,
          });
          onUploadedRef.current();
        }
      })
      .catch(() => {
        setQueue((prev) =>
          prev.map((item) =>
            item.id === pending.id
              ? { ...item, status: "error", errorMessage: "Connection lost. Check your internet and try again." }
              : item,
          ),
        );
      })
      .finally(() => {
        processingRef.current = false;
        setUploadingId(null);
      });
  }, [queue, eventId, disabled]);

  const enqueue = useCallback(
    (files: File[]) => {
      if (disabled) return;
      const valid = files.filter((f) => f.type.startsWith("image/") || f.type.startsWith("video/"));
      if (valid.length === 0) return;
      setQueue((prev) => [
        ...prev,
        ...valid.map((file) => ({
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
          file,
          status: "pending" as const,
        })),
      ]);
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

  function retryItem(id: string) {
    setQueue((prev) => prev.map((item) => item.id === id ? { ...item, status: "pending", errorMessage: undefined } : item));
    setExpandedId(null);
  }

  function clearDone() {
    setQueue((prev) => prev.filter((item) => item.status !== "done"));
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

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
      <style>{`@keyframes uz-spin { to { transform: rotate(360deg); } }`}</style>
      <UploadStatusButton queue={queue} onClick={() => setLogOpen(true)} />
      <UploadLog
        queue={queue}
        open={logOpen}
        onClose={() => setLogOpen(false)}
        onRetry={retryItem}
        onClearDone={clearDone}
        expandedId={expandedId}
        onToggleExpand={toggleExpand}
      />
    </>
  );

  if (ghost) {
    return (
      <div style={{ position: "absolute", inset: 0, zIndex: 10, overflow: "visible" }}>
        <div
          {...sharedDropHandlers}
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
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--app-text)" }}>Drag &amp; drop photos or videos here</p>
        <p style={{ fontSize: 12, color: "var(--app-subtle)" }}>or tap to browse</p>
        {fileInput}
      </div>
      {portalElements}
    </div>
  );
}
