"use client";

import type { CSSProperties } from "react";
import Link from "next/link";

import { AppBtn } from "@/components/app-ui/AppBtn";
import type { AppUiDict } from "@/lib/app-ui/en";
import type { EventKind } from "@/lib/event-kind";
import type { Locale } from "@/lib/i18n";
import { LOCALES } from "@/lib/i18n";
import {
  POSTER_LANG_QUERY,
  POSTER_TEMPLATES,
  type PrintPaperId,
  type PrintRouteTemplateId,
} from "@/lib/event-print/print-options";
import { isInvitationPrintTemplateId } from "@/lib/event-print/template-catalog";

export type EventPrintToolbarProps = Readonly<{
  eventId: string;
  activeTemplate: PrintRouteTemplateId;
  eventKind: EventKind;
  paper: PrintPaperId;
  posterLang: Locale;
  /** Organizer-facing controls (UI language). */
  chromePrint: AppUiDict["print"];
  localeOptionLabels: AppUiDict["languagePicker"]["locales"];
  backHref: string;
  backLabel: string;
  sheetHelperLine: string;
}>;

function buildPrintHref(
  eventId: string,
  opts: Readonly<{ template: PrintRouteTemplateId; paper: PrintPaperId; posterLang: Locale }>,
): string {
  const q = new URLSearchParams();
  q.set("template", opts.template);
  q.set("paper", opts.paper);
  q.set(POSTER_LANG_QUERY, opts.posterLang);
  return `/events/${eventId}/print?${q.toString()}`;
}

function pickStyle(active: boolean): CSSProperties {
  return {
    padding: "8px 14px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    border: active ? "1.5px solid var(--app-gold)" : "1.5px solid var(--app-border)",
    background: active ? "color-mix(in srgb, var(--app-gold) 12%, transparent)" : "var(--app-surface)",
    color: "var(--app-text)",
    textDecoration: "none",
    cursor: "pointer",
  };
}

function localeButtonLabel(loc: Locale, localeOptionLabels: AppUiDict["languagePicker"]["locales"]): string {
  if (loc === "en") return localeOptionLabels.en;
  if (loc === "hr") return localeOptionLabels.hr;
  return localeOptionLabels.de;
}

export function EventPrintToolbar({
  eventId,
  activeTemplate,
  eventKind,
  paper,
  posterLang,
  chromePrint,
  localeOptionLabels,
  backHref,
  backLabel,
  sheetHelperLine,
}: EventPrintToolbarProps) {
  const p = chromePrint;
  const isInvitationView = isInvitationPrintTemplateId(activeTemplate);
  const showWeddingPicker = eventKind === "wedding";
  const tableSectionHeading = showWeddingPicker ? p.tableCategoryLabel : p.templateSectionLabel;

  return (
    <div className="print:hidden" style={{ marginBottom: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <AppBtn variant="ghost" size="sm" href={backHref} as={Link}>
          {backLabel}
        </AppBtn>
        <AppBtn variant="gold" size="sm" type="button" onClick={() => window.print()}>
          {p.print}
        </AppBtn>
      </div>

      <p style={{ fontSize: 13, lineHeight: 1.45, color: "var(--app-muted)", maxWidth: 560, marginBottom: 20 }}>
        {sheetHelperLine}
      </p>

      {!isInvitationView ? (
        <div style={{ marginBottom: 14 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--app-muted)",
            }}
          >
            {p.posterLanguageLabel}
          </p>
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {LOCALES.map((loc) => (
              <Link
                key={loc}
                href={buildPrintHref(eventId, { template: activeTemplate, paper, posterLang: loc })}
                scroll={false}
                style={pickStyle(posterLang === loc)}
                prefetch={false}
              >
                {localeButtonLabel(loc, localeOptionLabels)}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {showWeddingPicker ? (
        <div style={{ marginBottom: 14 }}>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--app-muted)",
            }}
          >
            {p.inviteCategoryLabel}
          </p>
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Link
              href={buildPrintHref(eventId, { template: "wedding-invite-blue-floral", paper, posterLang })}
              scroll={false}
              style={pickStyle(activeTemplate === "wedding-invite-blue-floral")}
              prefetch={false}
            >
              {p.templateWeddingInviteBlueFloral}
            </Link>
            <Link
              href={buildPrintHref(eventId, { template: "wedding-invite-geometric", paper, posterLang })}
              scroll={false}
              style={pickStyle(activeTemplate === "wedding-invite-geometric")}
              prefetch={false}
            >
              {p.templateWeddingInviteGeometric}
            </Link>
            <Link
              href={buildPrintHref(eventId, { template: "wedding-invite-watercolor-coast", paper, posterLang })}
              scroll={false}
              style={pickStyle(activeTemplate === "wedding-invite-watercolor-coast")}
              prefetch={false}
            >
              {p.templateWeddingInviteWatercolorCoast}
            </Link>
            <Link
              href={buildPrintHref(eventId, { template: "wedding-invite-navy-botanical", paper, posterLang })}
              scroll={false}
              style={pickStyle(activeTemplate === "wedding-invite-navy-botanical")}
              prefetch={false}
            >
              {p.templateWeddingInviteNavyBotanical}
            </Link>
            <Link
              href={buildPrintHref(eventId, { template: "wedding-invite-terra-pill", paper, posterLang })}
              scroll={false}
              style={pickStyle(activeTemplate === "wedding-invite-terra-pill")}
              prefetch={false}
            >
              {p.templateWeddingInviteTerraPill}
            </Link>
            <Link
              href={buildPrintHref(eventId, { template: "wedding-invite-gold-arch-floral", paper, posterLang })}
              scroll={false}
              style={pickStyle(activeTemplate === "wedding-invite-gold-arch-floral")}
              prefetch={false}
            >
              {p.templateWeddingInviteGoldArchFloral}
            </Link>
            <Link
              href={buildPrintHref(eventId, { template: "wedding-invite-cherry-blossom", paper, posterLang })}
              scroll={false}
              style={pickStyle(activeTemplate === "wedding-invite-cherry-blossom")}
              prefetch={false}
            >
              {p.templateWeddingInviteCherryBlossom}
            </Link>
            <Link
              href={buildPrintHref(eventId, { template: "wedding-invite-olive-gold-frame", paper, posterLang })}
              scroll={false}
              style={pickStyle(activeTemplate === "wedding-invite-olive-gold-frame")}
              prefetch={false}
            >
              {p.templateWeddingInviteOliveGoldFrame}
            </Link>
            <Link
              href={buildPrintHref(eventId, { template: "wedding-invite-grayscale-glitter", paper, posterLang })}
              scroll={false}
              style={pickStyle(activeTemplate === "wedding-invite-grayscale-glitter")}
              prefetch={false}
            >
              {p.templateWeddingInviteGrayscaleGlitter}
            </Link>
          </div>
        </div>
      ) : null}

      <div style={{ marginBottom: 14 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--app-muted)",
          }}
        >
          {tableSectionHeading}
        </p>
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {POSTER_TEMPLATES.map((tid) => (
            <Link
              key={tid}
              href={buildPrintHref(eventId, { template: tid, paper, posterLang })}
              scroll={false}
              style={pickStyle(activeTemplate === tid)}
              prefetch={false}
            >
              {tid === "table-minimal" ? p.templateTableMinimal : p.templateTableBold}
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
