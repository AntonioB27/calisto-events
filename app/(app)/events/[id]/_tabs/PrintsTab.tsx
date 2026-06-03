"use client";

import Link from "next/link";
import { useAppUi } from "@/components/AppUiProvider";

type PrintsTabProps = Readonly<{
  eventId: string;
  eventKind: string;
  printsEventKindSetAt: string | null;
  eventDisplayName: string;
  eventDateIso: string;
  uiLocale: string;
  printDraftByTemplateId: Readonly<Record<string, Readonly<Record<string, string>>>>;
}>;

const GOLD   = '#C5922A';
const PURPLE = '#5B2D8E';
const TEXT   = 'var(--app-text)';
const MUTED  = 'var(--app-muted)';
const BORDER = 'var(--app-border)';
const SURFACE = 'var(--app-surface)';

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

function ThemeRail() {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {THEME_SWATCHES.map((bg, i) => (
        <span
          key={i}
          style={{
            width: 18, height: 24, borderRadius: 4,
            background: bg,
            border: '1px solid rgba(0,0,0,0.1)',
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

function PrinterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="6" y="14" width="12" height="7" rx="1" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function InviteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 9l9 6 9-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PrintsTab({
  eventId,
  eventKind,
}: PrintsTabProps) {
  const ui = useAppUi();
  const t = ui.printsTab;
  const isWedding = eventKind === 'wedding';

  return (
    <section style={{ padding: '24px 16px 64px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 560, margin: '0 auto', width: '100%' }}>

      {/* Section heading */}
      <div style={{ paddingBottom: 8 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, marginBottom: 4 }}>
          {t.title}
        </p>
        <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
          {t.subtitle}
        </p>
      </div>

      {/* QR Cards entry card */}
      <Link
        href={`/events/${eventId}/print?template=qr-playful&paper=a4`}
        style={{ textDecoration: 'none' }}
      >
        <div style={{
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          padding: '18px 18px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          cursor: 'pointer',
          transition: 'box-shadow 0.15s',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: `linear-gradient(135deg, ${GOLD}22, ${GOLD}44)`,
                border: `1.5px solid ${GOLD}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: GOLD,
              }}>
                <PrinterIcon />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, lineHeight: 1.2 }}>
                  {t.categoryTableQr}
                </div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                  16 {ui.print.printThemeLabel?.toLowerCase() ?? 'themes'}
                </div>
              </div>
            </div>
            <div style={{ color: MUTED, flexShrink: 0, marginTop: 2 }}>
              <ArrowIcon />
            </div>
          </div>

          <ThemeRail />

          <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.5, margin: 0 }}>
            {t.tableTemplateHint}
          </p>
        </div>
      </Link>

      {/* Invitations entry card (wedding only) — coming soon */}
      {isWedding && (
        <div style={{
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          borderRadius: 16,
          padding: '18px 18px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          opacity: 0.6,
          cursor: 'default',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: `linear-gradient(135deg, ${PURPLE}22, ${PURPLE}44)`,
                border: `1.5px solid ${PURPLE}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: PURPLE,
              }}>
                <InviteIcon />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: TEXT, lineHeight: 1.2 }}>
                  {t.categoryInvitation}
                </div>
                <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                  10 designs
                </div>
              </div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: MUTED, background: BORDER, borderRadius: 6, padding: '3px 8px',
              flexShrink: 0, marginTop: 2,
            }}>
              {t.invitationsComingSoon}
            </span>
          </div>
          <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.5, margin: 0 }}>
            {t.invitationsComingSoonHint}
          </p>
        </div>
      )}

    </section>
  );
}
