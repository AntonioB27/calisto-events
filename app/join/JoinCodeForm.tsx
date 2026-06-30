"use client";

import { normalizeAccessCode } from "@/lib/access-code";
import { decodeJoinCodeFromScan } from "@/lib/join-code-from-scan";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { usePostHog } from "posthog-js/react";

import { useAppUi } from "@/components/AppUiProvider";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";

import { JoinQrScanner } from "./JoinQrScanner";

// ── Editorial Almanac palette ─────────────────────────────────────────────────
const GOLD   = '#C5922A';
const PURPLE = '#5B2D8E';
const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";

type JoinPreview = {
  title: string;
  eventDate: string | null;
  planId: string | null;
};

function parseDatePreview(dateStr: string | null) {
  if (!dateStr) return null;
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3) return null;
  const [y, m, d] = parts;
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return {
    day: d,
    month: date.toLocaleDateString('en', { month: 'long' }),
    year: y,
  };
}

export function JoinCodeForm({ isLoggedIn }: { isLoggedIn: boolean }) {
  const ui = useAppUi();
  const router = useRouter();
  const posthog = usePostHog();
  const [isDark, setIsDark] = useState(false);
  const [stage, setStage] = useState<"enter" | "scan" | "choice">("enter");
  const [code, setCode] = useState("");
  const [resolvedCode, setResolvedCode] = useState("");
  const [preview, setPreview] = useState<JoinPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    const obs = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  async function fetchJoinPreview(normalized: string, source: "form" | "scan"): Promise<boolean> {
    setLoadingPreview(true);
    setError(null);
    posthog.capture(ANALYTICS_EVENTS.GUEST_CODE_SUBMITTED, { source });
    try {
      const response = await fetch(`/api/join/preview?code=${encodeURIComponent(normalized)}`);
      if (response.status === 404) {
        setError(ui.joinForm.notFound);
        if (source === "form") setStage("enter");
        return false;
      }
      if (!response.ok) {
        throw new Error(`Preview failed with status ${response.status}`);
      }
      const data = (await response.json()) as JoinPreview;
      setResolvedCode(normalized);
      setPreview(data);
      if (isLoggedIn) {
        router.push(`/join/${encodeURIComponent(normalized)}`);
        return true;
      }
      setStage("choice");
      return true;
    } catch {
      setError(ui.joinForm.genericError);
      if (source === "form") setStage("enter");
      return false;
    } finally {
      setLoadingPreview(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const normalized = normalizeAccessCode(code);
    if (normalized.length < 4) {
      setError(ui.joinForm.codeTooShort);
      return;
    }
    await fetchJoinPreview(normalized, "form");
  }

  function onChangeCode() {
    setStage("enter");
    setPreview(null);
    setResolvedCode("");
    setError(null);
  }

  function onLogin() {
    const returnTo = `/join/${encodeURIComponent(resolvedCode)}`;
    router.push(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  function onContinueAsGuest() {
    posthog.capture(ANALYTICS_EVENTS.GUEST_JOINED_EVENT, { access_code: resolvedCode });
    router.push(`/join/${encodeURIComponent(resolvedCode)}`);
  }

  const parsedDate = parseDatePreview(preview?.eventDate ?? null);

  return (
    <div
      className="welcome-reveal"
      style={{
        padding: '40px 0 60px',
        maxWidth: 480,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      {/* Polaroid mascot */}
      <div className="welcome-mascot-float" style={{ marginBottom: 28 }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          {/* Washi tape */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: -10,
              left: '50%',
              transform: 'translateX(-50%) rotate(2deg)',
              width: 52,
              height: 14,
              background: 'rgba(212,168,67,0.48)',
              border: '0.5px solid rgba(212,168,67,0.6)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.22)',
              zIndex: 2,
              borderRadius: 2,
              pointerEvents: 'none',
            }}
          />
          {/* Polaroid card */}
          <div
            style={{
              background: '#f9f6f1',
              padding: '10px 10px 32px 10px',
              borderRadius: 2,
              boxShadow: '0 8px 28px rgba(0,0,0,0.28), 0 2px 6px rgba(0,0,0,0.16)',
              transform: 'rotate(2deg)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/mascot/aurora_qr.png"
              alt=""
              style={{
                width: 140,
                height: 140,
                objectFit: 'contain',
                objectPosition: 'center',
                display: 'block',
                borderRadius: 1,
              }}
            />
          </div>
        </div>
      </div>

      {/* Gold rule */}
      <div style={{ width: 32, height: 3, background: GOLD, borderRadius: 2, marginBottom: 16 }} />

      <h1
        style={{
          fontFamily: FS,
          fontStyle: 'italic',
          fontWeight: 700,
          fontSize: 'clamp(32px, 10vw, 44px)',
          color: 'var(--app-text)',
          lineHeight: 1.05,
          marginBottom: 10,
        }}
      >
        {ui.joinForm.title}
      </h1>
      <p
        style={{
          fontFamily: FS,
          fontStyle: 'italic',
          fontSize: 15,
          color: 'var(--app-muted)',
          marginBottom: 32,
          lineHeight: 1.6,
          maxWidth: 300,
        }}
      >
        {ui.joinForm.subtitle}
      </p>

      {/* Glass panel */}
      <div
        style={{
          width: '100%',
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.62)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.78)',
          boxShadow: isDark ? '0 10px 30px -8px rgba(0,0,0,0.4)' : '0 10px 30px -8px rgba(40,25,15,0.18), inset 0 1px 0 rgba(255,255,255,0.7)',
          borderRadius: 20,
          padding: '24px 20px',
        }}
      >
        {stage === 'enter' ? (
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Code label */}
            <div style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--app-muted)',
              fontFamily: FB,
              marginBottom: 8,
              textAlign: 'left',
            }}>
              {ui.joinForm.accessCodeLabel}
            </div>

            {/* Ticket-stub code input */}
            <input
              id="access-code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                if (error) setError(null);
              }}
              placeholder="CALISTO-XXXXXX"
              autoComplete="off"
              autoCapitalize="characters"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '16px 18px',
                fontSize: 20,
                fontWeight: 700,
                fontFamily: 'var(--font-mono, ui-monospace)',
                textAlign: 'center',
                letterSpacing: '0.14em',
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.85)',
                border: `2px dashed ${code.length > 5 ? GOLD : 'var(--app-border)'}`,
                borderRadius: 12,
                color: 'var(--app-text)',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />

            {/* Format hint */}
            <p style={{
              fontFamily: FS,
              fontStyle: 'italic',
              fontSize: 12,
              color: 'var(--app-muted)',
              marginTop: 8,
              marginBottom: 20,
              lineHeight: 1.5,
              textAlign: 'center',
            }}>
              {ui.joinForm.hintFormats}<strong style={{ fontStyle: 'normal' }}>CALISTO-S2UAQ4</strong>
            </p>

            {/* Error */}
            {error ? (
              <p role="alert" style={{ fontSize: 13, color: 'var(--app-danger)', marginBottom: 14, lineHeight: 1.45 }}>
                {error}
              </p>
            ) : null}

            {/* Primary: join */}
            <button
              type="submit"
              disabled={loadingPreview}
              className="welcome-btn welcome-btn--create"
              style={{ marginBottom: 12 }}
            >
              <span className="welcome-btn__inner">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
                  <path d="M8 1.5 L9.18 6.82 L14.5 8 L9.18 9.18 L8 14.5 L6.82 9.18 L1.5 8 L6.82 6.82 Z" />
                </svg>
                <span>{loadingPreview ? ui.common.loading : ui.joinForm.joinCta}</span>
              </span>
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2px 0 12px' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--app-border)' }} />
              <span style={{ fontSize: 11, color: 'var(--app-muted)', fontFamily: FB, letterSpacing: '0.08em' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--app-border)' }} />
            </div>

            {/* Secondary: scan QR */}
            <button
              type="button"
              disabled={loadingPreview}
              onClick={() => { setError(null); setStage('scan'); }}
              className="welcome-btn welcome-btn--join"
            >
              <span className="welcome-btn__inner">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                  <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M14 14h2v2h-2zM18 14h3v2h-3zM14 18h2v3h-2zM18 18h3v3h-3z" fill="currentColor" opacity="0.75" />
                </svg>
                <span>{ui.joinForm.scanQrInstead}</span>
              </span>
            </button>
          </form>
        ) : stage === 'scan' ? (
          <div style={{ textAlign: 'left' }}>
            {error ? (
              <p style={{ margin: '0 0 14px', fontSize: 14, color: 'var(--app-danger)', lineHeight: 1.45 }} role="alert">
                {error}
              </p>
            ) : null}
            {loadingPreview ? (
              <p style={{ margin: '0 0 14px', fontFamily: FS, fontStyle: 'italic', fontSize: 14, color: 'var(--app-muted)' }}>
                {ui.common.loading}
              </p>
            ) : null}
            <JoinQrScanner
              disabled={loadingPreview}
              strings={{
                title: ui.joinForm.scanQrTitle,
                hint: ui.joinForm.scanQrHint,
                startCamera: ui.joinForm.scanQrStartCamera,
                stopCamera: ui.joinForm.scanQrStopCamera,
                back: ui.joinForm.scanEnterInstead,
                unsupported: ui.joinForm.scanQrCamUnsupported,
                permissionDenied: ui.joinForm.scanQrPermissionDenied,
                noCamera: ui.joinForm.scanQrNoCamera,
              }}
              onRawScan={async (raw) => {
                const extracted = decodeJoinCodeFromScan(raw);
                if (!extracted) {
                  setError(ui.joinForm.scanInvalidQr);
                  return false;
                }
                setCode(extracted);
                return fetchJoinPreview(extracted, 'scan');
              }}
              onBack={() => {
                setStage('enter');
                setError(null);
              }}
            />
          </div>
        ) : (
          /* choice: unauthenticated user sees event preview + auth decision */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Event preview — polaroid-inspired card */}
            <div style={{ position: 'relative', marginBottom: 20 }}>
              {/* Washi tape */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  top: -8,
                  left: '40%',
                  width: 56,
                  height: 13,
                  background: 'rgba(212,168,67,0.48)',
                  border: '0.5px solid rgba(212,168,67,0.6)',
                  transform: 'rotate(-2deg)',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.18)',
                  zIndex: 2,
                  borderRadius: 2,
                  pointerEvents: 'none',
                }}
              />
              <div style={{
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.88)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.78)',
                borderRadius: 14,
                padding: '16px 16px 18px',
                textAlign: 'left',
                boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(40,25,15,0.12)',
                position: 'relative',
              }}>
                {/* Gold accent strip */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: 3,
                  background: `linear-gradient(90deg, ${GOLD}, rgba(197,146,42,0.25))`,
                  borderRadius: '14px 14px 0 0',
                }} />

                <div style={{
                  fontSize: 8.5,
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--app-muted)',
                  fontFamily: FB,
                  marginBottom: 8,
                  marginTop: 6,
                }}>
                  {ui.joinForm.previewEyebrow}
                </div>

                <div style={{
                  fontFamily: FS,
                  fontStyle: 'italic',
                  fontWeight: 700,
                  fontSize: 22,
                  color: 'var(--app-text)',
                  lineHeight: 1.15,
                  marginBottom: parsedDate ? 12 : 8,
                }}>
                  {preview?.title ?? ui.defaults.eventTitle}
                </div>

                {parsedDate && (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                    <span style={{
                      fontFamily: FS,
                      fontStyle: 'italic',
                      fontSize: 30,
                      color: GOLD,
                      letterSpacing: '-0.03em',
                      lineHeight: 1,
                    }}>
                      {parsedDate.day}
                    </span>
                    <div>
                      <div style={{ fontFamily: FS, fontStyle: 'italic', fontSize: 13, color: 'var(--app-text)', lineHeight: 1 }}>
                        {parsedDate.month}
                      </div>
                      <div style={{ fontFamily: FB, fontSize: 10, color: 'var(--app-muted)', marginTop: 1 }}>
                        {parsedDate.year}
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ fontFamily: FB, fontSize: 11, color: 'var(--app-muted)', letterSpacing: '0.04em' }}>
                  {ui.joinForm.codePrefix}{' '}
                  <span style={{
                    fontFamily: 'var(--font-mono, ui-monospace)',
                    color: 'var(--app-text)',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                  }}>
                    {resolvedCode}
                  </span>
                </div>
              </div>
            </div>

            {/* Primary: log in */}
            <button
              type="button"
              onClick={onLogin}
              className="welcome-btn welcome-btn--create"
              style={{ marginBottom: 10 }}
            >
              <span className="welcome-btn__inner">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <circle cx="7" cy="4.5" r="2.4" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M1 13.5 C1.5 10 4 8.5 7 8.5 S12.5 10 13 13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                <span>{ui.joinForm.haveAccount}</span>
              </span>
            </button>

            {/* Secondary: continue as guest */}
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="welcome-btn welcome-btn--join"
              style={{ marginBottom: 12 }}
            >
              <span className="welcome-btn__inner">
                <span>{ui.joinForm.guestContinue}</span>
              </span>
            </button>

            {/* Ghost: change code */}
            <button
              type="button"
              onClick={onChangeCode}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--app-muted)',
                fontFamily: FB,
                fontSize: 13,
                cursor: 'pointer',
                padding: '8px 0',
                textDecoration: 'underline',
                textDecorationColor: `${PURPLE}60`,
                textUnderlineOffset: 3,
              }}
            >
              {ui.joinForm.changeCode}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
