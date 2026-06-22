"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import type { LikerRow } from "@/lib/media-likes";
import { LikeHeartIcon } from "@/components/app-ui/LikeHeartIcon";
import { UserIcon } from "@/components/app-ui/UserIcon";

export type PhotoLightboxCopy = Readonly<{
  lightboxAria: string;
  closeLightboxAria: string;
  heartLikeAria: string;
  heartUnlikeAria: string;
  likeCount: (count: number) => string;
  likersHeading: string;
  likersEmpty: string;
  toggleFail: string;
}>;

type Props = Readonly<{
  signedUrl: string | undefined;
  mimeType?: string | null;
  likeCount: number;
  likedByMe: boolean;
  canViewLikers: boolean;
  likers: LikerRow[];
  likersLoading: boolean;
  togglePending: boolean;
  toggleError: string | null;
  copy: PhotoLightboxCopy;
  onClose: () => void;
  onToggleLike: () => void;
  footerActions?: ReactNode;
  uploaderLabel?: string;
  isMineUpload?: boolean;
  uploadedByYouAria?: string;
  secondaryError?: string | null;
}>;

const AUTO_HIDE_MS = 3000;

export function PhotoLightbox({
  signedUrl,
  mimeType,
  likeCount,
  likedByMe,
  canViewLikers,
  likers,
  likersLoading,
  togglePending,
  toggleError,
  copy,
  onClose,
  onToggleLike,
  footerActions,
  uploaderLabel,
  isMineUpload = false,
  uploadedByYouAria,
  secondaryError,
}: Props) {
  const isVideo = Boolean(mimeType?.startsWith("video/"));
  const [controlsVisible, setControlsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => setControlsVisible(false), AUTO_HIDE_MS);
  }, [clearTimer]);

  useEffect(() => { setMounted(true); }, []);

  // Auto-hide on mount
  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer, clearTimer]);

  function handleOverlayClick() {
    setControlsVisible(prev => {
      if (!prev) { startTimer(); return true; }
      clearTimer(); return false;
    });
  }

  // Stops propagation so clicks on control bars don't toggle visibility,
  // but resets the auto-hide timer to keep controls up during interaction.
  function handleControlsClick(e: React.MouseEvent) {
    e.stopPropagation();
    startTimer();
  }

  const controlsStyle: React.CSSProperties = {
    opacity: controlsVisible ? 1 : 0,
    transition: "opacity 0.2s",
    pointerEvents: controlsVisible ? "auto" : "none",
  };

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.lightboxAria}
      onClick={handleOverlayClick}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10, 8, 14, 0.6)",
        backdropFilter: "blur(32px) saturate(150%)",
        WebkitBackdropFilter: "blur(32px) saturate(150%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        cursor: "pointer",
      }}
    >
      {/* ── Media ── */}
      {signedUrl ? (
        isVideo ? (
          <video
            src={signedUrl}
            controls
            playsInline
            style={{ maxWidth: "100vw", maxHeight: "100vh", display: "block" }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={signedUrl}
            alt=""
            style={{ maxWidth: "100vw", maxHeight: "100vh", display: "block", objectFit: "contain" }}
          />
        )
      ) : null}

      {/* ── Close button — always visible, exempt from controls auto-hide ── */}
      <button
        type="button"
        aria-label={copy.closeLightboxAria}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.55)",
          border: "1px solid rgba(255,255,255,0.18)",
          color: "#fff",
          cursor: "pointer",
          fontSize: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        ×
      </button>

      {/* ── Footer bar — like, uploader, actions, likers ── */}
      <div
        style={{
          ...controlsStyle,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "48px 16px 28px",
          background: "linear-gradient(transparent, rgba(0,0,0,0.78))",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
        onClick={handleControlsClick}
      >
        {(toggleError ?? secondaryError) ? (
          <div
            role="alert"
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#fde8e8",
              background: "rgba(180,30,40,0.75)",
              padding: "8px 12px",
              borderRadius: 12,
            }}
          >
            {toggleError ?? secondaryError}
          </div>
        ) : null}

        {canViewLikers ? (
          <div
            style={{
              background: "rgba(0,0,0,0.55)",
              borderRadius: 14,
              padding: "10px 14px",
              maxHeight: 120,
              overflowY: "auto",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)", marginBottom: 8 }}>
              {copy.likersHeading}
            </div>
            {likersLoading ? (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>…</div>
            ) : likers.length === 0 ? (
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{copy.likersEmpty}</div>
            ) : (
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
                {likers.map((liker) => (
                  <li key={liker.userId} style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{liker.label}</li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <button
              type="button"
              aria-label={likedByMe ? copy.heartUnlikeAria : copy.heartLikeAria}
              aria-pressed={likedByMe}
              disabled={togglePending}
              onClick={(e) => { e.stopPropagation(); startTimer(); onToggleLike(); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "none",
                cursor: togglePending ? "wait" : "pointer",
                color: likedByMe ? "#f43f5e" : "#fff",
                background: "rgba(0,0,0,0.5)",
                opacity: togglePending ? 0.7 : 1,
              }}
            >
              <LikeHeartIcon filled={likedByMe} />
            </button>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 600, background: "rgba(0,0,0,0.5)", padding: "6px 14px", borderRadius: 20 }}>
              {copy.likeCount(likeCount)}
            </span>
            {uploaderLabel ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#fff", fontSize: 14, fontWeight: 600, minWidth: 0, maxWidth: "100%", filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.55))" }}>
                {isMineUpload ? (
                  <span aria-label={uploadedByYouAria} title={uploadedByYouAria} style={{ display: "flex", flexShrink: 0 }}>
                    <UserIcon size={14} />
                  </span>
                ) : null}
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{uploaderLabel}</span>
              </span>
            ) : null}
          </div>
          {footerActions}
        </div>
      </div>
    </div>,
    document.body
  );
}
