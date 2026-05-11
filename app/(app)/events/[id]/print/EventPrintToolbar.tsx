"use client";

import type { CSSProperties } from "react";
import Link from "next/link";

import { AppBtn } from "@/components/app-ui/AppBtn";
import type { AppUiDict } from "@/lib/app-ui/en";
import { type PosterTemplateId, type PrintPaperId, POSTER_TEMPLATES, PRINT_PAPERS } from "@/lib/event-print/print-options";

export type EventPrintToolbarProps = Readonly<{
  eventId: string;
  template: PosterTemplateId;
  paper: PrintPaperId;
  print: AppUiDict["print"];
}>;

function buildPrintHref(eventId: string, template: PosterTemplateId, paper: PrintPaperId): string {
  const q = new URLSearchParams();
  q.set("template", template);
  q.set("paper", paper);
  const qs = q.toString();
  return `/events/${eventId}/print${qs ? `?${qs}` : ""}`;
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

export function EventPrintToolbar({ eventId, template, paper, print }: EventPrintToolbarProps) {
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
          {print.backShare}
        </AppBtn>
        <AppBtn variant="gold" size="sm" type="button" onClick={() => window.print()}>
          {print.print}
        </AppBtn>
      </div>

      <p style={{ fontSize: 13, lineHeight: 1.45, color: "var(--app-muted)", maxWidth: 560, marginBottom: 20 }}>
        {print.sheetHelper}
      </p>

      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--app-muted)" }}>
          {print.templateSectionLabel}
        </p>
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {POSTER_TEMPLATES.map((tid) => (
            <Link
              key={tid}
              href={buildPrintHref(eventId, tid, paper)}
              scroll={false}
              style={pickStyle(template === tid)}
              prefetch={false}
            >
              {tid === "table-minimal" ? print.templateTableMinimal : print.templateTableBold}
            </Link>
          ))}
        </div>
      </div>

      <div>
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--app-muted)" }}>
          {print.paperSectionLabel}
        </p>
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {PRINT_PAPERS.map((pid) => (
            <Link
              key={pid}
              href={buildPrintHref(eventId, template, pid)}
              scroll={false}
              style={pickStyle(paper === pid)}
              prefetch={false}
            >
              {pid === "a4" ? print.paperA4 : print.paperLetter}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
