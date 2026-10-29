"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { Aurora } from "@/components/app-ui/Aurora";
import type { AppUiDict } from "@/lib/app-ui/en";
import { interpolate } from "@/lib/app-ui";
import type { PrintPaperId } from "@/lib/event-print/print-options";
import { LOCALES, type Locale } from "@/lib/i18n";
import { QR_THEMED_PRINT_TEMPLATE_IDS, type QrThemedTemplateId } from "@/lib/event-print/template-catalog";
import { EventBottomNav } from "../_tabs/EventAdminTabs";
import { pickQrCard, QrThemedPrintSheet, buildQrCardCopy } from "./QrThemedPrintSheet";

// ── Scaled card thumbnail ─────────────────────────────────────────────────────
function CardThumb({
  templateId, w, eventTitle, accessCode, joinUrl, posterPrint,
}: {
  templateId: QrThemedTemplateId;
  w: number;
  eventTitle: string;
  accessCode: string;
  joinUrl: string;
  posterPrint: AppUiDict["print"];
}) {
  const scale = w / 559;
  const h = Math.round(793 * scale);
  const copy = buildQrCardCopy(templateId, posterPrint);
  return (
    <div style={{ width: w, height: h, overflow: "hidden", position: "relative", flexShrink: 0 }}>
      <div style={{
        width: 559, height: 793,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        position: "absolute", top: 0, left: 0,
      }}>
        {pickQrCard(templateId, { eventTitle, accessCode, joinUrl, copy })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export type PrintScreenProps = Readonly<{
  eventId: string;
  eventTitle: string;
  accessCode: string;
  joinUrl: string;
  initialTemplate: QrThemedTemplateId;
  initialPaper: PrintPaperId;
  posterLang: Locale;
  backHref: string;
  chromePrint: AppUiDict["print"];
  posterPrint: AppUiDict["print"];
}>;

export function PrintScreen({
  eventId,
  eventTitle,
  accessCode,
  joinUrl,
  initialTemplate,
  initialPaper,
  posterLang,
  backHref,
  chromePrint,
  posterPrint,
}: PrintScreenProps) {
  const [selected, setSelected] = useState<QrThemedTemplateId>(initialTemplate);
  // Which way the last change went; the new card slides in from that side.
  const [dir, setDir] = useState<1 | -1>(1);
  const [paper, setPaper] = useState<PrintPaperId>(initialPaper);
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const ui = useAppUi();
  const p = chromePrint;
  const railRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const activeIdx = QR_THEMED_PRINT_TEMPLATE_IDS.indexOf(selected);
  const total = QR_THEMED_PRINT_TEMPLATE_IDS.length;
  const themeAt = (offset: number) => QR_THEMED_PRINT_TEMPLATE_IDS[(activeIdx + offset + total) % total];
  const touchX = useRef<number | null>(null);
  const copy = buildQrCardCopy(selected, posterPrint);
  const selectedRef = useRef(selected);
  // Set when the strip itself picked the theme (so it must not be scrolled again).
  const fromRail = useRef(false);
  // True while the strip glides to a theme picked elsewhere; it picks nothing on the way.
  const autoScroll = useRef(false);

  const go = (id: QrThemedTemplateId, d: 1 | -1) => {
    selectedRef.current = id;
    setDir(d);
    setSelected(id);
  };

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    if (fromRail.current) {
      fromRail.current = false;
      return;
    }
    const rail = railRef.current;
    const btn = btnRefs.current[activeIdx];
    if (!rail || !btn) return;
    const target = Math.max(0, btn.offsetLeft - rail.clientWidth / 2 + btn.offsetWidth / 2);
    if (Math.abs(target - rail.scrollLeft) < 1) return;
    autoScroll.current = true;
    rail.scrollTo({ left: target, behavior: "smooth" });
  }, [activeIdx]);

  // Theme carousel on an arc: thumbs drop, tilt outward, shrink and fade with distance from the
  // middle; while you swipe, whichever thumb crosses the middle becomes the chosen theme.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const centreOf = (btn: HTMLElement) => btn.offsetLeft + btn.offsetWidth / 2;
    const pick = () => {
      const mid = rail.scrollLeft + rail.clientWidth / 2;
      let best = -1;
      let bestDist = Infinity;
      btnRefs.current.forEach((btn, i) => {
        const dist = btn ? Math.abs(centreOf(btn) - mid) : Infinity;
        if (dist < bestDist) { bestDist = dist; best = i; }
      });
      const id = QR_THEMED_PRINT_TEMPLATE_IDS[best];
      if (best < 0 || id === selectedRef.current) return;
      const d = best > QR_THEMED_PRINT_TEMPLATE_IDS.indexOf(selectedRef.current) ? 1 : -1;
      fromRail.current = true;
      selectedRef.current = id;
      setDir(d);
      setSelected(id);
    };
    const paint = () => {
      const mid = rail.scrollLeft + rail.clientWidth / 2;
      for (const btn of btnRefs.current) {
        if (!btn) continue;
        const side = Math.max(-1, Math.min(1, (centreOf(btn) - mid) / (rail.clientWidth / 2)));
        btn.style.setProperty("--s", side.toFixed(3));
        btn.style.setProperty("--d", Math.abs(side).toFixed(3));
      }
      if (!autoScroll.current) pick();
    };
    let frame = 0;
    let settle = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(paint);
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        autoScroll.current = false;
        pick();
      }, 140);
    };
    paint();
    rail.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", paint);
    return () => {
      rail.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", paint);
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
    };
  }, []);

  const thumbProps = { eventTitle, accessCode, joinUrl, posterPrint };

  const handleDownloadPdf = useCallback(async () => {
    if (pdfDownloading || !cardRef.current) return;
    setPdfDownloading(true);

    const el = cardRef.current;

    try {
      const [{ toPng, getFontEmbedCSS }, { jsPDF }] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ]);

      await document.fonts.ready;
      await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));

      // getFontEmbedCSS walks only the fonts this element actually uses,
      // triggers html-to-image's SecurityError fallback to fetch Google Fonts
      // via CORS (allowed), and returns a compact base64 CSS — far smaller
      // than embedding every family/weight we load for the whole page.
      const fontEmbedCSS = await getFontEmbedCSS(el).catch(() => undefined);

      const dataUrl = await toPng(el, {
        width: 559,
        height: 793,
        pixelRatio: 3,
        ...(fontEmbedCSS ? { fontEmbedCSS } : {}),
      });

      const [pageW, pageH] = paper === "letter" ? [215.9, 279.4] : [210, 297];
      const margin = 10;
      const maxW = pageW - 2 * margin;
      const maxH = pageH - 2 * margin;
      const aspect = 559 / 793;
      let imgW = maxW;
      let imgH = imgW / aspect;
      if (imgH > maxH) {
        imgH = maxH;
        imgW = imgH * aspect;
      }

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: paper });
      pdf.addImage(dataUrl, "PNG", (pageW - imgW) / 2, (pageH - imgH) / 2, imgW, imgH);

      const slug = eventTitle
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) || "event";
      pdf.save(`calisto-${slug}-${selected.replace(/^qr-/, "")}.pdf`);
    } finally {
      setPdfDownloading(false);
    }
  }, [pdfDownloading, selected, eventTitle, paper]);

  const themeLabel = (tid: QrThemedTemplateId): string => ({
    "qr-simple":     p.templateQrSimple,
    "qr-romantic":   p.templateQrRomantic,
    "qr-luxurious":  p.templateQrLuxurious,
    "qr-botanical":  p.templateQrBotanical,
    "qr-art-deco":   p.templateQrArtDeco,
    "qr-playful":    p.templateQrPlayful,
    "qr-celestial":  p.templateQrCelestial,
    "qr-coastal":    p.templateQrCoastal,
    "qr-boho":       p.templateQrBoho,
    "qr-noir":       p.templateQrNoir,
    "qr-watercolor": p.templateQrWatercolor,
    "qr-retro":      p.templateQrRetro,
    "qr-tropical":   p.templateQrTropical,
    "qr-scandi":     p.templateQrScandi,
    "qr-sunset":     p.templateQrSunset,
    "qr-rustic":     p.templateQrRustic,
  })[tid];

  return (
    <>
      {/* ── Screen UI (hidden on @media print) ───────────────────── */}
      <div className="ps-ui print:hidden">
        <div className="guest-album-bar event-bar">
          <div className="guest-album-bar__inner">
            <Link href={backHref} aria-label={p.backPrints.replace(/^←\s*/, "")} className="guest-cover-btn guest-cover-btn--round guest-cover-btn--solid">
              <ChevronLeft size={20} strokeWidth={2.2} aria-hidden />
            </Link>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
              <span className="event-bar__title">{ui.printsTab.qrCardsTitle}</span>
              <span className="event-bar__line">{eventTitle}</span>
            </div>
          </div>
        </div>

        {/* The card on a warm glow; neighbouring themes peek in from the sides */}
        <div className="ps-stage">
          <span className="ps-stage__glow" aria-hidden />
          {([-1, 1] as const).map((d) => (
            <button
              key={d}
              type="button"
              tabIndex={-1}
              aria-hidden
              className={`ps-peek ps-peek--${d < 0 ? "prev" : "next"}`}
              onClick={() => go(themeAt(d), d)}
            >
              <span key={themeAt(d)} className="ps-peek__in">
                <CardThumb templateId={themeAt(d)} w={176} {...thumbProps} />
              </span>
            </button>
          ))}
          <div
            className="ps-stage__card"
            onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              const start = touchX.current;
              touchX.current = null;
              if (start === null) return;
              const dx = e.changedTouches[0].clientX - start;
              if (Math.abs(dx) > 40) go(themeAt(dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
            }}
          >
            <div key={selected} className={`ps-card-shadow ps-card-in ps-card-in--${dir > 0 ? "next" : "prev"}`}>
              <CardThumb templateId={selected} w={216} {...thumbProps} />
            </div>
          </div>
          <Aurora pose="qr" size={92} className="ps-stage__aurora" />
        </div>

        <div className="ps-caption">
          <button type="button" className="guest-cover-btn guest-cover-btn--round guest-cover-btn--solid" aria-label={ui.printsTab.inviteCarouselPrev} onClick={() => go(themeAt(-1), -1)}>
            <ChevronLeft size={20} strokeWidth={2.2} aria-hidden />
          </button>
          <div className="ps-caption__text" aria-live="polite">
            <span key={selected} className="ps-caption__name">{themeLabel(selected)}</span>
            <span className="ps-caption__count">
              {interpolate(ui.printsTab.inviteCarouselCounter, { current: activeIdx + 1, total })}
            </span>
          </div>
          <button type="button" className="guest-cover-btn guest-cover-btn--round guest-cover-btn--solid" aria-label={ui.printsTab.inviteCarouselNext} onClick={() => go(themeAt(1), 1)}>
            <ChevronRight size={20} strokeWidth={2.2} aria-hidden />
          </button>
        </div>

        <div ref={railRef} className="ps-rail">
          {QR_THEMED_PRINT_TEMPLATE_IDS.map((tid, i) => (
            <button
              key={tid}
              ref={el => { btnRefs.current[i] = el; }}
              type="button"
              onClick={() => { if (i !== activeIdx) go(tid, i > activeIdx ? 1 : -1); }}
              className="ps-rail-btn"
              aria-pressed={tid === selected}
              aria-label={themeLabel(tid)}
            >
              <span className="ps-rail-frame">
                <CardThumb templateId={tid} w={52} {...thumbProps} />
              </span>
            </button>
          ))}
        </div>

        {/* Dock: paper and card language, then the one action */}
        <section className="ps-dock">
          <div className="ps-dock__options">
            <div>
              <span id="ps-paper-label" className="ps-dock__label">{p.paperSectionLabel}</span>
              <div className="ps-seg" role="group" aria-labelledby="ps-paper-label">
                {(["a4", "letter"] as const).map((sz) => (
                  <button key={sz} type="button" onClick={() => setPaper(sz)} aria-pressed={paper === sz} className="ps-seg__btn">
                    {sz === "a4" ? "A4" : "Letter"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span id="ps-lang-label" className="ps-dock__label">{p.posterLanguageLabel}</span>
              <div className="ps-seg" role="group" aria-labelledby="ps-lang-label">
                {LOCALES.map((loc) => (
                  <Link
                    key={loc}
                    href={`/events/${eventId}/print?template=${selected}&paper=${paper}&posterLang=${loc}`}
                    prefetch={false}
                    aria-current={loc === posterLang ? "true" : undefined}
                    className="ps-seg__btn"
                  >
                    {loc.toUpperCase()}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <AppBtn type="button" variant="gold" size="lg" loading={pdfDownloading} onClick={handleDownloadPdf}>
            {!pdfDownloading && <Download size={20} strokeWidth={2.2} aria-hidden />}
            {p.downloadPdf}
          </AppBtn>
        </section>
      </div>

      {/* Prints opens from More, so More is the active tab */}
      <EventBottomNav eventId={eventId} selectedTab="more" />

      {/* Off-screen wrapper keeps the card out of the viewport.
          ref targets the inner div so cloneCSSStyle copies position:static
          (not position:fixed left:-9999px), ensuring the clone renders at
          (0,0) inside the SVG foreignObject. */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: -9999,
          top: 0,
          pointerEvents: "none",
        }}
      >
        <div
          ref={cardRef}
          style={{ width: 559, height: 793, overflow: "hidden" }}
        >
          {pickQrCard(selected, { eventTitle, accessCode, joinUrl, copy })}
        </div>
      </div>

      {/* ── Print layout (only visible on @media print) ──────────── */}
      <div className="ps-print-layout">
        <QrThemedPrintSheet
          template={selected}
          eventTitle={eventTitle}
          accessCode={accessCode}
          joinUrl={joinUrl}
          posterPrint={posterPrint}
        />
      </div>
    </>
  );
}
