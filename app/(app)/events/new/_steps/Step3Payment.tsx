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

import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppCard } from "@/components/app-ui/AppCard";

type Step3PaymentProps = {
  name: string;
  emoji: string;
  date: string;
  planId: PlanId;
  validationError: "NAME_REQUIRED" | null;
};

const PLAN_PRICE: Record<PlanId, { now: string; was?: string; label: string }> = {
  free: { now: "0€", label: "Free" },
  standard: { now: "15€", label: "Standard" },
  plus: { now: "35€", label: "Plus" },
  premium: { now: "65€", was: "70€", label: "Premium" },
  max: { now: "90€", was: "100€", label: "Max" },
};

export function Step3Payment({ name, emoji, date, planId, validationError }: Step3PaymentProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [requiresAuth, setRequiresAuth] = useState(false);

  const returnTo = "/events/new?resume=1";
  const loginHref = `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;
  const registerHref = `/auth/register?returnTo=${encodeURIComponent(returnTo)}`;

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

  if (validationError) {
    return (
      <AppCard pad="md" className="mt-8">
        <p style={{ margin: 0, fontSize: 14, color: "var(--app-danger)" }}>{validationError}</p>
        <AppBtn as={Link} href="/events/new?step=1" variant="outline" size="sm" style={{ marginTop: 16 }}>
          Go back to details
        </AppBtn>
      </AppCard>
    );
  }

  if (!isSessionReady) {
    return (
      <AppCard pad="md" className="mt-8">
        <p style={{ margin: 0, fontSize: 14, color: "var(--app-muted)" }}>Checking your session…</p>
      </AppCard>
    );
  }

  if (requiresAuth) {
    return (
      <AppCard pad="lg" className="mt-8">
        <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "var(--app-text)" }}>Sign in to create your event</h2>
        <p style={{ margin: "0 0 16px", fontSize: 14, color: "var(--app-muted)", lineHeight: 1.55 }}>
          You need an account to finish creating this event. We&apos;ll keep your draft so you can continue on return.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <AppBtn type="button" variant="primary" onClick={() => goToAuth(loginHref)}>
            Log in
          </AppBtn>
          <AppBtn type="button" variant="secondary" onClick={() => goToAuth(registerHref)}>
            Create account
          </AppBtn>
        </div>
      </AppCard>
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
        throw new Error(insertError?.message ?? "Could not create event.");
      }

      clearCreateEventDraftFromStorage();
      router.push(`/events/${data.id}?tab=share`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create event.");
      setBusy(false);
    }
  }

  return (
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
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ minWidth: 220 }}>
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
              Step 3 · Payment
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
              Confirm your event
            </h2>
            <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "var(--app-muted)", lineHeight: 1.55, maxWidth: 520 }}>
              You’re about to create <strong style={{ color: "var(--app-text)" }}>{name}</strong> for{" "}
              <strong style={{ color: "var(--app-text)" }}>{date}</strong>.
            </p>
          </div>

          <div
            style={{
              borderRadius: 16,
              border: "1.5px solid color-mix(in srgb, var(--app-border) 75%, transparent)",
              background: "color-mix(in srgb, var(--app-surface) 65%, transparent)",
              padding: 14,
              minWidth: 220,
              boxShadow: "var(--app-shadow-sm)",
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--app-subtle)" }}>
              Selected plan
            </div>
            <div style={{ marginTop: 8, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "var(--app-text)",
                    textTransform: "capitalize",
                    whiteSpace: "nowrap",
                  }}
                >
                  {PLAN_PRICE[planId].label}
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
                    Sale
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
              One-time payment per event.
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
            By continuing, you’ll create the event and get your share code instantly.
          </p>
          <AppBtn type="button" variant="primary" disabled={busy} loading={busy} onClick={() => void onConfirm()}>
            {busy ? "Creating…" : "Confirm and create event"}
          </AppBtn>
        </div>
      </div>
    </AppCard>
  );
}
