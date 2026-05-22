"use client";

import { useState } from "react";
import { DEMO_PHOTOS } from "../_data/demo-event";
import { useDemoToast } from "./DemoToastProvider";

type Props = {
  canManage?: boolean;
};

export function DemoMediaGrid({ canManage = false }: Props) {
  const { triggerDemoToast } = useDemoToast();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  return (
    <>
      <div
        style={{
          columns: "2 160px",
          gap: 8,
        }}
      >
        {DEMO_PHOTOS.map((photo) => (
          <div
            key={photo.src}
            style={{
              position: "relative",
              marginBottom: 8,
              breakInside: "avoid",
              borderRadius: 10,
              overflow: "hidden",
              cursor: "pointer",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={`Photo by ${photo.uploadedBy}`}
              style={{ width: "100%", display: "block" }}
              onClick={() => setLightboxSrc(photo.src)}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "20px 8px 6px",
                background: "linear-gradient(transparent, rgba(0,0,0,0.55))",
                fontSize: 10,
                color: "rgba(255,255,255,0.8)",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
              }}
            >
              {photo.uploadedBy}
            </div>
            {canManage && (
              <button
                type="button"
                aria-label="Delete photo"
                onClick={(e) => { e.stopPropagation(); triggerDemoToast(); }}
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  border: "none",
                  background: "rgba(0,0,0,0.55)",
                  color: "#fff",
                  fontSize: 14,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ×
              </button>
            )}
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
