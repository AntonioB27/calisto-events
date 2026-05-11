"use client";

import type { EventKind } from "@/lib/event-kind";
import { EVENT_KINDS } from "@/lib/event-kind";
import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppCard } from "@/components/app-ui/AppCard";
import { AppFormRow } from "@/components/app-ui/AppFormRow";
import { AppInput } from "@/components/app-ui/AppInput";
import { GoldBar } from "@/components/app-ui/GoldBar";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function OrganizeOnboardingForm() {
  const ui = useAppUi();
  const router = useRouter();
  const [kind, setKind] = useState<EventKind | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!kind) {
      setError(ui.onboardingForm.choosePlanning);
      return;
    }
    setBusy(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error(ui.onboardingForm.notSignedIn);

      const now = new Date().toISOString();
      const trimmedName = displayName.trim();

      const { error: saveError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          display_name: trimmedName || null,
          onboarding_completed_at: now,
        },
        { onConflict: "id" },
      );

      if (saveError) throw saveError;

      try {
        window.localStorage.setItem("calisto_onboarding_event_kind", kind);
      } catch {
        /* ignore */
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : ui.onboardingForm.saveFail);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppCard pad="lg" style={{ borderRadius: 18, boxShadow: "var(--app-shadow-sm)" }}>
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <header>
          <GoldBar />
          <p style={{ marginTop: 12, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--app-muted)' }}>
            {ui.onboardingForm.welcomeEyebrow}
          </p>
          <h1 style={{ marginTop: 6, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: 'var(--app-text)', lineHeight: 1.2 }}>
            {ui.onboardingForm.title}
          </h1>
          <p style={{ marginTop: 8, fontSize: 14, color: 'var(--app-muted)' }}>
            {ui.onboardingForm.subtitle}
          </p>
        </header>

        <section>
          <p style={{ marginBottom: 12, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--app-muted)' }}>
            {ui.onboardingForm.kindEyebrow}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {EVENT_KINDS.map((k) => (
              <AppBtn
                key={k}
                type="button"
                variant={kind === k ? "gold" : "outline"}
                className="w-full !justify-start !text-left"
                onClick={() => {
                  setKind(k);
                  if (error) setError(null);
                }}
              >
                {ui.onboardingKinds[k]}
              </AppBtn>
            ))}
          </div>
        </section>

        <section>
          <AppFormRow label={ui.onboardingForm.displayNameLabel} labelFor="displayName">
            <AppInput
              id="displayName"
              name="displayName"
              value={displayName}
              onChange={setDisplayName}
              placeholder={ui.onboardingForm.namePlaceholderShort}
              autoComplete="name"
            />
          </AppFormRow>
        </section>

        {error ? (
          <p
            style={{
              fontSize: 13,
              color: "var(--app-danger)",
              background: "color-mix(in srgb, var(--app-danger) 10%, transparent)",
              border: "1.5px solid color-mix(in srgb, var(--app-danger) 35%, transparent)",
              padding: "10px 14px",
              borderRadius: 10,
            }}
          >
            {error}
          </p>
        ) : null}

        <AppBtn type="submit" variant="primary" className="w-full" disabled={busy || !kind} loading={busy}>
          {ui.onboardingForm.continueDashboard}
        </AppBtn>
      </form>
    </AppCard>
  );
}
