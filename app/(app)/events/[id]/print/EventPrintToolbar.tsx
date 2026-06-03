"use client";

import { useState } from "react";
import Link from "next/link";

import { AppBtn } from "@/components/app-ui/AppBtn";
import type { AppUiDict } from "@/lib/app-ui/en";
import type { EventKind } from "@/lib/event-kind";
import type { Locale } from "@/lib/i18n";
import {
  POSTER_LANG_QUERY,
  type PrintPaperId,
  type PrintRouteTemplateId,
} from "@/lib/event-print/print-options";
import {
  isInvitationPrintTemplateId,
  isQrThemedPrintTemplateId,
} from "@/lib/event-print/template-catalog";
import { TemplatePicker } from "./TemplatePicker";

export type EventPrintToolbarProps = Readonly<{
  eventId: string;
  activeTemplate: PrintRouteTemplateId;
  eventKind: EventKind;
  paper: PrintPaperId;
  posterLang: Locale;
  chromePrint: AppUiDict["print"];
  localeOptionLabels: AppUiDict["languagePicker"]["locales"];
  backHref: string;
  backLabel: string;
  sheetHelperLine: string;
}>;

function buildActiveLabel(tid: PrintRouteTemplateId, p: AppUiDict["print"]): string {
  const map: Record<string, string> = {
    "qr-simple":                         p.templateQrSimple,
    "qr-romantic":                       p.templateQrRomantic,
    "qr-luxurious":                      p.templateQrLuxurious,
    "qr-botanical":                      p.templateQrBotanical,
    "qr-art-deco":                       p.templateQrArtDeco,
    "qr-playful":                        p.templateQrPlayful,
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
  return map[tid] ?? tid;
}

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function EventPrintToolbar({
  eventId,
  activeTemplate,
  eventKind,
  paper,
  posterLang,
  chromePrint,
  backHref,
  backLabel,
}: EventPrintToolbarProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const p = chromePrint;
  const isInvitationView =
    isInvitationPrintTemplateId(activeTemplate) ||
    isQrThemedPrintTemplateId(activeTemplate);
  const activeLabel = buildActiveLabel(activeTemplate, p);

  return (
    <>
      {/* ── Sticky top bar ─────────────────────────────────────────── */}
      <div className="print-topbar print:hidden">
        <AppBtn variant="ghost" size="sm" href={backHref} as={Link} style={{ flexShrink: 0 }}>
          ← {backLabel}
        </AppBtn>

        <span className="print-topbar__title">{activeLabel}</span>

        <div className="print-topbar__actions">
          <button
            className="print-change-theme-btn"
            onClick={() => setPickerOpen(true)}
            type="button"
          >
            <GridIcon />
            <span className="print-change-theme-btn__text">{p.changeTheme}</span>
          </button>

          {!isInvitationView ? (
            <>
              <AppBtn
                variant="gold"
                size="sm"
                as="a"
                href={`/api/events/${eventId}/qr-pdf`}
                download
              >
                {p.downloadPdf}
              </AppBtn>
            </>
          ) : (
            <AppBtn
              variant="gold"
              size="sm"
              type="button"
              onClick={() => window.print()}
            >
              {p.print}
            </AppBtn>
          )}
        </div>
      </div>

      {/* ── Template picker bottom sheet ───────────────────────────── */}
      <TemplatePicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        eventId={eventId}
        activeTemplate={activeTemplate}
        eventKind={eventKind}
        paper={paper}
        posterLang={posterLang}
        chromePrint={chromePrint}
      />
    </>
  );
}
