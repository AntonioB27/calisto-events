"use client";

import type { CSSProperties } from "react";
import Link from "next/link";

import { AppBtn } from "@/components/app-ui/AppBtn";
import type { AppUiDict } from "@/lib/app-ui/en";
import type { Locale } from "@/lib/i18n";
import { LOCALES } from "@/lib/i18n";
import {
  POSTER_LANG_QUERY,
  type PosterTemplateId,
  type PrintPaperId,
  POSTER_TEMPLATES,
  PRINT_PAPERS,
} from "@/lib/event-print/print-options";

export type EventPrintToolbarProps = Readonly<{
  eventId: string;
  template: PosterTemplateId;
  paper: PrintPaperId;
  posterLang: Locale;
  /** Organizer-facing controls (UI language). */
  chromePrint: AppUiDict["print"];
  localeOptionLabels: AppUiDict["languagePicker"]["locales"];
}>;

function buildPrintHref(
  eventId: string,
  opts: Readonly<{ template: PosterTemplateId; paper: PrintPaperId; posterLang: Locale }>,
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
  template,
  paper,
  posterLang,
  chromePrint,
  localeOptionLabels,
}: EventPrintToolbarProps) {
  const p = chromePrint;

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
        <AppBtn variant="ghost" size="sm" href={`/events/${eventId}?tab=share`} as={Link}>
          {p.backShare}
        </AppBtn>
        <AppBtn variant="gold" size="sm" type="button" onClick={() => window.print()}>
          {p.print}
        </AppBtn>
      </div>

      <p style={{ fontSize: 13, lineHeight: 1.45, color: "var(--app-muted)", maxWidth: 560, marginBottom: 20 }}>
        {p.sheetHelper}
      </p>

      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--app-muted)" }}>
          {p.posterLanguageLabel}
        </p>
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {LOCALES.map((loc) => (
            <Link
              key={loc}
              href={buildPrintHref(eventId, { template, paper, posterLang: loc })}
              scroll={false}
              style={pickStyle(posterLang === loc)}
              prefetch={false}
            >
              {localeButtonLabel(loc, localeOptionLabels)}
            </Link>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--app-muted)" }}>
          {p.templateSectionLabel}
        </p>
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {POSTER_TEMPLATES.map((tid) => (
            <Link
              key={tid}
              href={buildPrintHref(eventId, { template: tid, paper, posterLang })}
              scroll={false}
              style={pickStyle(template === tid)}
              prefetch={false}
            >
              {tid === "table-minimal" ? p.templateTableMinimal : p.templateTableBold}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--app-muted)" }}>
          {p.paperSectionLabel}
        </p>
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PRINT_PAPERS.map((pid) => (
            <Link
              key={pid}
              href={buildPrintHref(eventId, { template, paper: pid, posterLang })}
              scroll={false}
              style={pickStyle(paper === pid)}
              prefetch={false}
            >
              {pid === "a4" ? p.paperA4 : p.paperLetter}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
