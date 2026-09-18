"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppBtn } from "@/components/app-ui/AppBtn";
import type { EventKind } from "@/lib/event-kind";
import { INVITATION_PRINT_TEMPLATE_IDS } from "@/lib/event-print/template-catalog";
import { useAppUi } from "@/components/AppUiProvider";

type PrintsTabProps = Readonly<{
  eventId: string;
  eventKind: EventKind;
  printsEventKindSetAt: string | null;
}>;

const GOLD   = '#C5922A';
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
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
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

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PrintsTab(props: PrintsTabProps) {
  const { eventId, eventKind } = props;
  const ui = useAppUi();
  const t = ui.printsTab;
  const router = useRouter();
  const [savingKind, setSavingKind] = useState(false);
  const [kindError, setKindError] = useState<string | null>(null);
  async function confirmKind(eventKind: EventKind) {
    setSavingKind(true);
    setKindError(null);
    try {
      const response = await fetch(`/api/events/${eventId}/prints-confirm-event-kind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventKind }),
      });
      if (!response.ok) throw new Error();
      router.refresh();
    } catch {
      setKindError(t.confirmKindFail);
    } finally {
      setSavingKind(false);
    }
  }
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

      {isWedding ? (
        <Link
          href={`/events/${eventId}/invitations`}
          className="block rounded-2xl border p-[18px] transition-colors hover:border-[var(--app-gold)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--app-gold)]"
          style={{ background: SURFACE, borderColor: BORDER, textDecoration: "none" }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "#5B2D8E22", color: "var(--app-text)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
              </span>
              <div>
                <h2 style={{ color: TEXT, fontSize: 15, fontWeight: 700 }}>{t.categoryInvitation}</h2>
                <p style={{ color: MUTED, fontSize: 12 }}>{t.invitationDesignCount.replace("{count}", String(INVITATION_PRINT_TEMPLATE_IDS.length))}</p>
              </div>
            </div>
            <span style={{ color: MUTED }}><ArrowIcon /></span>
          </div>
          <p style={{ color: MUTED, fontSize: 13, lineHeight: 1.5, marginTop: 12 }}>{t.invitationEditorHint}</p>
        </Link>
      ) : (
        <section style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 18 }}>
          <h2 style={{ color: TEXT, fontSize: 18, fontWeight: 600 }}>{t.categoryInvitation}</h2>
          <p style={{ color: MUTED, fontSize: 14, marginTop: 8 }}>{t.invitationsWeddingOnly}</p>
          {!props.printsEventKindSetAt && (
            <>
              <p style={{ color: TEXT, marginTop: 16, marginBottom: 12 }}>{t.kindTitle}</p>
              <div className="flex flex-wrap gap-3">
                <AppBtn type="button" variant="gold" disabled={savingKind} onClick={() => void confirmKind("wedding")}>
                  {t.kindOptionWedding}
                </AppBtn>
                <AppBtn type="button" variant="outline" disabled={savingKind} onClick={() => void confirmKind("generic")}>
                  {t.kindOptionGeneric}
                </AppBtn>
              </div>
              {kindError && <p role="alert" style={{ marginTop: 12, color: "var(--app-danger)" }}>{kindError}</p>}
            </>
          )}
        </section>
      )}

    </section>
  );
}
