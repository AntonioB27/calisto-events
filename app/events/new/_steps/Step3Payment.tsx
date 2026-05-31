"use client";

import type { PlanId } from "@/lib/plan-limits";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { clearCreateEventDraftFromStorage, writeCreateEventDraftToStorage } from "@/lib/create-event-draft";
import { isPaidPlanForCheckout } from "@/lib/event-stripe-checkout";
import { useAppUi } from "@/components/AppUiProvider";

// ── Palette ───────────────────────────────────────────────────────────────────
const INK    = '#221509';
const INK_S  = '#5A4A36';
const MUTED  = '#9A8570';
const GOLD   = '#C5922A';
const GOLD_DK = '#A37118';
const PURPLE = '#5B2D8E';
const BORDER = '#DDD4C5';
const RUST   = '#B5461B';
const GOLD_FOIL = 'linear-gradient(135deg,#E6BF66 0%,#C5922A 45%,#F4D88F 70%,#946C18 100%)';
const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";

const PLAN_ACCENT: Record<PlanId, string> = {
  free:     '#9A8570',
  standard: '#2D7AAE',
  plus:     '#B87333',
  premium:  '#C5922A',
  max:      '#5B2D8E',
};

const PLAN_STAMP_BG: Record<PlanId, string> = {
  free:     'transparent',
  standard: 'linear-gradient(135deg,#4A8CB8 0%,#2D6A96 50%,#5BAACE 100%)',
  plus:     'linear-gradient(135deg,#D4956B 0%,#B87333 45%,#E8AF80 70%,#8C5225 100%)',
  premium:  GOLD_FOIL,
  max:      'linear-gradient(135deg,#8B5FCC 0%,#5B2D8E 45%,#A87FD8 70%,#3D1A6E 100%)',
};

// NOTE: prices are business-facing; adjust to match mobile pricing.
const PLAN_PRICE: Record<PlanId, { now: string; was?: string }> = {
  free:     { now: "0€" },
  standard: { now: "15€" },
  plus:     { now: "35€" },
  premium:  { now: "65€", was: "70€" },
  max:      { now: "90€", was: "100€" },
};

type Step3PaymentProps = {
  name: string;
  emoji: string;
  date: string;
  planId: PlanId;
  validationError: "NAME_REQUIRED" | null;
};

const warmGlass: React.CSSProperties = {
  background: 'rgba(244,240,234,0.9)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: `1px solid ${BORDER}`,
  boxShadow: '0 8px 24px -6px rgba(40,25,15,0.14), inset 0 1px 0 rgba(255,255,255,0.8)',
  borderRadius: 14,
};

export function Step3Payment({ name, emoji, date, planId, validationError }: Step3PaymentProps) {
  const ui = useAppUi();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [requiresAuth, setRequiresAuth] = useState(false);

  const returnTo = "/events/new?resume=1";
  const loginHref = `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
  const registerHref = `/auth/login?mode=register&returnTo=${encodeURIComponent(returnTo)}`;

  const writeStep3Draft = () => {
    writeCreateEventDraftToStorage({ step: "3", name, emoji, date, planId });
  };

  useEffect(() => {
    let mounted = true;
    const checkSession = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;
      setRequiresAuth(!user);
      setIsSessionReady(true);
    };
    void checkSession().catch(() => {
      if (!mounted) return;
      setRequiresAuth(true);
      setIsSessionReady(true);
    });
    return () => { mounted = false; };
  }, []);

  const goToAuth = (href: string) => {
    writeStep3Draft();
    router.push(href);
  };

  async function onConfirm() {
    setBusy(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setRequiresAuth(true); setBusy(false); return; }

      if (isPaidPlanForCheckout(planId)) {
        const response = await fetch("/api/stripe/checkout-create-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, emoji, date, planId }),
          credentials: "same-origin",
        });
        const payload = (await response.json().catch(() => null)) as { url?: unknown; error?: unknown } | null;
        const url = typeof payload?.url === "string" ? payload.url : null;
        if (!response.ok || !url) {
          const msg = typeof payload?.error === "string" ? payload.error : ui.createStep3.checkoutFailGeneric;
          throw new Error(msg);
        }
        window.location.href = url;
        return;
      }

      const accessCode = crypto.randomUUID().slice(0, 8).toUpperCase();
      const title = emoji?.trim() ? `${emoji.trim()} ${name.trim()}` : name.trim();
      const { data, error: insertError } = await supabase
        .from("events")
        .insert({ title, event_date: new Date(date).toISOString(), organizer_id: user.id, plan: planId, access_code: accessCode })
        .select("id")
        .single();

      if (insertError || !data?.id) throw new Error(insertError?.message ?? ui.createStep3.createFail);
      clearCreateEventDraftFromStorage();
      router.push(`/events/${data.id}?tab=share`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : ui.createStep3.createFail);
      setBusy(false);
    }
  }

  // ── Heading ────────────────────────────────────────────────────────────────
  const heading = (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ width: 18, height: 2, background: GOLD, borderRadius: 1, flexShrink: 0 }} />
        <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: GOLD_DK, fontFamily: FB }}>
          {ui.createStep3.stepEyebrow}
        </span>
      </div>
      <h2 style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 26, color: INK, lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>
        {ui.createStep3.confirmHeading}
      </h2>
    </div>
  );

  // ── Validation error ───────────────────────────────────────────────────────
  if (validationError) {
    return (
      <div className="welcome-reveal welcome-reveal--d1">
        {heading}
        <div style={{ ...warmGlass, padding: '20px 18px' }}>
          <p style={{ margin: '0 0 14px', fontSize: 14, color: RUST, fontFamily: FB }}>{ui.validateCreate.nameRequired}</p>
          <Link href="/events/new?step=1" style={{ display: 'inline-flex', background: 'transparent', color: PURPLE, border: `1px solid ${PURPLE}55`, borderRadius: 9, padding: '8px 14px', fontFamily: FB, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
            {ui.createStep3.validationBack}
          </Link>
        </div>
      </div>
    );
  }

  // ── Checking session ───────────────────────────────────────────────────────
  if (!isSessionReady) {
    return (
      <div className="welcome-reveal welcome-reveal--d1">
        {heading}
        <div style={{ ...warmGlass, padding: '24px 20px', textAlign: 'center' }}>
          <p style={{ fontFamily: FS, fontStyle: 'italic', fontSize: 15, color: MUTED, margin: 0 }}>{ui.createStep3.checkingSession}</p>
        </div>
      </div>
    );
  }

  // ── Auth gate ──────────────────────────────────────────────────────────────
  if (requiresAuth) {
    return (
      <div className="welcome-reveal welcome-reveal--d1">
        {heading}
        <div style={{ position: 'relative', marginTop: 8 }}>
          {/* Washi tape */}
          <div aria-hidden style={{ position: 'absolute', top: -8, left: '33%', width: 64, height: 14, background: 'rgba(212,168,67,0.48)', border: '0.5px solid rgba(212,168,67,0.6)', transform: 'rotate(-3deg)', boxShadow: '0 2px 6px rgba(0,0,0,0.22)', zIndex: 2, borderRadius: 2, pointerEvents: 'none' }} />
          <div style={{ background: '#f4f0ea', borderRadius: 2, boxShadow: '0 8px 28px rgba(0,0,0,0.42), 0 2px 6px rgba(0,0,0,0.2)', padding: '20px 18px 22px' }}>
            <h3 style={{ margin: '0 0 6px', fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 19, color: INK, lineHeight: 1.15 }}>
              {ui.createStep3.needAuthHeading}
            </h3>
            <p style={{ margin: '0 0 18px', fontSize: 13, color: INK_S, lineHeight: 1.55, fontFamily: FB }}>
              {ui.createStep3.needAuthBody}
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => goToAuth(loginHref)}
                style={{ background: `linear-gradient(135deg,#7B3FBE,${PURPLE})`, color: '#fff', border: 'none', borderRadius: 9, padding: '10px 18px', fontFamily: FB, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 3px 10px rgba(91,45,142,0.28)' }}
              >
                {ui.createStep3.logInBtn}
              </button>
              <button
                type="button"
                onClick={() => goToAuth(registerHref)}
                style={{ background: 'rgba(255,255,255,0.7)', color: PURPLE, border: `1.5px solid ${BORDER}`, borderRadius: 9, padding: '10px 18px', fontFamily: FB, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                {ui.createStep3.createAcctBtn}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Confirm ────────────────────────────────────────────────────────────────
  const accent = PLAN_ACCENT[planId];
  const stampBg = PLAN_STAMP_BG[planId];
  const isFree = planId === 'free';

  return (
    <div className="welcome-reveal welcome-reveal--d1">
      {heading}

      {/* Polaroid confirmation card */}
      <div style={{ position: 'relative' }}>
        {/* Washi tape */}
        <div aria-hidden style={{ position: 'absolute', top: -8, left: '33%', width: 64, height: 14, background: 'rgba(212,168,67,0.48)', border: '0.5px solid rgba(212,168,67,0.6)', transform: 'rotate(-3deg)', boxShadow: '0 2px 6px rgba(0,0,0,0.22)', zIndex: 2, borderRadius: 2, pointerEvents: 'none' }} />
        <div style={{ background: '#f4f0ea', borderRadius: 2, boxShadow: '0 8px 28px rgba(0,0,0,0.42), 0 2px 6px rgba(0,0,0,0.2)', padding: '20px 18px 22px' }}>

          {/* Event name + plan stamp row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 9.5, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: MUTED, fontFamily: FB }}>
                {ui.createStep3.selectedPlanEyebrow}
              </p>
              <h3 style={{ margin: '6px 0 0', fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 22, color: INK, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {emoji ? `${emoji} ` : ''}{name}
              </h3>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: INK_S, fontFamily: FB }}>{date}</p>
            </div>

            {/* Plan stamp */}
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: stampBg, color: isFree ? MUTED : '#fff',
                border: isFree ? `1px solid ${MUTED}55` : 'none',
                borderRadius: 4, padding: '5px 10px',
                boxShadow: isFree ? 'none' : 'inset 0 1px 0 rgba(255,255,255,0.35),0 1px 2px rgba(0,0,0,0.15)',
              }}>
                <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', opacity: 0.82, fontFamily: FB }}>Plan</span>
                <span style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 13, letterSpacing: '0.04em', lineHeight: 1 }}>{ui.plans[planId]}</span>
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.05 }}>
                {PLAN_PRICE[planId].was && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: MUTED, textDecoration: 'line-through', textDecorationThickness: '1.5px', fontFamily: FB }}>
                    {PLAN_PRICE[planId].was}
                  </span>
                )}
                <span style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 20, color: accent, lineHeight: 1 }}>
                  {PLAN_PRICE[planId].now}
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: `1px dashed ${BORDER}`, marginBottom: 14 }} />

          {/* Confirmation body */}
          <p style={{ margin: '0 0 14px', fontSize: 13, color: INK_S, lineHeight: 1.6, fontFamily: FB }}>
            {ui.createStep3.confirmBodyLeadBeforeName}
            <strong style={{ color: INK }}>{name}</strong>
            {ui.createStep3.confirmBodyBetweenNameDate}
            <strong style={{ color: INK }}>{date}</strong>
            {ui.createStep3.confirmBodyTierWord}
            <strong style={{ color: accent }}>{ui.plans[planId]}</strong>
            {ui.createStep3.confirmBodyPlanSuffix}
            {isPaidPlanForCheckout(planId) ? ui.createStep3.confirmBodyPaidTail : ` ${ui.createStep3.confirmBodyFreeTier}`}
          </p>

          {/* Error alert */}
          {error && (
            <div role="alert" style={{ marginBottom: 14, fontSize: 13, color: RUST, background: `${RUST}15`, padding: '10px 12px', borderRadius: 9, border: `1px solid ${RUST}40`, fontFamily: FB }}>
              {error}
            </div>
          )}

          <p style={{ margin: '0 0 14px', fontSize: 11.5, color: MUTED, fontFamily: FB }}>
            {isPaidPlanForCheckout(planId) ? ui.createStep3.footnotePaid : ui.createStep3.footnoteFree}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href={`/events/new?step=2&name=${encodeURIComponent(name)}&emoji=${encodeURIComponent(emoji)}&date=${encodeURIComponent(date)}&planId=${planId}`} style={{ background: 'transparent', color: PURPLE, border: `1px solid ${PURPLE}55`, borderRadius: 9, padding: '11px 16px', fontFamily: FB, fontSize: 13, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
              {ui.common.back}
            </Link>
            <button
              type="button"
              disabled={busy}
              onClick={() => void onConfirm()}
              style={{ flex: 1, background: busy ? `${PURPLE}80` : `linear-gradient(135deg,#7B3FBE,${PURPLE})`, color: '#fff', border: 'none', borderRadius: 9, padding: '12px 18px', fontFamily: FB, fontSize: 13, fontWeight: 600, cursor: busy ? 'not-allowed' : 'pointer', boxShadow: busy ? 'none' : '0 4px 12px rgba(91,45,142,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
            >
              {busy && <Loader2 size={14} className="animate-spin" />}
              {busy
                ? (isPaidPlanForCheckout(planId) ? ui.createStep3.btnOpeningCheckout : ui.createStep3.btnCreating)
                : (isPaidPlanForCheckout(planId) ? ui.createStep3.btnStripe : ui.createStep3.btnConfirmFree)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
