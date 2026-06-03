"use client";

import { useRouter } from "next/navigation";
import type { AppUiDict } from "@/lib/app-ui/en";
import type { EventKind } from "@/lib/event-kind";
import type { Locale } from "@/lib/i18n";
import type { PrintPaperId, PrintRouteTemplateId } from "@/lib/event-print/print-options";
import { POSTER_LANG_QUERY } from "@/lib/event-print/print-options";
import { QR_THEMED_PRINT_TEMPLATE_IDS } from "@/lib/event-print/template-catalog";
import { pickQrCard, buildQrCardCopy } from "./QrThemedPrintSheet";
import type { QrThemedTemplateId } from "@/lib/event-print/template-catalog";

const SWATCH: Record<string, { bg: string; fg: string; accent: string }> = {
  "table-minimal":                     { bg: "#ffffff", fg: "#1a1a1a", accent: "#1a1a1a" },
  "table-bold":                        { bg: "#0a0a0a", fg: "#ffffff", accent: "#ffffff" },
  "qr-clean":                          { bg: "#ffffff", fg: "#1a1a1a", accent: "#c5922a" },
  "qr-gold":                           { bg: "#fdf7ee", fg: "#1a1a1a", accent: "#c5922a" },
  "qr-dark":                           { bg: "#1a1a1a", fg: "#f3e9d2", accent: "#c5922a" },
  "wedding-invite-blue-floral":        { bg: "#dde8f4", fg: "#2a3a5a", accent: "#4a6fa5" },
  "wedding-invite-geometric":          { bg: "#f5ede0", fg: "#2a1a10", accent: "#b8963e" },
  "wedding-invite-watercolor-coast":   { bg: "#d9e8e5", fg: "#2f4f4f", accent: "#487876" },
  "wedding-invite-navy-botanical":     { bg: "#001830", fg: "#f4ecda", accent: "#f4ecda" },
  "wedding-invite-grayscale-glitter":  { bg: "#0a0a0a", fg: "#ffffff", accent: "#d4af5a" },
  "wedding-invite-terra-pill":         { bg: "#f0e5dc", fg: "#3a261c", accent: "#8c4834" },
  "wedding-invite-gold-arch-floral":   { bg: "#ffffff", fg: "#b89446", accent: "#b89446" },
  "wedding-invite-cherry-blossom":     { bg: "#fff5f6", fg: "#2c2c2c", accent: "#d4849a" },
  "wedding-invite-olive-gold-frame":   { bg: "#f2efe8", fg: "#4d563b", accent: "#4d563b" },
  "wedding-invite-gold-circles-photo": { bg: "#f5f2ee", fg: "#1a1a1a", accent: "#b8903e" },
};

const CLASSIC_QR_IDS = ["qr-clean", "qr-gold", "qr-dark", "table-minimal", "table-bold"] as const;
const INVITATION_IDS = [
  "wedding-invite-blue-floral",
  "wedding-invite-geometric",
  "wedding-invite-watercolor-coast",
  "wedding-invite-navy-botanical",
  "wedding-invite-grayscale-glitter",
  "wedding-invite-terra-pill",
  "wedding-invite-gold-arch-floral",
  "wedding-invite-cherry-blossom",
  "wedding-invite-olive-gold-frame",
  "wedding-invite-gold-circles-photo",
] as const;

const CARD_NATIVE_W = 559;

function ScaledCardThumb({ templateId, chromePrint }: { templateId: QrThemedTemplateId; chromePrint: AppUiDict["print"] }) {
  const copy = buildQrCardCopy(templateId, chromePrint);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: CARD_NATIVE_W,
        height: 793,
        transformOrigin: "top left",
        transform: "scale(0.295)",
      }}>
        {pickQrCard(templateId, { eventTitle: "Sample", accessCode: "ABCD", joinUrl: "#", copy })}
      </div>
    </div>
  );
}

function SwatchThumb({ templateId }: { templateId: string }) {
  const s = SWATCH[templateId] ?? { bg: "#f0f0f0", fg: "#888", accent: "#888" };
  return (
    <div className="tpicker-thumb__swatch" style={{ background: s.bg }}>
      <div style={{
        width: "55%",
        height: "55%",
        border: `3px solid ${s.accent}`,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ width: "60%", height: "60%", background: s.fg, opacity: 0.15, borderRadius: 2 }} />
      </div>
    </div>
  );
}

function buildLabelMap(p: AppUiDict["print"]): Record<string, string> {
  return {
    "qr-simple":                         p.templateQrSimple,
    "qr-romantic":                       p.templateQrRomantic,
    "qr-luxurious":                      p.templateQrLuxurious,
    "qr-botanical":                      p.templateQrBotanical,
    "qr-art-deco":                       p.templateQrArtDeco,
    "qr-playful":                        p.templateQrPlayful,
    "qr-celestial":                      p.templateQrCelestial,
    "qr-coastal":                        p.templateQrCoastal,
    "qr-boho":                           p.templateQrBoho,
    "qr-noir":                           p.templateQrNoir,
    "qr-watercolor":                     p.templateQrWatercolor,
    "qr-retro":                          p.templateQrRetro,
    "qr-tropical":                       p.templateQrTropical,
    "qr-scandi":                         p.templateQrScandi,
    "qr-sunset":                         p.templateQrSunset,
    "qr-rustic":                         p.templateQrRustic,
    "qr-clean":                          p.templateQrClean,
    "qr-gold":                           p.templateQrGold,
    "qr-dark":                           p.templateQrDark,
    "table-minimal":                     p.templateTableMinimal,
    "table-bold":                        p.templateTableBold,
    "wedding-invite-blue-floral":        p.templateWeddingInviteBlueFloral,
    "wedding-invite-geometric":          p.templateWeddingInviteGeometric,
    "wedding-invite-watercolor-coast":   p.templateWeddingInviteWatercolorCoast,
    "wedding-invite-navy-botanical":     p.templateWeddingInviteNavyBotanical,
    "wedding-invite-grayscale-glitter":  p.templateWeddingInviteGrayscaleGlitter,
    "wedding-invite-terra-pill":         p.templateWeddingInviteTerraPill,
    "wedding-invite-gold-arch-floral":   p.templateWeddingInviteGoldArchFloral,
    "wedding-invite-cherry-blossom":     p.templateWeddingInviteCherryBlossom,
    "wedding-invite-olive-gold-frame":   p.templateWeddingInviteOliveGoldFrame,
    "wedding-invite-gold-circles-photo": p.templateWeddingInviteGoldCirclesPhoto,
  };
}

export type TemplatePickerProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  activeTemplate: PrintRouteTemplateId;
  eventKind: EventKind;
  paper: PrintPaperId;
  posterLang: Locale;
  chromePrint: AppUiDict["print"];
}>;

export function TemplatePicker({
  isOpen,
  onClose,
  eventId,
  activeTemplate,
  eventKind,
  paper,
  posterLang,
  chromePrint,
}: TemplatePickerProps) {
  const router = useRouter();
  const labels = buildLabelMap(chromePrint);

  function navigate(tid: PrintRouteTemplateId) {
    const q = new URLSearchParams();
    q.set("template", tid);
    q.set("paper", paper);
    q.set(POSTER_LANG_QUERY, posterLang);
    router.push(`/events/${eventId}/print?${q.toString()}`);
    onClose();
  }

  function Thumb({ tid }: { tid: PrintRouteTemplateId }) {
    const isActive = tid === activeTemplate;
    const isThemed = (QR_THEMED_PRINT_TEMPLATE_IDS as readonly string[]).includes(tid);
    return (
      <button
        className="tpicker-thumb"
        onClick={() => navigate(tid)}
        aria-pressed={isActive}
        aria-label={labels[tid] ?? tid}
      >
        <div className={`tpicker-thumb__frame${isActive ? " tpicker-thumb__frame--active" : ""}`}>
          <div className="tpicker-thumb__inner">
            {isThemed
              ? <ScaledCardThumb templateId={tid as QrThemedTemplateId} chromePrint={chromePrint} />
              : <SwatchThumb templateId={tid} />
            }
          </div>
        </div>
        <span className={`tpicker-thumb__label${isActive ? " tpicker-thumb__label--active" : ""}`}>
          {labels[tid] ?? tid}
        </span>
      </button>
    );
  }

  return (
    <>
      <div
        className={`tpicker-overlay${isOpen ? " tpicker-overlay--open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`tpicker-sheet${isOpen ? " tpicker-sheet--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Choose a theme"
      >
        <div className="tpicker-handle" aria-hidden />
        <div className="tpicker-header">
          <span className="tpicker-header__title">Choose a theme</span>
          <button className="tpicker-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <p className="tpicker-section-label">QR Card Themes</p>
        <div className="tpicker-grid">
          {QR_THEMED_PRINT_TEMPLATE_IDS.map((tid) => (
            <Thumb key={tid} tid={tid} />
          ))}
        </div>

        <p className="tpicker-section-label">Classic QR</p>
        <div className="tpicker-grid">
          {CLASSIC_QR_IDS.map((tid) => (
            <Thumb key={tid} tid={tid} />
          ))}
        </div>

        {eventKind === "wedding" && (
          <>
            <p className="tpicker-section-label">Invitations</p>
            <div className="tpicker-grid">
              {INVITATION_IDS.map((tid) => (
                <Thumb key={tid} tid={tid} />
              ))}
            </div>
          </>
        )}

        <div style={{ height: 24 }} />
      </div>
    </>
  );
}
