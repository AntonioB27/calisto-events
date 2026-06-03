"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Home, Users, Images, Camera } from "lucide-react";

import type { AppUiDict } from "@/lib/app-ui/en";
import { interpolate } from "@/lib/app-ui";
import type { PrintPaperId } from "@/lib/event-print/print-options";
import { LOCALES, type Locale } from "@/lib/i18n";
import { QR_THEMED_PRINT_TEMPLATE_IDS, type QrThemedTemplateId } from "@/lib/event-print/template-catalog";
import { pickQrCard, QrThemedPrintSheet, buildQrCardCopy } from "./QrThemedPrintSheet";

// ── Calisto warm palette ──────────────────────────────────────────────────────
const C = {
  bg:      "#ECE4D9",
  surface: "#FBF8F3",
  text:    "#221509",
  muted:   "#9A8570",
  gold:    "#C5922A",
  goldDk:  "#A8791D",
  line:    "#E2D8C8",
} as const;

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

// ── Icons ─────────────────────────────────────────────────────────────────────
function ChevronIcon() {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" aria-hidden="true">
      <path d="M8 1 1.5 8 8 15" stroke={C.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function PrinterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="6" y="14" width="12" height="7" rx="1.2" stroke="#fff" strokeWidth="2" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 19h16" stroke={C.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Mobile bottom nav (mirrors EventAdminTabs, prints = active) ───────────────
const NAV_TABS = [
  { id: "overview", Icon: Home,   label: "Home"    },
  { id: "guests",   Icon: Users,  label: "Guests"  },
  { id: "gallery",  Icon: Images, label: "Gallery" },
  { id: "prints",   Icon: Camera, label: "Prints"  },
] as const;

function MobileNav({ eventId }: { eventId: string }) {
  return (
    <nav
      aria-label="Event navigation"
      className="flex md:hidden print:hidden"
      style={{
        position: "fixed",
        left: 18, right: 18,
        bottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
        background: "rgba(255,252,248,0.38)",
        backdropFilter: "blur(48px) saturate(180%) brightness(1.04)",
        WebkitBackdropFilter: "blur(48px) saturate(180%) brightness(1.04)",
        borderRadius: 28,
        padding: 5,
        border: "1px solid rgba(255,255,255,0.38)",
        boxShadow: [
          "0 16px 40px rgba(0,0,0,0.28)",
          "0 4px 12px rgba(0,0,0,0.14)",
          "inset 0 1.5px 0 rgba(255,255,255,0.72)",
          "inset 0 -1px 0 rgba(255,255,255,0.10)",
        ].join(", "),
        gap: 4,
        zIndex: 100,
      }}
    >
      {NAV_TABS.map(({ id, Icon, label }) => {
        const active = id === "prints";
        return (
          <Link
            key={id}
            href={`/events/${eventId}?tab=${id}`}
            role="tab"
            aria-selected={active}
            aria-current={active ? "page" : undefined}
            aria-label={label}
            style={{
              flex: active ? 1.4 : 1,
              background: active ? "rgba(255,252,248,0.52)" : "transparent",
              borderRadius: 22,
              padding: "9px 6px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              boxShadow: active ? [
                "0 2px 10px rgba(0,0,0,0.18)",
                "inset 0 1.5px 0 rgba(255,255,255,0.95)",
                "inset 0 -0.5px 0 rgba(0,0,0,0.06)",
              ].join(", ") : "none",
              transition: "flex 200ms ease",
              textDecoration: "none",
              outline: "none",
            }}
          >
            <Icon size={18} color={active ? "#946C18" : "#5A4A36"} strokeWidth={active ? 2.2 : 1.7} />
            {active && (
              <span style={{
                fontFamily: "'DM Serif Display', serif",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: 14.7,
                letterSpacing: "-0.005em",
                color: C.text,
                whiteSpace: "nowrap",
              }}>
                {label}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
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
  const [paper, setPaper] = useState<PrintPaperId>(initialPaper);
  const p = chromePrint;
  const railRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIdx = QR_THEMED_PRINT_TEMPLATE_IDS.indexOf(selected);

  useEffect(() => {
    const rail = railRef.current;
    const btn = btnRefs.current[activeIdx];
    if (!rail || !btn) return;
    const target = btn.offsetLeft - rail.clientWidth / 2 + btn.offsetWidth / 2;
    rail.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [activeIdx]);

  const thumbProps = { eventTitle, accessCode, joinUrl, posterPrint };
  const chipText = interpolate(p.printSheetChip, { paper: paper === "a4" ? "A4" : "Letter" });

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

        {/* Preview stage — bigger card, tight padding */}
        <div className="ps-stage">
          <div className="ps-card-shadow">
            <CardThumb templateId={selected} w={300} {...thumbProps} />
          </div>
          <div className="ps-chip">
            <span className="ps-chip__dot" aria-hidden />
            <span className="ps-chip__text">{chipText}</span>
          </div>
        </div>

        {/* Options panel */}
        <div className="ps-panel">

          {/* ── Action bar: back | download | print ── */}
          <div className="ps-action-bar">
            <Link href={backHref} className="ps-action-back" aria-label={p.backPrints}>
              <ChevronIcon />
            </Link>
            <div className="ps-action-buttons">
              <a
                href={`/api/events/${eventId}/qr-pdf`}
                download
                className="ps-action-download"
                aria-label={p.downloadPdf}
              >
                <DownloadIcon />
                <span className="ps-action-download__text">{p.downloadPdf}</span>
              </a>
              <button onClick={() => window.print()} className="ps-action-print">
                <PrinterIcon />
                {p.print}
              </button>
            </div>
          </div>

          {/* Theme rail */}
          <div className="ps-section-header">
            <span className="ps-section-label">{p.printThemeLabel}</span>
            <span className="ps-active-name">{themeLabel(selected)}</span>
          </div>
          <div ref={railRef} className="ps-rail">
            {QR_THEMED_PRINT_TEMPLATE_IDS.map((tid, i) => (
              <button
                key={tid}
                ref={el => { btnRefs.current[i] = el; }}
                onClick={() => setSelected(tid)}
                className="ps-rail-btn"
                aria-pressed={tid === selected}
                aria-label={themeLabel(tid)}
              >
                <div className={`ps-rail-frame${tid === selected ? " ps-rail-frame--active" : ""}`}>
                  <CardThumb templateId={tid} w={52} {...thumbProps} />
                </div>
                <span className={`ps-rail-label${tid === selected ? " ps-rail-label--active" : ""}`}>
                  {themeLabel(tid)}
                </span>
              </button>
            ))}
          </div>

          {/* Paper size */}
          <div className="ps-paper-row">
            <span className="ps-section-label">{p.paperSectionLabel}</span>
            <div className="ps-paper-toggle">
              {(["a4", "letter"] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setPaper(sz)}
                  className={`ps-paper-btn${paper === sz ? " ps-paper-btn--active" : ""}`}
                >
                  {sz === "a4" ? "A4" : "Letter"}
                </button>
              ))}
            </div>
          </div>

          {/* Card language */}
          <div className="ps-paper-row">
            <span className="ps-section-label">{p.posterLanguageLabel}</span>
            <div className="ps-paper-toggle">
              {LOCALES.map((loc) => (
                <Link
                  key={loc}
                  href={`/events/${eventId}/print?template=${selected}&paper=${paper}&posterLang=${loc}`}
                  prefetch={false}
                  className={`ps-paper-btn${loc === posterLang ? " ps-paper-btn--active" : ""}`}
                  style={{ textDecoration: "none" }}
                >
                  {loc.toUpperCase()}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Mobile nav — fixed floating pill, prints tab active */}
      <MobileNav eventId={eventId} />

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
