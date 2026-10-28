"use client";

import { useState } from "react";
import Link from "next/link";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { Aurora, AuroraSays } from "@/components/app-ui/Aurora";
import { AppFormRow } from "@/components/app-ui/AppFormRow";
import { AppInput } from "@/components/app-ui/AppInput";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";

type Props = {
  eventTitle: string;
  /** Already formatted for display; omitted when the date can't be parsed. */
  eventDateLabel?: string | null;
  accessCode: string;
  onSessionReady: () => void;
};

export function WelcomeModal({ eventTitle, eventDateLabel, accessCode, onSessionReady }: Props) {
  const ui = useAppUi();
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const returnTo = `/join/${accessCode}`;

  async function handleGuestSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (trimmed.length < 2 || trimmed.length > 30) {
      setNicknameError(ui.welcomeModal.nicknameError);
      return;
    }
    setNicknameError(null);
    setBusy(true);

    try {
      const supabase = maybeCreateSupabaseBrowserClient();
      if (!supabase) {
        setNicknameError(ui.welcomeModal.supabaseMissing);
        return;
      }
      const { error: anonError } = await supabase.auth.signInAnonymously();
      if (anonError) throw anonError;

      const { error: joinError } = await supabase.rpc("join_event_with_code", {
        p_code: accessCode.toUpperCase(),
      });
      if (joinError) throw joinError;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { display_name: trimmed },
      });
      if (updateError) throw updateError;

      onSessionReady();
    } catch {
      setNicknameError(ui.welcomeModal.genericError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="welcome-sheet-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflowY: "auto",
        background: "color-mix(in srgb, var(--app-bg) 72%, transparent)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div className="welcome-sheet-hero" style={{ position: "relative", width: "100%", maxWidth: 440, display: "flex", alignItems: "center", gap: 2, padding: "24px 18px 8px 4px" }}>
        <div aria-hidden className="welcome-sheet-hero__glow" />
        <Aurora pose="waving" size={160} priority style={{ position: "relative", flexShrink: 0 }} />
        <AuroraSays size={21} style={{ position: "relative", lineHeight: 1.3 }}>{ui.aurora.welcome}</AuroraSays>
      </div>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="welcome-sheet"
        style={{
          width: "100%",
          maxWidth: 440,
          background: "var(--app-surface)",
          border: "1px solid var(--app-border)",
          boxShadow: "0 -18px 40px -16px rgba(120, 80, 30, 0.3), inset 0 1px 0 rgba(255, 253, 246, 0.9)",
          padding: "14px 22px calc(28px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div aria-hidden style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <div style={{ width: 40, height: 4, borderRadius: 99, background: "var(--app-border-strong)" }} />
        </div>
        <p style={{ margin: 0, fontSize: 15, color: "var(--app-text-sub)" }}>{ui.aurora.welcomeInvited}</p>
        <h1
          id="welcome-title"
          style={{
            margin: "2px 0 0",
            fontFamily: "'DM Serif Display', serif",
            fontWeight: 400,
            fontSize: 42,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            color: "var(--app-text)",
            textWrap: "balance",
            overflowWrap: "anywhere",
          }}
        >
          {eventTitle}
        </h1>
        {eventDateLabel ? (
          <p className="guest-date" style={{ margin: "8px 0 0", fontSize: 15, fontWeight: 600 }}>{eventDateLabel}</p>
        ) : null}

        <form onSubmit={handleGuestSubmit} style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <AppFormRow label={ui.welcomeModal.nicknameLabel} labelFor="nickname" errorText={nicknameError}>
            <AppInput
              id="nickname"
              type="text"
              value={nickname}
              onChange={(v) => {
                setNickname(v);
                if (nicknameError) setNicknameError(null);
              }}
              placeholder={ui.welcomeModal.nicknamePlaceholder}
              maxLength={30}
              autoComplete="nickname"
            />
          </AppFormRow>
          <AppBtn type="submit" variant="gold" size="lg" className="w-full" disabled={busy} loading={busy}>
            {ui.welcomeModal.startSharing}
          </AppBtn>
        </form>

        <p style={{ margin: "8px 0 0", textAlign: "center", fontSize: 14, color: "var(--app-muted)" }}>
          {ui.welcomeModal.haveAccount}{" "}
          <Link
            href={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
            style={{ display: "inline-block", padding: "10px 4px", fontWeight: 700, color: "var(--app-purple)", textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            {ui.welcomeModal.logIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
