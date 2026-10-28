"use client";

import { useEffect, useRef } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { Aurora, AuroraSays } from "@/components/app-ui/Aurora";
import { interpolate } from "@/lib/app-ui";

export type ReviewItem = Readonly<{
  id: string;
  mime_type: string | null;
  created_at: string;
  signedUrl?: string;
  thumbnailUrl?: string;
  uploaderLabel: string;
}>;

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["second", 60],
  ["minute", 60],
  ["hour", 24],
  ["day", 7],
  ["week", 4.35],
  ["month", 12],
  ["year", Infinity],
];

export function relativeTime(iso: string, locale: string, now = Date.now()): string {
  let value = (Date.parse(iso) - now) / 1000;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  for (const [unit, size] of UNITS) {
    if (Math.abs(value) < size) return rtf.format(Math.round(value), unit);
    value /= size;
  }
  return "";
}

function PrintMedia({
  item,
  alt,
  style,
  peek = false,
}: Readonly<{ item: ReviewItem; alt: string; style: React.CSSProperties; peek?: boolean }>) {
  const isVideo = Boolean(item.mime_type?.startsWith("video/"));
  // The peeking card is decorative: never a focusable video, only its poster.
  const src = peek && isVideo ? item.thumbnailUrl : (item.signedUrl ?? item.thumbnailUrl);
  if (!src) return <div className="print-photo" style={style} />;
  if (isVideo && !peek) {
    return (
      <video
        className="print-photo"
        src={item.signedUrl}
        poster={item.thumbnailUrl}
        preload="metadata"
        playsInline
        controls
        aria-label={alt}
        style={{ ...style, background: "#000" }}
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="print-photo" src={src} alt={alt} style={style} />;
}

/** One-at-a-time moderation: the top pending photo as a tilted print, Keep or Hide. */
export function AlbumReview({
  current,
  next,
  position,
  total,
  busyId,
  error,
  onKeep,
  onHide,
  onApproveAll,
  onSeeAll,
}: Readonly<{
  current: ReviewItem | undefined;
  next: ReviewItem | undefined;
  position: number;
  total: number;
  busyId: string | null;
  error: string | null;
  onKeep: (id: string) => void;
  onHide: (id: string) => void;
  onApproveAll: () => void;
  onSeeAll: () => void;
}>) {
  const ui = useAppUi();
  const regionRef = useRef<HTMLDivElement>(null);
  const actedRef = useRef(false);

  // After Keep/Hide the pressed button gets disabled and loses focus: move focus to the next card.
  useEffect(() => {
    if (!actedRef.current) return;
    actedRef.current = false;
    regionRef.current?.focus();
  }, [current?.id]);

  const busy = busyId !== null;
  const act = (fn: (id: string) => void) => {
    if (!current || busy) return;
    actedRef.current = true;
    fn(current.id);
  };

  if (!current) {
    return (
      <div
        ref={regionRef}
        tabIndex={-1}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "28px 8px 0", outline: "none" }}
      >
        <Aurora pose="happy" size={140} />
        <AuroraSays size={22} style={{ margin: "14px 0 20px", maxWidth: 300 }}>
          {ui.aurora.reviewDone}
        </AuroraSays>
        <AppBtn type="button" variant="gold" onClick={onSeeAll} style={{ minHeight: 50, borderRadius: 16, padding: "0 26px" }}>
          {ui.albumReview.seeAll}
        </AppBtn>
      </div>
    );
  }

  const from = interpolate(ui.aurora.fromGuest, { name: current.uploaderLabel });
  const when = relativeTime(current.created_at, ui.locale);
  const btnStyle: React.CSSProperties = { height: 54, borderRadius: 16, fontSize: 16, width: "100%" };

  return (
    <div
      ref={regionRef}
      tabIndex={-1}
      role="group"
      aria-label={ui.albumReview.regionAria}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") act(onKeep);
        else if (e.key === "ArrowLeft") act(onHide);
        else return;
        e.preventDefault();
      }}
      style={{ outline: "none", maxWidth: 380, margin: "0 auto" }}
    >
      <div style={{ position: "relative", height: 400, marginTop: 6 }}>
        {next ? (
          <div
            aria-hidden
            style={{ position: "absolute", left: 36, top: 16, width: "min(290px, calc(100% - 56px))", transform: "rotate(5deg)", filter: "brightness(0.92)" }}
          >
            <PrintMedia
              item={next}
              alt=""
              peek
              style={{ width: "100%", height: 350, borderWidth: 6, boxShadow: "0 14px 26px -12px rgba(60,35,10,0.45)" }}
            />
          </div>
        ) : null}
        <figure
          key={current.id}
          style={{ position: "absolute", left: 10, top: 0, width: "min(306px, calc(100% - 36px))", margin: 0, transform: "rotate(-1.5deg)" }}
        >
          <PrintMedia
            item={current}
            alt={`${from}, ${when}`}
            style={{
              width: "100%",
              height: 368,
              borderWidth: 7,
              boxShadow: "0 26px 44px -16px rgba(60,35,10,0.6), 0 3px 6px rgba(60,35,10,0.2)",
            }}
          />
          <figcaption
            style={{
              position: "absolute",
              left: 16,
              bottom: current.mime_type?.startsWith("video/") ? 64 : 18,
              maxWidth: "calc(100% - 32px)",
              padding: "5px 12px",
              borderRadius: 99,
              background: "rgba(255,248,236,0.9)",
              color: "#221509",
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {from} · {when}
          </figcaption>
        </figure>
      </div>

      <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
        <Aurora pose="gallery" size={84} style={{ flexShrink: 0 }} />
        <AuroraSays size={21} style={{ lineHeight: 1.15 }}>
          {ui.aurora.reviewAsk}
        </AuroraSays>
      </div>

      <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
        <AppBtn
          type="button"
          variant="outline"
          disabled={busy}
          loading={busyId === `hide:${current.id}`}
          onClick={() => act(onHide)}
          style={{
            ...btnStyle,
            border: "1.5px solid color-mix(in srgb, var(--app-gold) 35%, var(--app-border))",
            background: "color-mix(in srgb, var(--app-surface) 70%, transparent)",
            color: "var(--app-text)",
            fontWeight: 600,
          }}
        >
          {ui.aurora.hide}
        </AppBtn>
        <AppBtn
          type="button"
          variant="gold"
          disabled={busy}
          loading={busyId === `keep:${current.id}`}
          onClick={() => act(onKeep)}
          style={{ ...btnStyle, fontWeight: 700 }}
        >
          {ui.aurora.keep}
        </AppBtn>
      </div>

      {error ? (
        <p role="alert" style={{ margin: "10px 0 0", textAlign: "center", fontSize: 13, color: "var(--app-danger)" }}>
          {error}
        </p>
      ) : null}

      <p aria-live="polite" style={{ margin: "10px 0 0", textAlign: "center", fontSize: 13, color: "var(--app-muted)" }}>
        {interpolate(ui.aurora.reviewProgress, { current: position, total })}
      </p>

      {total - position > 0 ? (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
          <AppBtn
            type="button"
            variant="ghost"
            size="sm"
            disabled={busy}
            loading={busyId === "__all__"}
            onClick={onApproveAll}
            style={{ minHeight: 44, fontSize: 13 }}
          >
            {ui.gallery.moderationApproveAll}
          </AppBtn>
        </div>
      ) : null}
    </div>
  );
}
