"use client";

import type { ReactNode } from "react";

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

export function PhotoLightbox({
  signedUrl,
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
  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={copy.lightboxAria}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 24,
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", maxWidth: 800, maxHeight: "85vh" }}>
        {signedUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={signedUrl}
            alt=""
            style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: 16, display: "block" }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {toggleError || secondaryError ? (
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <button
                type="button"
                aria-label={likedByMe ? copy.heartUnlikeAria : copy.heartLikeAria}
                aria-pressed={likedByMe}
                disabled={togglePending}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLike();
                }}
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
              <span
                style={{
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  background: "rgba(0,0,0,0.5)",
                  padding: "6px 14px",
                  borderRadius: 20,
                }}
              >
                {copy.likeCount(likeCount)}
              </span>
              {uploaderLabel ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: 600,
                    minWidth: 0,
                    maxWidth: "100%",
                    filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.55))",
                  }}
                >
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
                    <li key={liker.userId} style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>
                      {liker.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          aria-label={copy.closeLightboxAria}
          onClick={onClose}
          style={{
            position: "absolute",
            top: -14,
            right: -14,
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
