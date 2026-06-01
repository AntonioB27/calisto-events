"use client";

import { useAppUi } from "@/components/AppUiProvider";
import { getWebJoinUrl } from "@/lib/join-link";
import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import Link from "next/link";
import { AppBtn } from "@/components/app-ui/AppBtn";

// ── Palette ───────────────────────────────────────────────────────────────────
const GOLD      = '#C5922A';
const GOLD_FOIL = 'linear-gradient(90deg, transparent, #946C18 20%, #E6BF66 45%, #C5922A 65%, #946C18 82%, transparent)';
const PURPLE    = '#5B2D8E';
const FB        = "'DM Sans', sans-serif";
const FS        = "'DM Serif Display', serif";
const FM        = "'JetBrains Mono', ui-monospace, monospace";

const GLASS_LIGHT: React.CSSProperties = {
  background: 'linear-gradient(155deg, rgba(139,79,216,0.16) 0%, rgba(197,146,42,0.1) 55%, transparent 100%), rgba(255,255,255,0.72)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.82)',
  boxShadow: '0 16px 48px -12px rgba(40,25,15,0.2), inset 0 1px 0 rgba(255,255,255,0.75)',
};

const GLASS_DARK: React.CSSProperties = {
  background: 'linear-gradient(155deg, rgba(139,79,216,0.28) 0%, rgba(197,146,42,0.16) 55%, transparent 100%), rgba(255,255,255,0.06)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 16px 48px -12px rgba(0,0,0,0.5)',
};

type ShareTabProps = Readonly<{
  eventId: string;
  accessCode: string;
  eventTitle: string;
  publicOrigin: string;
}>;

export function ShareTab({ eventId, accessCode, eventTitle, publicOrigin }: ShareTabProps) {
  const ui = useAppUi();
  const [copied, setCopied] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(null), 2000);
    return () => window.clearTimeout(t);
  }, [copied]);

  const joinUrl = useMemo(() => getWebJoinUrl(publicOrigin, accessCode), [publicOrigin, accessCode]);

  async function copyToClipboard(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setShareError(null);
    } catch {
      setShareError(ui.share.copyFailManual);
    }
  }

  async function shareInvite() {
    setShareError(null);
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: eventTitle, url: joinUrl });
        return;
      }
      await copyToClipboard('link', joinUrl);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setShareError(ui.share.shareUnavailable);
    }
  }

  const glass = isDark ? GLASS_DARK : GLASS_LIGHT;
  const textColor = isDark ? 'rgba(255,255,255,0.9)' : 'var(--app-text)';
  const mutedColor = isDark ? 'rgba(255,255,255,0.45)' : 'var(--app-muted)';
  const borderColor = isDark ? 'rgba(255,255,255,0.14)' : 'var(--app-border)';

  return (
    <section className="welcome-reveal" style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '2px 0 32px' }}>

      {/* ── QR hero card ── */}
      <div
        style={{
          ...glass,
          borderRadius: 24,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Gold ruled top line */}
        <div aria-hidden style={{ height: 2, background: GOLD_FOIL, opacity: 0.9 }} />

        {/* Aurora glow behind QR */}
        <div aria-hidden style={{ position: 'absolute', top: '38%', left: '50%', transform: 'translateX(-50%)', width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,79,216,0.38), transparent 65%)', filter: 'blur(32px)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ padding: '20px 22px 26px', position: 'relative', zIndex: 1 }}>
          {/* Event name */}
          <p style={{ margin: '0 0 16px', textAlign: 'center', fontFamily: FS, fontStyle: 'italic', fontSize: 15, color: mutedColor, lineHeight: 1.3 }}>
            {eventTitle}
          </p>

          {/* Access code block */}
          <div style={{
            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.88)',
            border: `1px dashed ${isDark ? 'rgba(255,255,255,0.22)' : 'rgba(197,146,42,0.45)'}`,
            borderRadius: 12,
            padding: '10px 16px',
            fontFamily: FM,
            fontSize: 20,
            fontWeight: 700,
            color: textColor,
            letterSpacing: '0.16em',
            textAlign: 'center',
            marginBottom: 22,
          }}>
            {accessCode}
          </div>

          {/* QR code */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: 12,
              boxShadow: isDark
                ? '0 12px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.06)'
                : '0 12px 40px rgba(40,25,15,0.18), 0 0 0 1px rgba(197,146,42,0.15)',
            }}>
              <QRCode value={joinUrl} size={200} />
            </div>
          </div>

          {/* Scan hint */}
          <p style={{ margin: 0, textAlign: 'center', fontFamily: FS, fontStyle: 'italic', fontSize: 12, color: mutedColor, lineHeight: 1.5 }}>
            {ui.share.scanQr}
          </p>
        </div>
      </div>

      {/* ── Copy chips ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { label: 'code', text: accessCode, display: ui.invites.code },
          { label: 'link', text: joinUrl, display: ui.invites.link },
        ].map(({ label, text, display }) => {
          const isActive = copied === label;
          return (
            <button
              key={label}
              type="button"
              onClick={() => void copyToClipboard(label, text)}
              style={{
                background: isActive
                  ? (isDark ? 'rgba(197,146,42,0.18)' : 'rgba(197,146,42,0.1)')
                  : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.75)'),
                border: `1px solid ${isActive ? GOLD : borderColor}`,
                borderRadius: 12,
                padding: '11px 12px',
                fontFamily: FB,
                fontSize: 13,
                fontWeight: 600,
                color: isActive ? GOLD : (isDark ? 'rgba(255,255,255,0.75)' : 'var(--app-text)'),
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              {isActive ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <path d="M3 8l4 4 6-6" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {ui.common.copied}
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
                    <rect x="5" y="1" width="9" height="11" rx="2" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M2 4v10a2 2 0 002 2h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  {display}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Error ── */}
      {shareError && (
        <p style={{ fontSize: 13, color: 'var(--app-danger)', background: 'color-mix(in srgb, var(--app-danger) 10%, transparent)', border: '1.5px solid color-mix(in srgb, var(--app-danger) 30%, transparent)', padding: '10px 14px', borderRadius: 10, margin: 0 }}>
          {shareError}
        </p>
      )}

      {/* ── Share CTA ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <button
          type="button"
          onClick={() => void shareInvite()}
          style={{
            width: '100%',
            background: `linear-gradient(135deg, #7B3FBE, ${PURPLE})`,
            border: 'none',
            borderRadius: 14,
            padding: '14px 20px',
            fontFamily: FB,
            fontSize: 15,
            fontWeight: 600,
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(91,45,142,0.38)',
            letterSpacing: '0.01em',
          }}
        >
          {ui.share.shareInvite}
        </button>

        <Link
          href={`/events/${eventId}/print`}
          style={{
            fontFamily: FB,
            fontSize: 13,
            fontWeight: 500,
            color: isDark ? 'rgba(255,255,255,0.4)' : 'var(--app-muted)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            letterSpacing: '0.01em',
          }}
        >
          {ui.share.printPoster}
          <span aria-hidden style={{ opacity: 0.7 }}>→</span>
        </Link>
      </div>

    </section>
  );
}
