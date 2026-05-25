"use client";

import { useState } from "react";
import type { DemoPhoto } from "../_data/demo-event";
import { useDemoToast } from "./DemoToastProvider";
import { MediaLikeBadge } from "@/components/app-ui/MediaLikeBadge";
import { MediaUploaderChip } from "@/components/app-ui/MediaUploaderChip";

type Props = {
  canManage?: boolean;
  columns: number;
  photos: DemoPhoto[];
};

export function DemoMediaGrid({ canManage = false, columns, photos }: Props) {
  const { triggerDemoToast } = useDemoToast();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [liked, setLiked] = useState<Set<string>>(() => new Set());
  const [likeCounts, setLikeCounts] = useState<Map<string, number>>(
    () => new Map(photos.map((p) => [p.src, p.likeCount])),
  );

  function handleToggleLike(src: string) {
    triggerDemoToast();
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(src)) next.delete(src);
      else next.add(src);
      return next;
    });
    setLikeCounts((prev) => {
      const next = new Map(prev);
      const was = next.get(src) ?? 0;
      next.set(src, liked.has(src) ? Math.max(0, was - 1) : was + 1);
      return next;
    });
  }

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 4, alignItems: "start" }}>
        {photos.map((photo) => (
          <div
            key={photo.src}
            onClick={() => setLightboxSrc(photo.src)}
            style={{ position: "relative", borderRadius: 8, overflow: "hidden", cursor: "pointer" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={`Photo by ${photo.uploadedBy}`}
              loading="lazy"
              decoding="async"
              style={{ display: "block", width: "100%", height: "auto", transition: "transform 0.35s" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />

            {/* Bottom bar */}
            <div
              style={{
                position: "absolute",
                inset: "auto 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 4,
                padding: "40px 10px 10px",
                background: "linear-gradient(transparent, rgba(0,0,0,0.72))",
              }}
            >
              <MediaUploaderChip label={photo.uploadedBy} isMine={false} mineAria="" />
              {canManage && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); triggerDemoToast(); }}
                  style={{
                    flexShrink: 0,
                    background: "rgba(0,0,0,0.52)",
                    border: "1px solid rgba(255,255,255,0.14)",
                    borderRadius: 20,
                    padding: "3px 9px",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.88)",
                    cursor: "pointer",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    fontFamily: "inherit",
                  }}
                >
                  Delete
                </button>
              )}
            </div>

            {/* Like badge */}
            <div style={{ position: "absolute", top: 10, right: 10, zIndex: 1 }} onClick={(e) => e.stopPropagation()}>
              <MediaLikeBadge
                liked={liked.has(photo.src)}
                count={likeCounts.get(photo.src) ?? photo.likeCount}
                pending={false}
                likeAria="Like photo"
                unlikeAria="Unlike photo"
                onToggle={() => handleToggleLike(photo.src)}
              />
            </div>
          </div>
        ))}
      </div>

      {lightboxSrc && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background: "rgba(0,0,0,0.88)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setLightboxSrc(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxSrc}
            alt="Full size"
            style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12, objectFit: "contain" }}
          />
        </div>
      )}
    </>
  );
}
