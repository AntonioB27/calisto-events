"use client";

import type { PlanId } from "@/lib/plan-limits";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import {
  clearCreateEventDraftFromStorage,
  writeCreateEventDraftToStorage,
} from "@/lib/create-event-draft";
import { isPaidPlanForCheckout } from "@/lib/event-stripe-checkout";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppCard } from "@/components/app-ui/AppCard";
import { AppPageHeader } from "@/components/app-ui/AppPageHeader";

type Step3PaymentProps = {
  name: string;
  emoji: string;
  date: string;
  planId: PlanId;
  validationError: "NAME_REQUIRED" | null;
};

const PLAN_PRICE: Record<PlanId, { now: string; was?: string }> = {
  free: { now: "0€" },
  standard: { now: "15€" },
  plus: { now: "35€" },
  premium: { now: "65€", was: "70€" },
  max: { now: "90€", was: "100€" },
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
    writeCreateEventDraftToStorage({
      step: "3",
      name,
      emoji,
      date,
      planId,
    });
  };

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;
      setRequiresAuth(!user);
      setIsSessionReady(true);
    };

    void checkSession().catch(() => {
      if (!mounted) return;
      setRequiresAuth(true);
      setIsSessionReady(true);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const goToAuth = (href: string) => {
    writeStep3Draft();
    router.push(href);
  };

  const pageHeader = (
    <AppPageHeader
      eyebrow={ui.createStep3.stepEyebrow}
      title={ui.createStep3.confirmHeading}
    />
  );

  if (validationError) {
    return (
      <div className="welcome-reveal welcome-reveal--d1">
        {pageHeader}
        <AppCard pad="md" className="mt-8">
          <p style={{ margin: 0, fontSize: 14, color: "var(--app-danger)" }}>{ui.validateCreate.nameRequired}</p>
          <AppBtn as={Link} href="/events/new?step=1" variant="outline" size="sm" style={{ marginTop: 16 }}>
            {ui.createStep3.validationBack}
          </AppBtn>
        </AppCard>
      </div>
    );
  }

  if (!isSessionReady) {
    return (
      <div className="welcome-reveal welcome-reveal--d1">
        {pageHeader}
        <AppCard pad="md" className="mt-8">
          <p style={{ margin: 0, fontSize: 14, color: "var(--app-muted)" }}>{ui.createStep3.checkingSession}</p>
        </AppCard>
      </div>
    );
  }

  if (requiresAuth) {
    return (
      <div className="welcome-reveal welcome-reveal--d1">
        {pageHeader}
        <AppCard pad="lg" className="mt-8">
          <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "var(--app-text)" }}>
            {ui.createStep3.needAuthHeading}
          </h2>
          <p style={{ margin: "0 0 16px", fontSize: 14, color: "var(--app-muted)", lineHeight: 1.55 }}>
            {ui.createStep3.needAuthBody}
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <AppBtn type="button" variant="primary" onClick={() => goToAuth(loginHref)}>
              {ui.createStep3.logInBtn}
            </AppBtn>
            <AppBtn type="button" variant="secondary" onClick={() => goToAuth(registerHref)}>
              {ui.createStep3.createAcctBtn}
            </AppBtn>
          </div>
        </AppCard>
      </div>
    );
  }

  async function onConfirm() {
    setBusy(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setRequiresAuth(true);
        setBusy(false);
        return;
      }

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
        .insert({
          title,
          event_date: new Date(date).toISOString(),
          organizer_id: user.id,
          plan: planId,
          access_code: accessCode,
        })
        .select("id")
        .single();

      if (insertError || !data?.id) {
        throw new Error(insertError?.message ?? ui.createStep3.createFail);
      }

      clearCreateEventDraftFromStorage();
      router.push(`/events/${data.id}?tab=share`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : ui.createStep3.createFail);
      setBusy(false);
    }
  }

  return (
    <div className="welcome-reveal welcome-reveal--d1">
      {pageHeader}
    <AppCard
      pad="lg"
      className="mt-8"
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -1,
          background:
            "radial-gradient(900px 260px at 20% 0%, color-mix(in srgb, var(--app-gold) 18%, transparent) 0%, transparent 60%), radial-gradient(700px 240px at 90% 10%, color-mix(in srgb, var(--app-purple) 16%, transparent) 0%, transparent 58%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: "0 0 auto 0",
          height: 3,
          background: "linear-gradient(90deg, var(--app-gold), color-mix(in srgb, var(--app-purple) 70%, var(--app-gold)))",
          opacity: 0.9,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative" }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="sm:flex-1 sm:min-w-0">
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--app-subtle)",
              }}
            >
              {ui.createStep3.stepEyebrow}
            </p>
            <h2
              style={{
                margin: "10px 0 0",
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 22,
                color: "var(--app-text)",
                lineHeight: 1.2,
              }}
            >
              {ui.createStep3.confirmHeading}
            </h2>
            <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "var(--app-muted)", lineHeight: 1.55, maxWidth: 520 }}>
              {ui.createStep3.confirmBodyLeadBeforeName}
              <strong style={{ color: "var(--app-text)" }}>{name}</strong>
              {ui.createStep3.confirmBodyBetweenNameDate}
              <strong style={{ color: "var(--app-text)" }}>{date}</strong>
              {ui.createStep3.confirmBodyTierWord}
              <strong style={{ color: "var(--app-text)" }}>{ui.plans[planId]}</strong>
              {ui.createStep3.confirmBodyPlanSuffix}
              {isPaidPlanForCheckout(planId) ? ui.createStep3.confirmBodyPaidTail : ` ${ui.createStep3.confirmBodyFreeTier}`}
            </p>
          </div>

          <div
            className="sm:shrink-0"
            style={{
              borderRadius: 16,
              border: "1.5px solid color-mix(in srgb, var(--app-border) 75%, transparent)",
              background: "color-mix(in srgb, var(--app-surface) 65%, transparent)",
              padding: 14,
              minWidth: 200,
              boxShadow: "var(--app-shadow-sm)",
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--app-subtle)" }}>
              {ui.createStep3.selectedPlanEyebrow}
            </div>
            <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "var(--app-text)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {ui.plans[planId]}
                </div>
                {PLAN_PRICE[planId].was ? (
                  <span
                    className="app-badge app-badge--accent"
                    style={{
                      padding: "4px 8px",
                      borderRadius: 999,
                      borderColor: "color-mix(in srgb, var(--app-gold) 55%, var(--app-border))",
                      color: "var(--app-gold)",
                    }}
                  >
                    {ui.createStep3.saleBadge}
                  </span>
                ) : null}
              </div>
              <div style={{ textAlign: "right", lineHeight: 1.05 }}>
                {PLAN_PRICE[planId].was ? (
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--app-subtle)",
                      textDecoration: "line-through",
                      textDecorationThickness: "1.5px",
                      opacity: 0.85,
                    }}
                  >
                    {PLAN_PRICE[planId].was}
                  </div>
                ) : null}
                <div style={{ marginTop: PLAN_PRICE[planId].was ? 3 : 0, fontSize: 18, fontWeight: 900, color: "var(--app-text)" }}>
                  {PLAN_PRICE[planId].now}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: "var(--app-muted)", lineHeight: 1.5 }}>
              {isPaidPlanForCheckout(planId) ? ui.createStep3.priceNotePaid : ui.createStep3.priceNoteFree}
            </div>
          </div>
        </div>

        {error ? (
          <div
            role="alert"
            style={{
              marginTop: 14,
              fontSize: 13,
              color: "var(--app-danger)",
              background: "color-mix(in srgb, var(--app-danger) 10%, transparent)",
              padding: "10px 12px",
              borderRadius: "var(--app-radius-md)",
              border: "1px solid color-mix(in srgb, var(--app-danger) 35%, transparent)",
            }}
          >
            {error}
          </div>
        ) : null}

        <div style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <p style={{ margin: 0, fontSize: 12, color: "var(--app-subtle)" }}>
            {isPaidPlanForCheckout(planId) ? ui.createStep3.footnotePaid : ui.createStep3.footnoteFree}
          </p>
          <AppBtn type="button" variant="primary" disabled={busy} loading={busy} onClick={() => void onConfirm()}>
            {busy
              ? isPaidPlanForCheckout(planId)
                ? ui.createStep3.btnOpeningCheckout
                : ui.createStep3.btnCreating
              : isPaidPlanForCheckout(planId)
                ? ui.createStep3.btnStripe
                : ui.createStep3.btnConfirmFree}
          </AppBtn>
        </div>
      </div>
    </AppCard>
    </div>
  );
}
