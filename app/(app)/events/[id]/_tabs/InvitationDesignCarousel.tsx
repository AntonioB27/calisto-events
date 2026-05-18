"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";

import { AppBtn } from "@/components/app-ui/AppBtn";
import { interpolate } from "@/lib/app-ui";
import type { InvitationVisibilityKey } from "@/lib/event-print/invitation-field-visibility";
import type { PrintTemplateDef } from "@/lib/event-print/template-catalog";

import "./prints-invite-carousel.css";

// Fields hidden in this order when text still overflows after max scale reduction.
const AUTO_HIDE_ORDER: readonly InvitationVisibilityKey[] = [
  "quote",
  "gathering",
  "extra_line",
  "venue_line_2",
  "together_families",
  "invite_preamble",
];

const SCALE_FLOOR = 70;
const SCALE_STEP = 5;

const CARD_W = 260; // px — must match --pic-card-w in CSS
const VERTICAL_STEP = 32; // px each level drops below the previous

function offsetStyle(off: number): CSSProperties | null {
  const abs = Math.abs(off);
  if (abs > 2) return null;

  const dist = CARD_W * 0.62;

  if (abs === 0) {
    return {
      transform: "translateX(-50%) translateY(-50%) scale(1)",
      opacity: 1,
      filter: "none",
      zIndex: 30,
      pointerEvents: "none",
    };
  }
  if (abs === 1) {
    return {
      transform: `translateX(calc(-50% + ${off * dist}px)) translateY(calc(-50% + ${VERTICAL_STEP}px)) scale(0.86)`,
      opacity: 0.58,
      filter: "brightness(0.7)",
      zIndex: 20,
      cursor: "pointer",
    };
  }
  // abs === 2
  return {
    transform: `translateX(calc(-50% + ${off * dist * 1.5}px)) translateY(calc(-50% + ${VERTICAL_STEP * 2}px)) scale(0.7)`,
    opacity: 0.22,
    filter: "brightness(0.5) blur(1px)",
    zIndex: 10,
    cursor: "pointer",
  };
}

export type InvitationDesignCarouselProps = Readonly<{
  eventId: string;
  templates: readonly PrintTemplateDef[];
  renderPreview: (template: PrintTemplateDef) => ReactNode;
  getTitle: (templateId: string) => string;
  openPrintPreviewLabel: string;
  prevLabel: string;
  nextLabel: string;
  swipeHint: string;
  counterTemplate: string;
  inviteFontScaleLabel: string;
  inviteFontScaleHint: string;
  inviteAutoFitNotice: string;
  inviteAutoFitUndo: string;
  inviteAutoFitToggle: string;
  contentRevision: number;
  onAutoHide: (key: InvitationVisibilityKey) => void;
  onAutoRestore: (keys: readonly InvitationVisibilityKey[]) => void;
}>;

export function InvitationDesignCarousel({
  eventId,
  templates,
  renderPreview,
  getTitle,
  openPrintPreviewLabel,
  prevLabel,
  nextLabel,
  swipeHint,
  counterTemplate,
  inviteFontScaleLabel,
  inviteFontScaleHint,
  inviteAutoFitNotice,
  inviteAutoFitUndo,
  inviteAutoFitToggle,
  contentRevision,
  onAutoHide,
  onAutoRestore,
}: InvitationDesignCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fontScalePct, setFontScalePct] = useState(100);
  const [autoFitPct, setAutoFitPct] = useState(100);
  const [autoHiddenKeys, setAutoHiddenKeys] = useState<readonly InvitationVisibilityKey[]>([]);
  const [autoFitEnabled, setAutoFitEnabled] = useState(true);
  const touchStartX = useRef(0);
  const activeSlideRef = useRef<HTMLDivElement>(null);

  // Stable ref so the layout effect doesn't need onAutoHide in its deps.
  const onAutoHideRef = useRef(onAutoHide);
  onAutoHideRef.current = onAutoHide;
  const onAutoRestoreRef = useRef(onAutoRestore);
  onAutoRestoreRef.current = onAutoRestore;

  // Detect overflow on the active card after every content or scale change.
  // __card elements have overflow:hidden + fixed A4 aspect ratio, so
  // scrollHeight > clientHeight reliably signals clipped content.
  useLayoutEffect(() => {
    if (!autoFitEnabled) return;

    const slideEl = activeSlideRef.current;
    if (!slideEl) return;
    const cardEl = slideEl.querySelector<HTMLElement>("[data-template]");
    if (!cardEl) return;

    const overflowing = cardEl.scrollHeight > cardEl.clientHeight + 2;
    if (!overflowing) return;

    if (autoFitPct > SCALE_FLOOR) {
      setAutoFitPct((prev) => Math.max(SCALE_FLOOR, prev - SCALE_STEP));
      return;
    }

    const nextKey = AUTO_HIDE_ORDER.find((k) => !autoHiddenKeys.includes(k));
    if (nextKey) {
      setAutoHiddenKeys((prev) => [...prev, nextKey]);
      onAutoHideRef.current(nextKey);
    }
  }, [activeIndex, contentRevision, autoFitPct, autoHiddenKeys, autoFitEnabled]);

  if (templates.length === 0) return null;

  const n = templates.length;
  const active = templates[activeIndex] ?? templates[0];

  function goTo(i: number) {
    setActiveIndex(Math.max(0, Math.min(n - 1, i)));
  }

  function handleUndo() {
    onAutoRestoreRef.current(autoHiddenKeys);
    setAutoHiddenKeys([]);
    setAutoFitPct(100);
  }

  function toggleAutoFit() {
    if (autoFitEnabled) {
      // Turning off: restore any auto-hidden fields and reset scale ceiling.
      if (autoHiddenKeys.length > 0) onAutoRestoreRef.current(autoHiddenKeys);
      setAutoHiddenKeys([]);
      setAutoFitPct(100);
    }
    setAutoFitEnabled((prev) => !prev);
  }

  const effectiveScale = Math.min(fontScalePct, autoFitPct) / 100;
  const effectivePct = Math.round(effectiveScale * 100);
  const autoFitActive = autoFitEnabled && (autoFitPct < 100 || autoHiddenKeys.length > 0);

  const rootStyle = { "--invite-text-scale": effectiveScale } as CSSProperties;

  return (
    <div
      className="prints-invite-carousel"
      style={rootStyle}
      role="region"
      aria-roledescription="carousel"
      aria-label={swipeHint}
    >
      {/* Active card name */}
      <p className="prints-invite-carousel__activeLabel">
        {getTitle(active.id)}
      </p>

      {/* Carousel viewport */}
      <div
        className="prints-invite-carousel__viewport"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" && activeIndex > 0) { e.preventDefault(); goTo(activeIndex - 1); }
          if (e.key === "ArrowRight" && activeIndex < n - 1) { e.preventDefault(); goTo(activeIndex + 1); }
        }}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchStartX.current;
          if (Math.abs(dx) > 48) { dx < 0 ? goTo(activeIndex + 1) : goTo(activeIndex - 1); }
        }}
      >
        {/* Prev arrow */}
        <button
          type="button"
          className="prints-invite-carousel__nav prints-invite-carousel__nav--prev"
          aria-label={prevLabel}
          disabled={activeIndex <= 0}
          onClick={() => goTo(activeIndex - 1)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Cards */}
        {templates.map((t, i) => {
          const off = i - activeIndex;
          const style = offsetStyle(off);
          if (style === null) return null;
          const isActive = off === 0;

          return (
            <div
              key={t.id}
              ref={isActive ? activeSlideRef : null}
              className={`prints-invite-carousel__slide${isActive ? " prints-invite-carousel__slide--active" : ""}`}
              style={style}
              aria-hidden={!isActive}
              onClick={() => !isActive && goTo(i)}
            >
              <div className="prints-invite-carousel__previewShell">
                <div className="prints-invite-carousel__previewScaler">
                  {renderPreview(t)}
                </div>
              </div>
            </div>
          );
        })}

        {/* Next arrow */}
        <button
          type="button"
          className="prints-invite-carousel__nav prints-invite-carousel__nav--next"
          aria-label={nextLabel}
          disabled={activeIndex >= n - 1}
          onClick={() => goTo(activeIndex + 1)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Footer: counter + dots + CTA */}
      <div className="prints-invite-carousel__footer">
        <div className="prints-invite-carousel__footerRow">
          <p className="prints-invite-carousel__counter">
            {interpolate(counterTemplate, { current: String(activeIndex + 1), total: String(n) })}
          </p>
          <div className="prints-invite-carousel__dots" role="tablist" aria-label={swipeHint}>
            {templates.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                className="prints-invite-carousel__dot"
                aria-label={getTitle(t.id)}
                aria-selected={i === activeIndex}
                aria-current={i === activeIndex ? "true" : undefined}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </div>

        {active ? (
          <AppBtn
            href={`/events/${eventId}/print?template=${encodeURIComponent(active.id)}`}
            as={Link}
            variant="gold"
          >
            {openPrintPreviewLabel}
          </AppBtn>
        ) : null}
      </div>

      {/* Font scale bar */}
      <div className="prints-invite-carousel__scaleBar">
        <div className="prints-invite-carousel__scaleHead">
          <label className="prints-invite-carousel__scaleLabel" htmlFor="prints-invite-font-scale">
            {inviteFontScaleLabel}
          </label>
          <div className="prints-invite-carousel__scaleHeadRight">
            <button
              type="button"
              className={`prints-invite-carousel__autoFitToggle${autoFitEnabled ? " prints-invite-carousel__autoFitToggle--on" : ""}`}
              onClick={toggleAutoFit}
              aria-pressed={autoFitEnabled}
            >
              {inviteAutoFitToggle}
            </button>
            <span className="prints-invite-carousel__scalePct" aria-live="polite">
              {effectivePct}%
            </span>
          </div>
        </div>
        <input
          id="prints-invite-font-scale"
          className="prints-invite-carousel__scaleSlider"
          type="range"
          min={75}
          max={200}
          step={5}
          value={fontScalePct}
          aria-valuemin={75}
          aria-valuemax={200}
          aria-valuenow={fontScalePct}
          aria-describedby="prints-invite-font-scale-hint"
          onChange={(e) => setFontScalePct(Number(e.target.value))}
        />
        <p id="prints-invite-font-scale-hint" className="prints-invite-carousel__scaleHint">
          {inviteFontScaleHint}
        </p>

        {autoFitActive ? (
          <div className="prints-invite-carousel__autoFitNotice">
            <span>{inviteAutoFitNotice}</span>
            <button type="button" onClick={handleUndo}>
              {inviteAutoFitUndo}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
