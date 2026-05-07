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

export function UploadZone({ eventId, onUploaded, disabled }: Props) {
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
              item.id === pending.id
                ? { ...item, status: "error", errorMessage: mapUploadError(res.status, body) }
                : item,
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

  const enqueue = useCallback((files: File[]) => {
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
  }, [disabled]);

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

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled) inputRef.current?.click();
        }}
        className={`flex flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed px-6 py-10 text-center transition ${
          disabled
            ? "cursor-not-allowed border-white/10 bg-white/[0.02] opacity-50"
            : `cursor-pointer ${isDragging ? "border-amber-400 bg-amber-400/10" : "border-white/20 bg-white/5 hover:border-white/40"}`
        }`}
      >
        <span className="text-3xl">📷</span>
        <p className="text-sm font-semibold text-zinc-300">Drag &amp; drop photos or videos here</p>
        <p className="text-xs text-zinc-500">or tap to browse</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          disabled={disabled}
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {queue.length > 0 && (
        <ul className="flex flex-col gap-2">
          {queue.map((item) => {
            const isUploading = item.status === "pending" && item.id === uploadingId;
            return (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
              >
                <span className="min-w-0 truncate text-zinc-300">{item.file.name}</span>
                <span
                  className={`shrink-0 font-semibold ${
                    item.status === "done"
                      ? "text-emerald-400"
                      : item.status === "error"
                        ? "text-red-400"
                        : "text-zinc-400"
                  }`}
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
      )}
    </div>
  );
}
