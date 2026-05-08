"use client";

import type { EventKind } from "@/lib/event-kind";
import { EVENT_KINDS } from "@/lib/event-kind";
import { GoldBar } from "@/components/app-ui/GoldBar";
import { AppInput } from "@/components/app-ui/AppInput";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

const KIND_LABEL: Record<EventKind, string> = {
  wedding: "Wedding",
  birthday: "Birthday",
  corporate: "Corporate",
  other: "Something else",
};

export function OrganizeOnboardingForm() {
  const router = useRouter();
  const [kind, setKind] = useState<EventKind | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!kind) {
      setError("Choose what you're planning.");
      return;
    }
    setBusy(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in.");

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
      setError(err instanceof Error ? err.message : "Could not save. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{
      background: 'var(--app-card)',
      borderRadius: 18,
      border: '1.5px solid var(--app-border)',
      padding: 32,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <header>
          <GoldBar />
          <p style={{ marginTop: 12, fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--app-muted)' }}>
            Welcome
          </p>
          <h1 style={{ marginTop: 6, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: 'var(--app-text)', lineHeight: 1.2 }}>
            Tell us about your event
          </h1>
          <p style={{ marginTop: 8, fontSize: 14, color: 'var(--app-muted)' }}>
            This personalizes your space. You can create your first event from the dashboard next.
          </p>
        </header>

        <section>
          <p style={{ marginBottom: 12, fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--app-muted)' }}>
            What are you planning?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {EVENT_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setKind(k);
                  if (error) setError(null);
                }}
                style={{
                  padding: '14px 16px',
                  borderRadius: 14,
                  textAlign: 'left',
                  fontSize: 14,
                  fontWeight: 600,
                  transition: 'all 0.18s',
                  cursor: 'pointer',
                  border: kind === k
                    ? '1.5px solid var(--app-gold)'
                    : '1.5px solid var(--app-border)',
                  background: kind === k
                    ? 'color-mix(in srgb, var(--app-gold) 12%, transparent)'
                    : 'var(--app-card)',
                  color: kind === k ? 'var(--app-text)' : 'var(--app-muted)',
                }}
              >
                {KIND_LABEL[k]}
              </button>
            ))}
          </div>
        </section>

        <section>
          <label
            htmlFor="displayName"
            style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--app-muted)', marginBottom: 8 }}
          >
            What should we call you?{" "}
            <span style={{ fontWeight: 400 }}>(optional)</span>
          </label>
          <AppInput
            id="displayName"
            name="displayName"
            value={displayName}
            onChange={setDisplayName}
            placeholder="e.g. Alex"
            autoComplete="name"
          />
        </section>

        {error ? (
          <p style={{ fontSize: 13, color: '#e05252', background: 'rgba(224,82,82,0.08)', padding: '10px 14px', borderRadius: 10 }}>
            {error}
          </p>
        ) : null}

        <AppBtn type="submit" disabled={busy || !kind} style={{ width: '100%', justifyContent: 'center' }}>
          {busy ? "Saving…" : "Continue to dashboard"}
        </AppBtn>
      </form>
    </div>
  );
}
