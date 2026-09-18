"use client";

import { prepareInvitationPrint } from "@/lib/event-print/prepare-invitation-print";
import { invitationWorkspaceCopy } from "@/lib/event-print/invitation-workspace-copy";
import { useState } from "react";
import Link from "next/link";

import { AppBtn } from "@/components/app-ui/AppBtn";
import type { AppUiDict } from "@/lib/app-ui/en";
import type { EventKind } from "@/lib/event-kind";
import type { Locale } from "@/lib/i18n";
import {
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
  uiLocale?: Locale;
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
  uiLocale = "en",
}: EventPrintToolbarProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const p = chromePrint;
  const copy = invitationWorkspaceCopy(uiLocale);
  const [preparing, setPreparing] = useState(false);
  const [printError, setPrintError] = useState(false);
  async function print() {
    setPreparing(true); setPrintError(false);
    try {
      const proof = document.querySelector<HTMLElement>('[data-invitation-proof]');
      if (proof) await Promise.race([prepareInvitationPrint(proof), new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 20000))]);
      window.print();
    } catch { setPrintError(true); }
    finally { setPreparing(false); }
  }
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
          {!isInvitationPrintTemplateId(activeTemplate) && <button
            className="print-change-theme-btn"
            onClick={() => setPickerOpen(true)}
            type="button"
          >
            <GridIcon />
            <span className="print-change-theme-btn__text">{p.changeTheme}</span>
          </button>}

          {!isInvitationView ? (
            <>
              <AppBtn
                variant="gold"
                size="sm"
                as="a"
                href={`/api/events/${eventId}/qr-pdf?template=${encodeURIComponent(activeTemplate)}`}
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
              disabled={preparing}
              onClick={() => void print()}
            >
              {preparing ? copy.preparing : p.print}
            </AppBtn>
          )}
        </div>
      </div>

      {printError && <p className="invitation-print-help" role="alert">{copy.assetFail}</p>}
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
