"use client";

import Link from "next/link";
import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { TabHeader } from "@/components/app-ui/TabHeader";
import { interpolate } from "@/lib/app-ui";
import { plural } from "@/lib/app-ui/plural";
import { INVITATION_PRINT_TEMPLATE_IDS, QR_THEMED_PRINT_TEMPLATE_IDS } from "@/lib/event-print/template-catalog";

import "./rsvp-prints.css";

type PrintsTabProps = Readonly<{
  eventId: string;
  eventKind: string;
  printsEventKindSetAt: string | null;
  eventDisplayName: string;
  eventDateIso: string;
  uiLocale: string;
  printDraftByTemplateId: Readonly<Record<string, Readonly<Record<string, string>>>>;
}>;

// Small colour chips representing the 16 QR themes
const THEME_SWATCHES = [
  '#ffffff',   // Simple
  '#f9f1ec',   // Romantic
  '#17110b',   // Luxurious
  '#dfe8d6',   // Botanical
  '#0c352c',   // Art Deco
  '#fdf7ef',   // Playful
  '#0c1430',   // Celestial
  '#e6f1f2',   // Coastal
  '#f1e4d4',   // Boho
  '#111111',   // Noir
  '#fdfbf7',   // Watercolor
  '#e9d29a',   // Retro
  '#e2f0e3',   // Tropical
  '#edeae3',   // Scandi
  '#f5567f',   // Sunset
  '#c9a87c',   // Rustic
];

// Illustrative table cards: Boho, Botanical and Romantic backgrounds; centre card ("c") last so it sits on top.
const FAN = [
  { pos: "l", bg: "#f1e4d4", ink: "#8a5f12" },
  { pos: "r", bg: "#dfe8d6", ink: "#46573a" },
  { pos: "c", bg: "#f9f1ec", ink: "#5b2d8e" },
] as const;

// Decorative, not scannable: three finder squares and some filler.
const MINI_QR = ["111.111", "1.1.1.1", "111.111", "..1.1..", "111..1.", "1.1.1.1", "111.1.1"];

function MiniQr() {
  return (
    <svg className="prints-fan__qr" viewBox="0 0 7 7" shapeRendering="crispEdges">
      {MINI_QR.flatMap((line, y) =>
        [...line].map((cell, x) => (cell === "1" ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#221509" /> : null)),
      )}
    </svg>
  );
}

export function PrintsTab({
  eventId,
  eventKind,
  eventDisplayName,
}: PrintsTabProps) {
  const ui = useAppUi();
  const t = ui.printsTab;
  const isWedding = eventKind === 'wedding';

  return (
    <section className="prints-tab">
      <TabHeader title={t.title} pose="qr">
        {t.headerLine}
      </TabHeader>

      <section className="tab-card tab-card--raised" aria-labelledby="prints-qr-title">
        <div className="prints-fan" aria-hidden="true">
          {FAN.map((card) => (
            <div key={card.pos} className={`prints-fan__card prints-fan__card--${card.pos}`} style={{ background: card.bg, color: card.ink }}>
              <span className="prints-fan__name">{eventDisplayName}</span>
              <MiniQr />
              <span className="prints-fan__note">{t.qrCardsPreviewNote}</span>
            </div>
          ))}
        </div>
        <h2 id="prints-qr-title" className="tab-card__title prints-qr__title">
          {t.qrCardsTitle}
        </h2>
        <p className="prints-qr__meta">
          {interpolate(t.qrCardsMeta, {
            themes: plural(ui.locale, QR_THEMED_PRINT_TEMPLATE_IDS.length, t.themes),
            a4: ui.print.paperA4,
            letter: ui.print.paperLetter,
          })}
        </p>
        <div className="prints-swatches" aria-hidden="true">
          {THEME_SWATCHES.map((bg) => (
            <span key={bg} className="prints-swatch" style={{ background: bg }} />
          ))}
        </div>
        <AppBtn
          as={Link}
          href={`/events/${eventId}/print?template=qr-playful&paper=a4`}
          variant="gold"
          size="lg"
          className="prints-qr__cta"
        >
          {t.qrCardsCta}
        </AppBtn>
      </section>

      {/* Invitations (wedding only), not available yet */}
      {isWedding && (
        <section className="prints-soon" aria-labelledby="prints-invites-title">
          <div className="prints-soon__stack" aria-hidden="true">
            <span className="prints-soon__paper prints-soon__paper--back" />
            <span className="prints-soon__paper prints-soon__paper--front">&amp;</span>
          </div>
          <div className="prints-soon__text">
            <span className="prints-pill">{t.invitationsComingSoon}</span>
            <h2 id="prints-invites-title" className="prints-soon__title">
              {t.categoryInvitation}
            </h2>
            <p className="prints-soon__meta">{plural(ui.locale, INVITATION_PRINT_TEMPLATE_IDS.length, t.invitationDesigns)}</p>
          </div>
        </section>
      )}
    </section>
  );
}
