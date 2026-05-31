"use client";

import { useEffect, useState } from "react";
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

export function PrintsTab({
  eventId,
  eventKind,
  printsEventKindSetAt,
  eventDisplayName,
  eventDateIso,
  uiLocale,
  printDraftByTemplateId,
}: PrintsTabProps) {
  const ui = useAppUi();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  return (
    <section style={{ padding: '52px 20px 72px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Polaroid */}
      <div className="polaroid-sway" style={{ position: 'relative', width: 300 }}>

        {/* Washi tape */}
        <div aria-hidden style={{ position: 'absolute', top: -10, left: '26%', width: 80, height: 16, background: 'rgba(212,168,67,0.45)', border: '0.5px solid rgba(212,168,67,0.55)', transform: 'rotate(-3deg)', boxShadow: '0 1px 4px rgba(0,0,0,0.18)', zIndex: 2, borderRadius: 2, pointerEvents: 'none' }} />

        {/* Card */}
        <div style={{
          background: isDark ? '#1e1a17' : '#f4f0ea',
          borderRadius: 3,
          boxShadow: isDark
            ? '0 8px 28px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)'
            : '0 8px 28px rgba(0,0,0,0.38), 0 2px 8px rgba(0,0,0,0.18)',
          transform: 'rotate(1deg)',
          padding: '12px 12px 28px',
        }}>

          {/* Photo area */}
          <div style={{
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            aspectRatio: '1 / 1',
            marginBottom: 16,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/mascot/aurora_camera.png" alt="" aria-hidden style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '130%', height: '130%', objectFit: 'contain' }} />
          </div>

          {/* Caption */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontStyle: 'italic', fontWeight: 400, fontSize: 28, color: '#c5922a', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {ui.printsTab.comingSoonHeading}
            </div>
            <div style={{ width: 32, height: 2, background: '#c5922a', borderRadius: 1, margin: '8px auto 10px', opacity: 0.5 }} />
            <div style={{ fontFamily: "'DM Serif Display', serif", fontStyle: 'italic', fontSize: 14, color: isDark ? '#d4c4a8' : '#2a1d0f', lineHeight: 1.45, padding: '0 4px' }}>
              {ui.printsTab.comingSoonDesc}
            </div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: isDark ? '#7a6a5a' : '#9A8570', lineHeight: 1.5, marginTop: 8, padding: '0 4px' }}>
              {ui.printsTab.comingSoonDesc2}
            </div>
            <div style={{ marginTop: 14, display: 'inline-block', fontSize: 8.5, color: isDark ? '#7a6a5a' : '#9A8570', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>
              {ui.printsTab.comingSoonBadge}
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
