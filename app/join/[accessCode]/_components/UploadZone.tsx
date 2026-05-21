"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  /** When true the drop zone renders as an invisible overlay so a parent can act as the visual affordance. The upload queue floats below the parent. */
  ghost?: boolean;
};

function mapUploadError(status: number, raw: unknown): string {
  if (status === 403 && typeof raw === "object" && raw !== null && "error" in raw) {
    const code = (raw as { error?: string }).error;
    if (code === "UPLOADS_CLOSED") {
      return "Uploads are closed for this event.";
    }
    if (code === "QUOTA_REACHED") {
      return "This event has reached its photo or video limit.";
    }
  }
  if (status === 401) return "Please sign in to upload.";
  if (status === 415) return "Only image and video files are supported.";
  return "Upload failed.";
}

export function UploadZone({ eventId, onUploaded, disabled, ghost }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const processingRef = useRef(false);
  const onUploadedRef = useRef(onUploaded);

  useEffect(() => {
    onUploadedRef.current = onUploaded;
  });

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
        return fetch(`/api/events/${eventId}/guest-upload`, {
          method: "POST",
          body: formData,
        });
      })
      .then(async (res) => {
        if (res.status === 429 || res.status === 403 || res.status === 401 || res.status === 415) {
          const body = await res.json().catch(() => ({}));
          setQueue((prev) =>
            prev.map((item) =>
              item.id === pending.id
                ? {
                    ...item,
                    status: "error",
                    errorMessage: mapUploadError(res.status, body),
                  }
                : item,
            ),
          );
        } else if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setQueue((prev) =>
            prev.map((item) =>
              item.id === pending.id ? { ...item, status: "error", errorMessage: mapUploadError(res.status, body) } : item,
            ),
          );
        } else {
          setQueue((prev) => prev.map((item) => (item.id === pending.id ? { ...item, status: "done" } : item)));
          onUploadedRef.current();
        }
      })
      .catch(() => {
        setQueue((prev) =>
          prev.map((item) =>
            item.id === pending.id ? { ...item, status: "error", errorMessage: "Network error." } : item,
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

  const dropSurface = (() => {
    if (disabled) {
      return {
        cursor: "not-allowed" as const,
        opacity: 0.5,
        border: "2px dashed color-mix(in srgb, var(--app-border) 70%, transparent)",
        background: "color-mix(in srgb, var(--app-surface-2) 40%, transparent)",
      };
    }
    if (isDragging) {
      return {
        cursor: "pointer" as const,
        border: "2px dashed color-mix(in srgb, var(--app-gold) 70%, transparent)",
        background: "color-mix(in srgb, var(--app-gold) 10%, transparent)",
      };
    }
    return {
      cursor: "pointer" as const,
      border: "2px dashed var(--app-border-strong)",
      background: "var(--app-surface-2)",
    };
  })();

  const sharedDropHandlers = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); if (!disabled) setIsDragging(true); },
    onDragLeave: () => setIsDragging(false),
    onDrop: handleDrop,
    onClick: () => { if (!disabled) inputRef.current?.click(); },
  };

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*,video/*"
      multiple
      disabled={disabled}
      className="sr-only"
      onChange={(e) => handleFiles(e.target.files)}
    />
  );

  const queue_list = queue.length > 0 ? (
    <ul style={{ display: "flex", flexDirection: "column", gap: 8, margin: 0, padding: 0, listStyle: "none" }}>
      {queue.map((item) => {
        const isUploading = item.status === "pending" && item.id === uploadingId;
        return (
          <li
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              borderRadius: 12,
              border: "1.5px solid var(--app-border)",
              background: "var(--app-surface)",
              padding: "8px 16px",
              fontSize: 14,
            }}
          >
            <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--app-text)" }}>
              {item.file.name}
            </span>
            <span
              style={{
                flexShrink: 0,
                fontWeight: 600,
                color:
                  item.status === "done"
                    ? "var(--app-success)"
                    : item.status === "error"
                      ? "var(--app-danger)"
                      : "var(--app-muted)",
              }}
            >
              {item.status === "done" && "✓"}
              {item.status === "error" && (item.errorMessage ?? "Error")}
              {isUploading && "Uploading…"}
              {item.status === "pending" && !isUploading && "Pending"}
            </span>
          </li>
        );
      })}
    </ul>
  ) : null;

  if (ghost) {
    return (
      // Invisible overlay that covers the parent (parent must be position:relative).
      // The queue floats below it so upload progress remains visible.
      <div style={{ position: "absolute", inset: 0, zIndex: 10, overflow: "visible" }}>
        <div
          {...sharedDropHandlers}
          style={{
            position: "absolute",
            inset: 0,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: 0,
            // Show a faint gold tint on drag-over so users get feedback through the parent
            background: isDragging ? "rgba(197,146,42,0.15)" : "transparent",
            transition: "background 0.15s",
            zIndex: 10,
          }}
        >
          {fileInput}
        </div>
        {queue_list ? (
          <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 20 }}>
            {queue_list}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div
        {...sharedDropHandlers}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          borderRadius: 20,
          padding: "40px 24px",
          textAlign: "center",
          transition: "border-color 0.2s, background 0.2s",
          ...dropSurface,
        }}
      >
        <span style={{ fontSize: "1.875rem" }}>📷</span>
        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--app-text)" }}>Drag &amp; drop photos or videos here</p>
        <p style={{ fontSize: 12, color: "var(--app-subtle)" }}>or tap to browse</p>
        {fileInput}
      </div>
      {queue_list}
    </div>
  );
}
