"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useAppUi } from "@/components/AppUiProvider";
import { Aurora, AuroraSays } from "@/components/app-ui/Aurora";
import { interpolate } from "@/lib/app-ui";

type Props = {
  files: File[];
  onAddMore: () => void;
  onClose: () => void;
};

// Back-left, back-right, front: positions relative to the stack's horizontal center.
const PRINTS = [
  { left: -138, top: 26, width: 180, height: 200, rotate: -9 },
  { left: -36, top: 6, width: 180, height: 200, rotate: 8 },
  { left: -98, top: 40, width: 196, height: 232, rotate: -2 },
];

/** Peak-end moment after a guest's upload batch lands: their own photos as prints, Aurora cheering. */
export function UploadSuccess({ files, onAddMore, onClose }: Props) {
  const ui = useAppUi();
  const primaryRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  // Photos first so the front print is a real photo whenever there is one.
  const shown = [...files].sort((a, b) => Number(b.type.startsWith("image/")) - Number(a.type.startsWith("image/"))).slice(0, 3).reverse();
  const [urls, setUrls] = useState<(string | null)[]>([]);

  useEffect(() => {
    const next = shown.map((f) => (f.type.startsWith("image/") ? URL.createObjectURL(f) : null));
    setUrls(next);
    return () => next.forEach((u) => u && URL.revokeObjectURL(u));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    primaryRef.current?.focus();
    return () => previous?.focus?.();
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    const focusables = dialogRef.current?.querySelectorAll<HTMLElement>("button");
    if (!focusables || focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const slots = PRINTS.slice(PRINTS.length - shown.length);
  const body = files.length === 1 ? ui.aurora.uploadedBodyOne : interpolate(ui.aurora.uploadedBodyMany, { count: files.length });

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-success-title"
      aria-describedby="upload-success-body"
      onKeyDown={onKeyDown}
      className="join-shell guest-success"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9100,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "max(40px, env(safe-area-inset-top, 0px)) 20px calc(24px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div aria-hidden className="guest-success__glow" />

      <div className="guest-success__stack" role="img" aria-label={ui.guestFlow.successPhotosAlt} style={{ position: "relative", width: "100%", maxWidth: 360, height: 284, flexShrink: 0 }}>
        <div style={{ position: "absolute", left: "50%", top: 0 }}>
          {slots.map((p, i) => {
            const style: React.CSSProperties = { position: "absolute", left: p.left, top: p.top, width: p.width, height: p.height, transform: `rotate(${p.rotate}deg)` };
            const url = urls[i];
            if (!url && shown[i]?.type.startsWith("image/")) return <div key={i} className="print-photo" style={style} />;
            return url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt="" className="print-photo" style={style} />
            ) : (
              <div key={i} className="print-photo" style={{ ...style, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--app-muted)" }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
              </div>
            );
          })}
        </div>
      </div>

      <Aurora pose="happy" size={200} className="guest-success__aurora" style={{ marginTop: -36, position: "relative" }} />

      <div className="guest-success__copy" style={{ position: "relative", maxWidth: 330, textAlign: "center", marginTop: 6 }}>
        <div id="upload-success-title">
          <AuroraSays size={26} style={{ lineHeight: 1.15 }}>{ui.aurora.uploadedTitle}</AuroraSays>
        </div>
        <p id="upload-success-body" style={{ margin: "12px 0 0", fontSize: 15, lineHeight: 1.45, color: "var(--app-text-sub)" }}>
          {body}
        </p>
      </div>

      <div className="guest-success__actions" style={{ position: "relative", width: "100%", maxWidth: 440, marginTop: "auto", paddingTop: 28, display: "flex", flexDirection: "column", gap: 10 }}>
        <button ref={primaryRef} type="button" className="app-btn app-btn--gold app-btn--lg" style={{ width: "100%", minHeight: 56, fontSize: 17 }} onClick={onAddMore}>
          {ui.aurora.addMore}
        </button>
        <button type="button" className="app-btn app-btn--secondary app-btn--lg" style={{ width: "100%", minHeight: 52 }} onClick={onClose}>
          {ui.aurora.seeAlbum}
        </button>
      </div>
    </div>,
    document.body,
  );
}
