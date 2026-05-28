"use client";

import { useEffect, useRef, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

type Props = Readonly<{
  eventId: string;
  savedPhotoPath: string;
  savedCropX: string;
  savedCropY: string;
  savedCropScale: string;
  uploadLabel: string;
  changeLabel: string;
  uploadingLabel: string;
  uploadErrorLabel: string;
  onPathChange: (path: string) => void;
  onCropChange: (x: string, y: string, scale: string) => void;
  onPreviewUrlChange: (url: string | null) => void;
}>;

const CIRCLE_PX = 200;

export function InvitePhotoUpload({
  eventId,
  savedPhotoPath,
  savedCropX,
  savedCropY,
  savedCropScale,
  uploadLabel,
  changeLabel,
  uploadingLabel,
  uploadErrorLabel,
  onPathChange,
  onCropChange,
  onPreviewUrlChange,
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropX, setCropX] = useState(parseFloat(savedCropX) || 0);
  const [cropY, setCropY] = useState(parseFloat(savedCropY) || 0);
  const [cropScale, setCropScale] = useState(parseFloat(savedCropScale) || 1);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; baseCropX: number; baseCropY: number } | null>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const cropXRef = useRef(cropX);
  const cropYRef = useRef(cropY);
  cropXRef.current = cropX;
  cropYRef.current = cropY;

  useEffect(() => {
    if (!savedPhotoPath) return;
    const supabase = getSupabaseBrowserClient();
    void supabase.storage
      .from("event-media")
      .createSignedUrl(savedPhotoPath, 3600)
      .then(({ data }: { data: { signedUrl: string } | null; error: unknown }) => {
        if (data?.signedUrl) {
          setPreviewUrl(data.signedUrl);
          onPreviewUrlChange(data.signedUrl);
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedPhotoPath]);

  useEffect(() => {
    setCropX(parseFloat(savedCropX) || 0);
    setCropY(parseFloat(savedCropY) || 0);
    setCropScale(parseFloat(savedCropScale) || 1);
  }, [savedCropX, savedCropY, savedCropScale]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    function handleWheel(e: WheelEvent) {
      e.preventDefault();
      setCropScale((prev) => {
        const next = Math.max(0.5, Math.min(5, prev - e.deltaY * 0.002));
        onCropChange(String(cropXRef.current), String(cropYRef.current), String(next));
        return next;
      });
    }
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFile(file: File) {
    setUploadError(null);
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    blobUrlRef.current = URL.createObjectURL(file);
    const blob = blobUrlRef.current;
    setPreviewUrl(blob);
    onPreviewUrlChange(blob);
    setCropX(0);
    setCropY(0);
    setCropScale(1);
    onCropChange("0", "0", "1");

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/events/${eventId}/invite-photo-upload`, {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as { path?: string; error?: string };
      if (!res.ok || !json.path) throw new Error(json.error ?? "Upload failed");
      onPathChange(json.path);
    } catch {
      setUploadError(uploadErrorLabel);
    } finally {
      setUploading(false);
    }
  }

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, baseCropX: cropX, baseCropY: cropY };
    setIsDragging(true);
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragRef.current) return;
    const newX = dragRef.current.baseCropX + (e.clientX - dragRef.current.startX);
    const newY = dragRef.current.baseCropY + (e.clientY - dragRef.current.startY);
    setCropX(newX);
    setCropY(newY);
    onCropChange(String(newX), String(newY), String(cropScale));
  }

  function onMouseUp() {
    dragRef.current = null;
    setIsDragging(false);
  }

  const fileInput = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      style={{ display: "none" }}
      onChange={(e) => {
        const f = e.target.files?.[0];
        if (f) void handleFile(f);
        e.target.value = "";
      }}
    />
  );

  if (!previewUrl) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          style={{
            width: CIRCLE_PX,
            height: CIRCLE_PX,
            borderRadius: "50%",
            border: "2px dashed var(--app-gold)",
            background: "transparent",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            color: "var(--app-gold)",
          }}
          aria-label={uploadLabel}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{uploadLabel}</span>
        </button>
        {fileInput}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div
        ref={circleRef}
        style={{
          width: CIRCLE_PX,
          height: CIRCLE_PX,
          borderRadius: "50%",
          overflow: "hidden",
          position: "relative",
          cursor: isDragging ? "grabbing" : "grab",
          border: "2px solid var(--app-gold)",
          flexShrink: 0,
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <img
          src={previewUrl}
          alt=""
          draggable={false}
          style={{
            position: "absolute",
            width: `${cropScale * 100}%`,
            height: `${cropScale * 100}%`,
            objectFit: "cover",
            top: "50%",
            left: "50%",
            transform: `translate(calc(-50% + ${cropX}px), calc(-50% + ${cropY}px))`,
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
        {uploading ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
            }}
          >
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{uploadingLabel}</span>
          </div>
        ) : null}
      </div>

      {uploadError ? (
        <p style={{ fontSize: 11, color: "var(--app-danger)", margin: 0 }}>{uploadError}</p>
      ) : null}

      <p style={{ fontSize: 10, color: "var(--app-muted)", margin: 0, textAlign: "center" }}>
        Drag to reposition · Scroll to zoom
      </p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        style={{
          fontSize: 12,
          color: "var(--app-gold)",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontWeight: 600,
          padding: 0,
        }}
      >
        {changeLabel}
      </button>
      {fileInput}
    </div>
  );
}
