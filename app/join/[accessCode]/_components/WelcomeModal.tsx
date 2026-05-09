"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      setNicknameError("Nickname must be 2–30 characters.");
      return;
    }
    setNicknameError(null);
    setBusy(true);

    try {
      const supabase = maybeCreateSupabaseBrowserClient();
      if (!supabase) {
        setNicknameError("Supabase is not configured. Please try again later.");
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
      setNicknameError("Something went wrong. Please try again.");
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
          You&apos;re invited
        </p>
        <h1 style={{ marginTop: 4, fontSize: "1.5rem", fontWeight: 600, color: "var(--app-text)" }}>{eventTitle}</h1>
        <p style={{ marginTop: 8, fontSize: 14, color: "var(--app-muted)" }}>
          Join to upload photos &amp; videos and browse the gallery.
        </p>

        {!showNicknameInput ? (
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            <AppBtn
              type="button"
              variant="gold"
              className="w-full"
              onClick={() => router.push(`/auth/login?mode=register&returnTo=${encodeURIComponent(returnTo)}`)}
            >
              Create account
            </AppBtn>
            <AppBtn
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => router.push(`/auth/login?returnTo=${encodeURIComponent(returnTo)}`)}
            >
              Log in
            </AppBtn>
            <AppBtn type="button" variant="ghost" className="w-full" onClick={() => setShowNicknameInput(true)}>
              Continue as guest
            </AppBtn>
          </div>
        ) : (
          <form onSubmit={handleGuestSubmit} style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
            <AppFormRow label="Your nickname" labelFor="nickname" errorText={nicknameError}>
              <AppInput
                id="nickname"
                type="text"
                value={nickname}
                onChange={(v) => {
                  setNickname(v);
                  if (nicknameError) setNicknameError(null);
                }}
                placeholder="e.g. Maria"
                maxLength={30}
                autoFocus
              />
            </AppFormRow>
            <AppBtn type="submit" variant="gold" className="w-full" disabled={busy} loading={busy}>
              Enter as guest
            </AppBtn>
            <AppBtn type="button" variant="ghost" size="sm" onClick={() => setShowNicknameInput(false)}>
              ← Back
            </AppBtn>
          </form>
        )}
      </AppCard>
    </div>
  );
}
