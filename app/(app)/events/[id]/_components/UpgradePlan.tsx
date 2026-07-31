"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAppUi } from "@/components/AppUiProvider";
import { interpolate } from "@/lib/app-ui";
import { planCreditEuroCents, planUnitAmountEuroCents } from "@/lib/event-stripe-checkout";
import { getPlanLimits, PLAN_DB_INT_MAX, normalizePlanId, PLAN_ORDER, planRank, type PlanId } from "@/lib/plan-limits";

// ── Palette (Aurora Theater, matches Overview/Settings) ────────────────────────
const GOLD = "#C5922A";
const GOLD_DK = "#A37118";
const GOLD_FOIL = "linear-gradient(135deg,#E6BF66 0%,#C5922A 45%,#F4D88F 70%,#946C18 100%)";

const TEXT = "var(--app-text)";
const TEXT_S = "var(--app-text-sub)";
const MUTED = "var(--app-muted)";
const BORDER = "var(--app-border)";

const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";

type PaidPlanId = Exclude<PlanId, "free">;
const UPGRADE_PLANS: readonly PaidPlanId[] = ["standard", "plus", "premium", "max"];

const PLAN_ACCENT: Record<PaidPlanId, string> = {
  standard: "#2D7AAE",
  plus: "#B87333",
  premium: "#C5922A",
  max: "#5B2D8E",
};

const PLAN_STAMP_BG: Record<PaidPlanId, string> = {
  standard: "linear-gradient(135deg,#4A8CB8 0%,#2D6A96 50%,#5BAACE 100%)",
  plus: "linear-gradient(135deg,#D4956B 0%,#B87333 45%,#E8AF80 70%,#8C5225 100%)",
  premium: GOLD_FOIL,
  max: "linear-gradient(135deg,#8B5FCC 0%,#5B2D8E 45%,#A87FD8 70%,#3D1A6E 100%)",
};

// NOTE: prices are business-facing; keep in sync with create flow (Step2Plan / Step3Payment).
const PLAN_PRICE: Record<PaidPlanId, { now: string; was?: string }> = {
  standard: { now: "15€" },
  plus: { now: "35€" },
  premium: { now: "65€", was: "70€" },
  max: { now: "90€", was: "100€" },
};

function formatEuroCents(cents: number): string {
  return `${Math.round(cents / 100)}€`;
}

function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const read = () => setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return isDark;
}

function glassStyle(isDark: boolean): React.CSSProperties {
  return isDark
    ? {
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 10px 30px -8px rgba(0,0,0,0.4)",
      }
    : {
        background: "rgba(255,255,255,0.62)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.78)",
        boxShadow: "0 10px 30px -8px rgba(40,25,15,0.18), inset 0 1px 0 rgba(255,255,255,0.7)",
      };
}

const GOLD_RULE = "linear-gradient(90deg, #946C18, #E6BF66 40%, #C5922A 70%, #946C18)";

// Scoped motion: sheet develops in like a photo, cards stagger, controls react to touch.
const UPGRADE_ANIM_CSS = `
@keyframes upgFadeIn { from { opacity: 0 } to { opacity: 1 } }
@keyframes upgSheetIn { from { opacity: 0; transform: translateY(30px) scale(0.985) } to { opacity: 1; transform: none } }
@keyframes upgCardIn { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: none } }
.upg-overlay { animation: upgFadeIn 0.26s ease both }
.upg-sheet { animation: upgSheetIn 0.42s cubic-bezier(0.22,0.61,0.36,1) both }
.upg-card { animation: upgCardIn 0.5s cubic-bezier(0.22,0.61,0.36,1) both }
.upg-cta { transition: transform 0.12s ease, filter 0.18s ease, box-shadow 0.2s ease }
.upg-cta:hover:not(:disabled) { filter: brightness(1.06) }
.upg-cta:active:not(:disabled) { transform: scale(0.98) }
.upg-close { transition: transform 0.22s cubic-bezier(0.22,0.61,0.36,1), background 0.18s ease }
.upg-close:hover:not(:disabled) { transform: rotate(90deg) }
@media (prefers-reduced-motion: reduce) {
  .upg-overlay, .upg-sheet, .upg-card { animation-duration: 0.001s }
  .upg-close:hover, .upg-cta:active { transform: none }
}
`;

// ── Plan picker dialog ─────────────────────────────────────────────────────────
function UpgradeDialog({
  eventId,
  currentPlan,
  onClose,
}: {
  eventId: string;
  currentPlan: PlanId;
  onClose: () => void;
}) {
  const ui = useAppUi();
  const isDark = useIsDark();
  const [busyPlan, setBusyPlan] = useState<PaidPlanId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const creditEuroCents = planCreditEuroCents(currentPlan);
  const availablePlans = UPGRADE_PLANS.filter((p) => planRank(p) > planRank(currentPlan));

  const formatCap = useCallback(
    (n: number) => (n >= PLAN_DB_INT_MAX ? ui.createStep2.unlimited : String(n)),
    [ui.createStep2.unlimited],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busyPlan) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [busyPlan, onClose]);

  // Lock background scroll while the full-screen upgrade sheet is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  async function startCheckout(planId: PaidPlanId) {
    setBusyPlan(planId);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout-upgrade-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, planId }),
        credentials: "same-origin",
      });
      const payload = (await res.json().catch(() => null)) as { url?: unknown; error?: unknown } | null;
      const url = typeof payload?.url === "string" ? payload.url : null;
      if (!res.ok || !url) {
        throw new Error(typeof payload?.error === "string" ? payload.error : ui.upgrade.errorGeneric);
      }
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : ui.upgrade.errorGeneric);
      setBusyPlan(null);
    }
  }

  return (
    <div
      className="upg-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={ui.upgrade.pickerTitle}
      style={{
        position: "fixed", inset: 0, zIndex: 60, height: "100dvh",
        display: "flex",
        padding:
          "calc(env(safe-area-inset-top) + 10px) 10px calc(env(safe-area-inset-bottom) + 10px)",
        background: isDark
          ? "radial-gradient(115% 70% at 50% 0%, rgba(197,146,42,0.22), transparent 55%), radial-gradient(110% 80% at 50% 100%, rgba(91,45,142,0.30), transparent 55%), rgba(12,8,4,0.80)"
          : "radial-gradient(115% 70% at 50% 0%, rgba(197,146,42,0.30), transparent 55%), radial-gradient(110% 80% at 50% 100%, rgba(91,45,142,0.22), transparent 55%), rgba(24,15,6,0.62)",
        backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <style>{UPGRADE_ANIM_CSS}</style>
      <div
        className="upg-sheet"
        style={{
          position: "relative", flex: 1, width: "100%", maxWidth: 600, margin: "0 auto",
          display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden",
          borderRadius: 28,
          background: isDark
            ? "linear-gradient(180deg, #221d18, #16120e)"
            : "linear-gradient(180deg, #fdfbf6, #f3efe8)",
          border: isDark ? "1px solid rgba(197,146,42,0.28)" : "1px solid rgba(197,146,42,0.35)",
          boxShadow: isDark
            ? "0 30px 80px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)"
            : "0 30px 80px -20px rgba(40,25,15,0.4), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        {/* Gold-foil crown strip */}
        <div aria-hidden style={{ position: "absolute", inset: "0 0 auto 0", height: 4, background: GOLD_RULE, opacity: 0.95, zIndex: 3 }} />
        {/* Ambient aurora glows */}
        <div aria-hidden style={{ position: "absolute", top: -70, right: -50, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, rgba(197,146,42,0.40), transparent 65%)", filter: "blur(10px)", pointerEvents: "none", zIndex: 0 }} />
        <div aria-hidden style={{ position: "absolute", bottom: -80, left: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, rgba(91,45,142,0.32), transparent 65%)", filter: "blur(10px)", pointerEvents: "none", zIndex: 0 }} />

        {/* Header */}
        <div
          style={{
            position: "relative", zIndex: 2, flexShrink: 0,
            display: "flex", alignItems: "flex-start", justifyContent: "space-between",
            gap: 12, padding: "22px 20px 16px",
            borderBottom: `1px solid ${isDark ? "rgba(197,146,42,0.16)" : "rgba(197,146,42,0.22)"}`,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
              <span style={{ width: 18, height: 2, background: GOLD, borderRadius: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: GOLD_DK, fontFamily: FB }}>
                {ui.upgrade.bannerEyebrow}
              </span>
            </div>
            <h2 style={{ margin: 0, fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 27, color: TEXT, lineHeight: 1.08, letterSpacing: "-0.01em" }}>
              {ui.upgrade.pickerTitle}
            </h2>
          </div>
          <button
            type="button"
            className="upg-close"
            aria-label={ui.upgrade.cancel}
            disabled={busyPlan !== null}
            onClick={onClose}
            style={{
              flexShrink: 0, width: 40, height: 40, borderRadius: "50%",
              display: "grid", placeItems: "center",
              background: isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.7)",
              border: `1px solid ${BORDER}`, color: TEXT,
              boxShadow: isDark ? "none" : "inset 0 1px 0 rgba(255,255,255,0.7)",
              cursor: busyPlan !== null ? "not-allowed" : "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ position: "relative", zIndex: 1, flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "18px 20px calc(24px + env(safe-area-inset-bottom))" }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <p style={{ margin: "0 0 4px", fontFamily: FS, fontStyle: "italic", fontSize: 13.5, color: MUTED, lineHeight: 1.5 }}>
              {ui.upgrade.pickerSubtitle}
            </p>

            {error && (
              <div role="alert" style={{ marginTop: 14, fontSize: 13, color: "var(--app-danger)", background: "color-mix(in srgb, var(--app-danger) 10%, transparent)", padding: "10px 12px", borderRadius: 10, border: "1px solid color-mix(in srgb, var(--app-danger) 35%, transparent)", fontFamily: FB }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
              {availablePlans.map((planId, cardIndex) => {
            const limits = getPlanLimits(planId);
            const accent = PLAN_ACCENT[planId];
            const fullPrice = PLAN_PRICE[planId];
            const priceNowCents = planUnitAmountEuroCents(planId) - creditEuroCents;
            const price = creditEuroCents > 0
              ? { now: formatEuroCents(priceNowCents), was: fullPrice.now }
              : fullPrice;
            const busy = busyPlan === planId;
            const anyBusy = busyPlan !== null;
            return (
              <div
                key={planId}
                className="upg-card"
                style={{
                  ...glassStyle(isDark), borderRadius: 18, padding: "16px 15px 16px", position: "relative", overflow: "hidden",
                  opacity: anyBusy && !busy ? 0.5 : 1, transition: "opacity 0.15s ease",
                  animationDelay: `${120 + cardIndex * 75}ms`,
                }}
              >
                <div aria-hidden style={{ position: "absolute", inset: "0 0 auto 0", height: 3, background: PLAN_STAMP_BG[planId] }} />
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginTop: 4 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <h3 style={{ margin: 0, fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 20, color: TEXT, lineHeight: 1 }}>
                        {ui.plans[planId]}
                      </h3>
                      {planId === "premium" && (
                        <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, background: `${accent}18`, border: `1px solid ${accent}40`, borderRadius: 4, padding: "2px 6px", fontFamily: FB }}>
                          {ui.createStep2.popularBadge}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: 12.5, color: TEXT_S, lineHeight: 1.4, fontFamily: FB }}>
                      {interpolate(ui.upgrade.guestsPhotosVideos, {
                        guests: formatCap(limits.guests),
                        photos: formatCap(limits.photos),
                        videos: formatCap(limits.videos),
                      })}
                    </p>
                    <p style={{ margin: "3px 0 0", fontSize: 11.5, color: MUTED, fontFamily: FB }}>
                      {interpolate(ui.upgrade.retentionDays, { n: limits.retentionDaysAfterEvent })}
                    </p>
                    {creditEuroCents > 0 && (
                      <p style={{ margin: "3px 0 0", fontSize: 11.5, color: accent, fontFamily: FB, fontWeight: 600 }}>
                        {interpolate(ui.upgrade.creditNote, {
                          amount: formatEuroCents(creditEuroCents),
                          plan: ui.plans[currentPlan],
                        })}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.05 }}>
                    {price.was && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, textDecoration: "line-through", textDecorationThickness: "1.5px", fontFamily: FB }}>
                        {price.was}
                      </span>
                    )}
                    <span style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 22, color: accent, lineHeight: 1 }}>
                      {price.now}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="upg-cta"
                  disabled={anyBusy}
                  onClick={() => void startCheckout(planId)}
                  style={{
                    marginTop: 15, width: "100%",
                    background: busy ? `${accent}99` : `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 70%, #000))`,
                    color: "#fff", border: "none", borderRadius: 12, padding: "13px 16px",
                    fontFamily: FB, fontSize: 13.5, fontWeight: 700, cursor: anyBusy ? "not-allowed" : "pointer",
                    boxShadow: busy ? "none" : `inset 0 1px 0 rgba(255,255,255,0.25), 0 6px 16px ${accent}45`,
                  }}
                >
                  {busy ? ui.upgrade.opening : interpolate(ui.upgrade.selectCta, { plan: ui.plans[planId] })}
                </button>
                </div>
              );
            })}
          </div>

          <p style={{ margin: "16px 0 0", fontSize: 11.5, color: MUTED, fontFamily: FB, lineHeight: 1.5 }}>
            {ui.upgrade.oneTimeNote}
          </p>

          <button
            type="button"
            disabled={busyPlan !== null}
            onClick={onClose}
            style={{
              marginTop: 18, width: "100%", background: "transparent", color: MUTED,
              border: `1px solid ${BORDER}`, borderRadius: 11, padding: "13px 16px",
              fontFamily: FB, fontSize: 13, fontWeight: 600, cursor: busyPlan !== null ? "not-allowed" : "pointer",
            }}
          >
            {ui.upgrade.cancel}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Overview banner ────────────────────────────────────────────────────────────
export function UpgradeBanner({ eventId, plan }: { eventId: string; plan: string }) {
  const ui = useAppUi();
  const isDark = useIsDark();
  const [open, setOpen] = useState(false);
  const currentPlan = normalizePlanId(plan);

  if (planRank(currentPlan) >= PLAN_ORDER.length - 1) return null;

  return (
    <>
      <div
        style={{
          position: "relative", borderRadius: 20, overflow: "hidden", padding: "18px 16px 16px",
          background: isDark
            ? "linear-gradient(140deg, rgba(197,146,42,0.28), rgba(139,79,216,0.14) 70%, transparent), rgba(255,255,255,0.06)"
            : "linear-gradient(140deg, rgba(197,146,42,0.20), rgba(139,79,216,0.10) 70%, transparent), rgba(255,255,255,0.72)",
          backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
          border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.78)",
          boxShadow: isDark ? "0 14px 32px -10px rgba(0,0,0,0.5)" : "0 14px 32px -10px rgba(40,25,15,0.22), inset 0 1px 0 rgba(255,255,255,0.7)",
        }}
      >
        <div aria-hidden style={{ position: "absolute", top: -40, right: -30, width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle, rgba(197,146,42,0.45), transparent 65%)", filter: "blur(8px)", pointerEvents: "none" }} />

        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD_DK, fontFamily: FB }}>
            {ui.upgrade.bannerEyebrow}
          </div>
          <div style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 20, color: TEXT, marginTop: 4, lineHeight: 1.15 }}>
            {ui.upgrade.bannerTitle}
          </div>
          <p style={{ margin: "8px 0 0", fontFamily: FB, fontSize: 13, color: TEXT_S, lineHeight: 1.55 }}>
            {ui.upgrade.bannerBody}
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            style={{
              marginTop: 14, display: "inline-flex", alignItems: "center", gap: 7,
              background: GOLD_FOIL, color: "#fff", border: "none", borderRadius: 12,
              padding: "11px 18px", fontFamily: FB, fontSize: 13, fontWeight: 700,
              cursor: "pointer", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 12px rgba(148,108,24,0.32)",
              textShadow: "0 1px 2px rgba(100,60,0,0.3)",
            }}
          >
            {ui.upgrade.bannerCta}
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      {open && <UpgradeDialog eventId={eventId} currentPlan={currentPlan} onClose={() => setOpen(false)} />}
    </>
  );
}

// ── Settings button ────────────────────────────────────────────────────────────
export function UpgradeSettingsButton({ eventId, plan }: { eventId: string; plan: string }) {
  const ui = useAppUi();
  const [open, setOpen] = useState(false);
  const currentPlan = normalizePlanId(plan);

  if (planRank(currentPlan) >= PLAN_ORDER.length - 1) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          marginTop: 12, display: "inline-flex", alignItems: "center", gap: 7,
          background: GOLD_FOIL, color: "#fff", border: "none", borderRadius: 11,
          padding: "10px 16px", fontFamily: FB, fontSize: 13, fontWeight: 700,
          cursor: "pointer", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 3px 10px rgba(148,108,24,0.3)",
          textShadow: "0 1px 2px rgba(100,60,0,0.3)",
        }}
      >
        {ui.upgrade.settingsCta}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && <UpgradeDialog eventId={eventId} currentPlan={currentPlan} onClose={() => setOpen(false)} />}
    </>
  );
}

// ── Return handler: finalizes the upgrade after Stripe redirects back ──────────
export function UpgradeReturnHandler() {
  const ui = useAppUi();
  const isDark = useIsDark();
  const router = useRouter();

  const [state, setState] = useState<"idle" | "working" | "done">("idle");
  const [plan, setPlan] = useState<PlanId | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const upgraded = params.get("upgraded");
    const sessionId = params.get("session_id");
    if (upgraded !== "1" || !sessionId?.startsWith("cs_")) return;
    startedRef.current = true;

    let cancelled = false;

    void (async () => {
      setState("working");
      // The webhook may beat us here, or payment may still be settling; retry a few times.
      for (let attempt = 0; attempt < 6 && !cancelled; attempt++) {
        try {
          const res = await fetch("/api/stripe/fulfill-upgrade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
            credentials: "same-origin",
          });
          if (res.ok) {
            const payload = (await res.json().catch(() => null)) as { plan?: unknown } | null;
            if (!cancelled) {
              setPlan(normalizePlanId(payload?.plan));
              setState("done");
              router.refresh();
            }
            return;
          }
          if (res.status !== 409) break; // 409 = payment not settled yet; keep polling
        } catch {
          // network hiccup, retry
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
      // Give up silently; the webhook still fulfills server-side and the plan will show on reload.
      if (!cancelled) {
        clearUpgradeParams(router);
        setState("idle");
      }
    })();

    return () => { cancelled = true; };
  }, [router]);

  if (state === "working") {
    return (
      <Overlay isDark={isDark}>
        <div style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 20, color: TEXT }}>
          {ui.upgrade.finalizingTitle}
        </div>
        <p style={{ margin: "8px 0 0", fontFamily: FB, fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
          {ui.upgrade.finalizingBody}
        </p>
      </Overlay>
    );
  }

  if (state === "done") {
    return (
      <Overlay isDark={isDark}>
        <div style={{ fontSize: 34, lineHeight: 1 }} aria-hidden>✨</div>
        <div style={{ marginTop: 10, fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 22, color: TEXT }}>
          {ui.upgrade.successTitle}
        </div>
        <p style={{ margin: "8px 0 0", fontFamily: FB, fontSize: 13.5, color: TEXT_S, lineHeight: 1.5 }}>
          {interpolate(ui.upgrade.successBody, { plan: plan ? ui.plans[plan] : "" })}
        </p>
        <button
          type="button"
          onClick={() => { setState("idle"); clearUpgradeParams(router); }}
          style={{
            marginTop: 18, background: GOLD_FOIL, color: "#fff", border: "none", borderRadius: 12,
            padding: "11px 22px", fontFamily: FB, fontSize: 13, fontWeight: 700, cursor: "pointer",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 12px rgba(148,108,24,0.32)",
            textShadow: "0 1px 2px rgba(100,60,0,0.3)",
          }}
        >
          {ui.upgrade.successDismiss}
        </button>
      </Overlay>
    );
  }

  return null;
}

function clearUpgradeParams(router: ReturnType<typeof useRouter>) {
  const next = new URLSearchParams(window.location.search);
  next.delete("upgraded");
  next.delete("session_id");
  if (!next.has("tab")) next.set("tab", "overview");
  router.replace(`${window.location.pathname}?${next.toString()}`, { scroll: false });
}

function Overlay({ isDark, children }: { isDark: boolean; children: React.ReactNode }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        background: "rgba(20,12,4,0.55)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
    >
      <div
        style={{
          ...glassStyle(isDark), width: "100%", maxWidth: 380, borderRadius: 22,
          background: isDark ? "#1b1713" : "#faf7f1",
          padding: "28px 24px", textAlign: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
