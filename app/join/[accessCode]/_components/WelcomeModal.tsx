"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppCard } from "@/components/app-ui/AppCard";
import { AppFormRow } from "@/components/app-ui/AppFormRow";
import { AppInput } from "@/components/app-ui/AppInput";
import { maybeCreateSupabaseBrowserClient } from "@/lib/supabase-browser";

type Props = {
  eventTitle: string;
  accessCode: string;
  onSessionReady: () => void;
};

export function WelcomeModal({ eventTitle, accessCode, onSessionReady }: Props) {
  const ui = useAppUi();
  const router = useRouter();
  const [showNicknameInput, setShowNicknameInput] = useState(false);
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
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "color-mix(in srgb, var(--app-text) 55%, transparent)",
        backdropFilter: "blur(6px)",
      }}
    >
      <AppCard pad="lg" style={{ width: "100%", maxWidth: 384, borderRadius: 16, boxShadow: "var(--app-shadow-lg)" }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: "var(--app-gold)",
          }}
        >
          {ui.welcomeModal.eyebrow}
        </p>
        <h1 style={{ marginTop: 4, fontSize: "1.5rem", fontWeight: 600, color: "var(--app-text)" }}>{eventTitle}</h1>
        <p style={{ marginTop: 8, fontSize: 14, color: "var(--app-muted)" }}>{ui.welcomeModal.body}</p>

        {!showNicknameInput ? (
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            <AppBtn
              type="button"
              variant="gold"
              className="w-full"
              onClick={() => router.push(`/auth/login?mode=register&returnTo=${encodeURIComponent(returnTo)}`)}
            >
              {ui.welcomeModal.createAccount}
            </AppBtn>
            <AppBtn
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`)}
            >
              {ui.welcomeModal.logIn}
            </AppBtn>
            <AppBtn type="button" variant="ghost" className="w-full" onClick={() => setShowNicknameInput(true)}>
              {ui.welcomeModal.continueGuest}
            </AppBtn>
          </div>
        ) : (
          <form onSubmit={handleGuestSubmit} style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
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
                autoFocus
              />
            </AppFormRow>
            <AppBtn type="submit" variant="gold" className="w-full" disabled={busy} loading={busy}>
              {ui.welcomeModal.enterGuest}
            </AppBtn>
            <AppBtn type="button" variant="ghost" size="sm" onClick={() => setShowNicknameInput(false)}>
              {ui.common.back}
            </AppBtn>
          </form>
        )}
      </AppCard>
    </div>
  );
}
