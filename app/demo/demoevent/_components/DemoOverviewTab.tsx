"use client";

import React, { useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import { Camera, Clapperboard, Users } from "lucide-react";
import { useAppUi } from "@/components/AppUiProvider";
import { DEMO_EVENT, DEMO_GUESTS, DEMO_PHOTOS } from "../_data/demo-event";
import { useDemoToast } from "./DemoToastProvider";
import { formatQuotaSublabelLocalized, getPlanLimits, isUnlimitedQuota } from "@/lib/plan-limits";
import { getWebJoinUrl } from "@/lib/join-link";

const GOLD       = '#C5922A';
const PURPLE     = '#5B2D8E';
const RUST       = '#D17A2A';
const GOLD_FOIL  = 'linear-gradient(135deg, #E6BF66 0%, #C5922A 45%, #F4D88F 70%, #946C18 100%)';
const TEXT       = 'var(--app-text)';
const TEXT_S     = 'var(--app-text-sub)';
const MUTED      = 'var(--app-muted)';
const BORDER     = 'var(--app-border)';
const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";

const GLARE_KEYFRAMES = `
  @keyframes plan-glare {
    0%            { transform: translateX(-130%) skewX(-22deg); opacity: 0;   }
    4%            { opacity: 1; }
    17%, 100%     { transform: translateX(230%)  skewX(-22deg); opacity: 0;   }
  }
`;

const GLASS_LIGHT: React.CSSProperties = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.78)',
  boxShadow: '0 10px 30px -8px rgba(40,25,15,0.18), inset 0 1px 0 rgba(255,255,255,0.7)',
};
const GLASS_DARK: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 10px 30px -8px rgba(0,0,0,0.4)',
};

const DarkCtx = React.createContext(false);

function StatusRibbon() {
  const isDark = React.useContext(DarkCtx);
  const ui = useAppUi();
  return (
    <div style={{ ...(isDark ? GLASS_DARK : GLASS_LIGHT), borderRadius: 18, padding: "12px 14px", display: "grid", gridTemplateColumns: "1fr 1px 1fr 1px 1fr", gap: 12, alignItems: "start" }}>
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: MUTED, fontFamily: FB }}>Event date</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginTop: 5 }}>
          <span style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 38, color: GOLD, letterSpacing: "-0.03em", lineHeight: 0.88 }}>14</span>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: GOLD, fontFamily: FB, opacity: 0.9 }}>June</div>
            <div style={{ fontSize: 9, fontWeight: 600, color: MUTED, fontFamily: FB, marginTop: 2.5, letterSpacing: "0.06em" }}>2025 · Sat</div>
          </div>
        </div>
      </div>
      <div style={{ width: 1, height: 52, background: "rgba(154,133,112,0.25)", justifySelf: "center" as const, marginTop: 2 }} />
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: MUTED, fontFamily: FB }}>Plan</div>
        <div style={{ marginTop: 5, display: "inline-block", position: "relative", overflow: "hidden", background: GOLD_FOIL, color: "#fff", padding: "3px 10px", borderRadius: 12, fontFamily: FS, fontStyle: "italic", fontWeight: 400, fontSize: 15, letterSpacing: "0.04em", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 6px rgba(148,108,24,0.25)" }}>
          {ui.plans[DEMO_EVENT.plan]}
          <span aria-hidden style={{ position: "absolute", inset: 0, width: "50%", background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)", animation: "plan-glare 3s ease-in-out infinite", pointerEvents: "none" }} />
        </div>
      </div>
      <div style={{ width: 1, height: 52, background: "rgba(154,133,112,0.25)", justifySelf: "center" as const, marginTop: 2 }} />
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: MUTED, fontFamily: FB }}>Your role</div>
        <div style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 400, fontSize: 15, color: PURPLE, marginTop: 4, letterSpacing: "-0.005em" }}>Organizer</div>
      </div>
    </div>
  );
}

function CountdownCards() {
  const isDark = React.useContext(DarkCtx);
  const ui = useAppUi();

  function Card({ label, days, hours, accent }: { label: string; days: number; hours: number; accent: string }) {
    return (
      <div style={{ ...(isDark ? GLASS_DARK : GLASS_LIGHT), borderRadius: 18, padding: "14px 14px 12px", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -24, right: -24, width: 80, height: 80, borderRadius: "50%", background: accent, opacity: 0.13, filter: "blur(20px)", pointerEvents: "none" }} />
        <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, fontFamily: FB, position: "relative" }}>{label}</div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingTop: 8, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
            <span style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 400, fontSize: 48, color: accent, letterSpacing: "-0.03em", lineHeight: 0.9 }}>
              {days}
            </span>
            <span style={{ fontFamily: FB, fontSize: 10, fontWeight: 700, color: accent, opacity: 0.65, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>
              d
            </span>
          </div>
          <div style={{ fontSize: 11, color: MUTED, fontWeight: 600, marginTop: 4, fontFamily: FB, letterSpacing: "0.02em" }}>
            + {hours}h
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <Card label={ui.overview.uploadCloseLabel} accent={RUST}   days={18} hours={6}  />
      <Card label={ui.overview.autoDeletionLabel} accent={PURPLE} days={142} hours={3} />
    </div>
  );
}

function StatsTiles() {
  const isDark = React.useContext(DarkCtx);
  const ui = useAppUi();
  const photos = DEMO_PHOTOS.length;
  const guests = DEMO_GUESTS.length;
  const limits = getPlanLimits(DEMO_EVENT.plan);

  function subFor(cap: number) {
    return formatQuotaSublabelLocalized(cap, ui.quotas.unlimitedPlan, ui.quotas.ofCount, ui.locale);
  }

  const videoMax = limits.videos;
  const videoCap = !isUnlimitedQuota(videoMax) && videoMax <= 0 ? ui.quotas.notOnPlan : subFor(videoMax);

  function Tile({ n, label, cap, accent, isMuted, icon }: { n: number; label: string; cap: string; accent: string; isMuted?: boolean; icon: React.ReactNode }) {
    return (
      <div style={{ ...(isDark ? GLASS_DARK : GLASS_LIGHT), borderRadius: 16, padding: "12px 10px 12px 12px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 116, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 80, height: 80, borderRadius: "50%", background: accent, opacity: isMuted ? 0.04 : 0.1, filter: "blur(20px)", pointerEvents: "none" }} />
        <div>
          <div style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 400, fontSize: 44, color: accent, letterSpacing: "-0.04em", lineHeight: 0.85 }}>{n}</div>
          <div style={{ fontFamily: FS, fontStyle: "italic", fontSize: 14, fontWeight: 400, color: TEXT, marginTop: 4 }}>{label}</div>
          <div style={{ fontSize: 8.5, color: MUTED, fontWeight: 600, marginTop: 1, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: FB }}>{cap}</div>
        </div>
        <div style={{ alignSelf: "flex-end" }}>{icon}</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: TEXT_S, fontFamily: FB }}>Statistics</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: 8 }}>
        <Tile n={photos} label={ui.overview.statsPhotos} cap={subFor(limits.photos)} accent={PURPLE} icon={<Camera size={32} color={PURPLE} opacity={0.35} aria-hidden />} />
        <Tile n={0}      label={ui.overview.statsVideos} cap={videoCap}               accent={MUTED}  isMuted icon={<Clapperboard size={32} color={MUTED} opacity={0.35} aria-hidden />} />
        <Tile n={guests} label={ui.overview.statsGuests} cap={subFor(limits.guests)}  accent={GOLD}   icon={<Users size={32} color={GOLD} opacity={0.35} aria-hidden />} />
      </div>
    </div>
  );
}

function AccessCard({ publicOrigin }: { publicOrigin: string }) {
  const isDark = React.useContext(DarkCtx);
  const { triggerDemoToast } = useDemoToast();
  const [showQR, setShowQR] = useState(false);
  const joinUrl = getWebJoinUrl(publicOrigin, DEMO_EVENT.accessCode);

  return (
    <div style={{ position: "relative", borderRadius: 20, padding: "18px 16px 16px", background: isDark ? "linear-gradient(140deg, rgba(139,79,216,0.3), rgba(197,146,42,0.18) 60%, transparent), rgba(255,255,255,0.06)" : "linear-gradient(140deg, rgba(139,79,216,0.18), rgba(197,146,42,0.12) 60%, transparent), rgba(255,255,255,0.72)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.78)", boxShadow: isDark ? "0 14px 32px -10px rgba(0,0,0,0.5)" : "0 14px 32px -10px rgba(40,25,15,0.22), inset 0 1px 0 rgba(255,255,255,0.7)", overflow: "hidden" }}>
      <div style={{ position: "absolute", bottom: -40, right: -30, width: 140, height: 140, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,79,216,0.5), transparent 65%)", filter: "blur(8px)", pointerEvents: "none" }} />
      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: TEXT_S, fontFamily: FB, position: "relative" }}>Access code</div>
      <div style={{ marginTop: 12, padding: "14px 16px", background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.88)", border: `1px dashed ${BORDER}`, borderRadius: 12, fontFamily: "var(--font-mono, ui-monospace)", fontSize: 20, fontWeight: 700, color: TEXT, letterSpacing: "0.12em", textAlign: "center", position: "relative" }}>
        {DEMO_EVENT.accessCode}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 8, marginTop: 10, position: "relative" }}>
        <button type="button" onClick={triggerDemoToast} style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.9)", border: `1px solid ${BORDER}`, color: TEXT, padding: "11px 12px", borderRadius: 12, fontFamily: FB, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, cursor: "pointer", transition: "all 0.2s" }}>
          Copy code
        </button>
        <button type="button" onClick={() => setShowQR(v => !v)} style={{ background: "linear-gradient(135deg, #8B4FD8, #5B2D8E)", border: "none", color: "#fff", padding: "11px 12px", borderRadius: 12, fontFamily: FB, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 6px 14px rgba(91,45,142,0.35)" }}>
          {showQR ? "Hide QR" : "Show QR"}
        </button>
      </div>
      {showQR && (
        <div style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.92)", borderRadius: 12, padding: 20, marginTop: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, border: `1px solid ${BORDER}`, position: "relative" }}>
          <div className="qr-frame qr-reveal"><QRCode value={joinUrl} size={168} /></div>
          <p style={{ fontFamily: FS, fontStyle: "italic", fontSize: 12, color: MUTED, margin: 0, textAlign: "center" }}>Scan to join the event</p>
          <Link href="?tab=share&role=organizer" style={{ fontSize: 13, color: PURPLE, fontFamily: FB, fontWeight: 600, textDecoration: "none" }}>
            Open share tab
          </Link>
        </div>
      )}
    </div>
  );
}

function PhotoCarousel() {
  const isDark = React.useContext(DarkCtx);
  const preview = DEMO_PHOTOS.slice(0, 6);
  const [spotlight, ...rest] = preview;
  const thumbs = rest.slice(0, 5);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ position: "absolute", inset: -6, background: "radial-gradient(circle, rgba(197,146,42,0.35), transparent 70%)", filter: "blur(8px)" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/mascot/aurora_camera.png" alt="Aurora" style={{ width: 44, height: 44, objectFit: "contain", position: "relative" }} />
        </div>
        <div>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: TEXT_S, fontFamily: FB }}>Recent photos</div>
          <div style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 400, fontSize: 18, color: TEXT, marginTop: 1 }}>The latest six</div>
        </div>
      </div>
      <div style={{ ...(isDark ? GLASS_DARK : GLASS_LIGHT), borderRadius: 18, padding: 10 }}>
        {spotlight && (
          <Link href="?tab=gallery&role=organizer" style={{ display: "block", borderRadius: 12, overflow: "hidden", marginBottom: 6, position: "relative", textDecoration: "none" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={spotlight.src} alt="" style={{ width: "100%", display: "block", aspectRatio: "16/9", objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 12px 10px", background: "linear-gradient(transparent, rgba(0,0,0,0.55))", pointerEvents: "none" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", fontFamily: FB }}>Latest</div>
            </div>
          </Link>
        )}
        {thumbs.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {thumbs.map((photo, i) => (
              <Link key={photo.src} href="?tab=gallery&role=organizer" style={{ display: "block", borderRadius: 8, overflow: "hidden", position: "relative", aspectRatio: "1/1", textDecoration: "none" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                {i === 4 && DEMO_PHOTOS.length > 6 && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(34,21,9,0.58)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FB, fontSize: 11, fontWeight: 700 }}>
                    +{DEMO_PHOTOS.length - 6}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
      <Link
        href="?tab=gallery&role=organizer"
        style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          marginTop: 10, background: "transparent", border: "1px solid var(--app-border)",
          color: PURPLE, padding: "11px 12px", borderRadius: 12,
          fontFamily: FB, fontSize: 13, fontWeight: 600, textDecoration: "none",
          boxSizing: "border-box" as const,
        }}
      >
        View full gallery
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" stroke={PURPLE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}

export function DemoOverviewTab({ publicOrigin }: { publicOrigin: string }) {
  return (
    <DarkCtx.Provider value={false}>
      <style>{GLARE_KEYFRAMES}</style>
      <div style={{ padding: "18px 0 40px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="welcome-reveal"><StatusRibbon /></div>
        <div className="welcome-reveal welcome-reveal--d1"><CountdownCards /></div>
        <div className="welcome-reveal welcome-reveal--d2"><StatsTiles /></div>
        <div className="welcome-reveal welcome-reveal--d3"><AccessCard publicOrigin={publicOrigin} /></div>
        <div className="welcome-reveal welcome-reveal--d4"><PhotoCarousel /></div>
      </div>
    </DarkCtx.Provider>
  );
}
