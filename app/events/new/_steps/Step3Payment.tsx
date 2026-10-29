"use client";

import type { PlanId } from "@/lib/plan-limits";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { clearCreateEventDraftFromStorage, writeCreateEventDraftToStorage } from "@/lib/create-event-draft";
import { formatEuroCents, isPaidPlanForCheckout, planPriceEuroCents } from "@/lib/event-stripe-checkout";
import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { TabHeader } from "@/components/app-ui/TabHeader";
import { bcp47FromUiLocale } from "@/lib/locale-bcp47";
import { usePostHog } from "posthog-js/react";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";

type Step3PaymentProps = {
  name: string;
  emoji: string;
  date: string;
  planId: PlanId;
  moderationEnabled: boolean;
  validationError: "NAME_REQUIRED" | null;
};

export function Step3Payment({ name, emoji, date, planId, moderationEnabled, validationError }: Step3PaymentProps) {
  const ui = useAppUi();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture(ANALYTICS_EVENTS.CREATE_STEP3_VIEWED, { plan_id: planId });
  }, [posthog, planId]);

  const returnTo = "/events/new?resume=1";
  const loginHref = `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
  const registerHref = `/auth/login?mode=register&returnTo=${encodeURIComponent(returnTo)}`;

  const writeStep3Draft = () => {
    writeCreateEventDraftToStorage({ step: "3", name, emoji, date, planId, moderationEnabled });
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

      posthog.capture(ANALYTICS_EVENTS.CREATE_STEP3_COMPLETED, {
        plan_id: planId,
        is_paid: isPaidPlanForCheckout(planId),
      });

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
          moderation_enabled: moderationEnabled,
        })
        .select("id")
        .single();

      if (insertError || !data?.id) throw new Error(insertError?.message ?? ui.createStep3.createFail);
      posthog.capture(ANALYTICS_EVENTS.CREATE_COMPLETED, { plan_id: planId, is_paid: false });
      clearCreateEventDraftFromStorage();
      router.push(`/events/${data.id}?tab=share`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : ui.createStep3.createFail);
      setBusy(false);
    }
  }

  const isPaid = isPaidPlanForCheckout(planId);
  const shownDate = (() => {
    const d = new Date(`${date}T12:00:00Z`);
    return Number.isNaN(d.getTime())
      ? date
      : d.toLocaleDateString(bcp47FromUiLocale(ui.locale), { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  })();

  const header = (
    <TabHeader title={requiresAuth && isSessionReady ? ui.createStep3.needAuthHeading : ui.createStep3.confirmHeading} pose="happy" poseSize={104} />
  );

  if (validationError) {
    return (
      <div className="welcome-reveal welcome-reveal--d1 create-flow">
        {header}
        <section className="tab-card">
          <p role="alert" style={{ margin: "0 0 14px", fontSize: 15, color: "var(--app-danger)" }}>{ui.validateCreate.nameRequired}</p>
          <AppBtn as={Link} href="/events/new?step=1" variant="outline">{ui.createStep3.validationBack}</AppBtn>
        </section>
      </div>
    );
  }

  if (!isSessionReady) {
    return (
      <div className="welcome-reveal welcome-reveal--d1 create-flow">
        {header}
        <section className="tab-card">
          <p aria-live="polite" style={{ margin: 0, fontSize: 15, color: "var(--app-muted)" }}>{ui.createStep3.checkingSession}</p>
        </section>
      </div>
    );
  }

  if (requiresAuth) {
    return (
      <div className="welcome-reveal welcome-reveal--d1 create-flow">
        {header}
        <section className="warm-card" style={{ padding: 20 }}>
          <p style={{ margin: "0 0 18px", fontSize: 15, lineHeight: 1.5, color: "var(--app-text-sub)" }}>
            {ui.createStep3.needAuthBody}
          </p>
          <div className="create-actions" style={{ flexWrap: "wrap" }}>
            <AppBtn type="button" variant="gold" size="lg" style={{ flex: 1 }} onClick={() => goToAuth(loginHref)}>
              {ui.createStep3.logInBtn}
            </AppBtn>
            <AppBtn type="button" variant="outline" size="lg" style={{ flex: 1 }} onClick={() => goToAuth(registerHref)}>
              {ui.createStep3.createAcctBtn}
            </AppBtn>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="welcome-reveal welcome-reveal--d1 create-flow">
      {header}

      <section className="warm-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="create-emoji" aria-hidden style={{ cursor: "default" }}>
            <span className="calisto-emoji-upright">{emoji || "📅"}</span>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: 400, fontSize: 28, lineHeight: 1.05, color: "var(--app-text)", overflowWrap: "anywhere" }}>
              {name}
            </h2>
            <p style={{ margin: "6px 0 0", fontSize: 14, fontWeight: 700, color: "var(--app-gold-ink)" }}>{shownDate}</p>
          </div>
        </div>

        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(214,176,112,0.35)", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--app-text)" }}>
            <span className="sr-only">{ui.createStep3.selectedPlanEyebrow}: </span>
            {ui.plans[planId]}
          </span>
          <span className="create-plan__price">{formatEuroCents(planPriceEuroCents(planId))}</span>
        </div>

        <p style={{ margin: "12px 0 0", fontSize: 15, lineHeight: 1.5, color: "var(--app-text-sub)" }}>
          {ui.createStep3.confirmBodyLeadBeforeName}
          <strong style={{ color: "var(--app-text)" }}>{name}</strong>
          {ui.createStep3.confirmBodyBetweenNameDate}
          <strong style={{ color: "var(--app-text)" }}>{shownDate}</strong>
          {ui.createStep3.confirmBodyTierWord}
          <strong style={{ color: "var(--app-text)" }}>{ui.plans[planId]}</strong>
          {ui.createStep3.confirmBodyPlanSuffix}
          {isPaid ? ui.createStep3.confirmBodyPaidTail : ` ${ui.createStep3.confirmBodyFreeTier}`}
        </p>
      </section>

      {error && <p role="alert" className="create-error">{error}</p>}

      <p className="create-note">{isPaid ? ui.createStep3.footnotePaid : ui.createStep3.footnoteFree}</p>

      <div className="create-actions">
        <AppBtn
          as={Link}
          href={`/events/new?step=2&name=${encodeURIComponent(name)}&emoji=${encodeURIComponent(emoji)}&date=${encodeURIComponent(date)}&planId=${planId}`}
          variant="outline"
          size="lg"
        >
          {ui.common.back}
        </AppBtn>
        <AppBtn type="button" variant="gold" size="lg" loading={busy} style={{ flex: 1 }} onClick={() => void onConfirm()}>
          {busy
            ? (isPaid ? ui.createStep3.btnOpeningCheckout : ui.createStep3.btnCreating)
            : (isPaid ? ui.createStep3.btnStripe : ui.createStep3.btnConfirmFree)}
        </AppBtn>
      </div>
    </div>
  );
}
