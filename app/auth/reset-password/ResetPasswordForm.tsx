"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useRef, useState } from "react";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppCard } from "@/components/app-ui/AppCard";
import { AppFormRow } from "@/components/app-ui/AppFormRow";
import { AppInput } from "@/components/app-ui/AppInput";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

function ResetPasswordInner() {
  const ui = useAppUi();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: unknown, session: unknown) => {
      if (!mountedRef.current) return;
      if (session) {
        setHasRecoverySession(true);
        setReady(true);
      }
    });

    async function init() {
      const code = searchParams.get("code");
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }
      let {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        await new Promise((r) => setTimeout(r, 200));
        const second = await supabase.auth.getSession();
        session = second.data.session;
      }
      if (!mountedRef.current) return;
      setHasRecoverySession(!!session);
      setReady(true);
    }

    void init();

    return () => {
      subscription.unsubscribe();
    };
  }, [searchParams]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password.length < 6) {
      setError(ui.passwordReset.passwordTooShort);
      return;
    }
    if (password !== confirm) {
      setError(ui.passwordReset.passwordsMismatch);
      return;
    }

    setPending(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      router.replace("/auth/reset-password/success");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : ui.passwordReset.updateFail);
    } finally {
      setPending(false);
    }
  }

  const shellStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: 24,
  };

  if (!ready) {
    return (
      <main className="app-shell" style={shellStyle}>
        <p style={{ fontSize: 14, color: "var(--app-muted)" }}>{ui.passwordReset.verifying}</p>
      </main>
    );
  }

  if (!hasRecoverySession) {
    return (
      <main className="app-shell" style={shellStyle}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 32, height: 3, background: "var(--app-gold)", borderRadius: 2, margin: "0 auto 12px" }} />
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 36,
                color: "var(--app-text)",
                lineHeight: 1,
              }}
            >
              {ui.passwordReset.expiredTitle}
            </h1>
          </div>
          <AppCard pad="lg" style={{ borderRadius: 18, boxShadow: "var(--app-shadow-sm)", display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ fontSize: 14, color: "var(--app-muted)", lineHeight: 1.6 }}>
              {ui.passwordReset.expiredBody}
            </p>
            <AppBtn variant="gold" size="sm" href="/auth/forgot-password" as={Link}>
              {ui.passwordReset.requestNewLink}
            </AppBtn>
            <AppBtn variant="ghost" size="sm" href="/auth/login" as={Link}>
              {ui.passwordReset.backToSignIn}
            </AppBtn>
          </AppCard>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell" style={shellStyle}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ width: 32, height: 3, background: "var(--app-gold)", borderRadius: 2, margin: "0 auto 12px" }} />
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--app-muted)",
            }}
          >
            {ui.passwordReset.accountEyebrow}
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 40,
              color: "var(--app-text)",
              lineHeight: 1,
            }}
          >
            {ui.passwordReset.setTitle}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 15,
              color: "var(--app-muted)",
              marginTop: 10,
            }}
          >
            {ui.passwordReset.setSubtitle}
          </p>
        </div>

        <AppCard pad="lg" style={{ borderRadius: 18, boxShadow: "var(--app-shadow-sm)" }}>
          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <AppFormRow label={ui.passwordReset.newPasswordLabel} labelFor="reset-password">
              <AppInput
                id="reset-password"
                name="password"
                type="password"
                placeholder={ui.passwordReset.newPasswordPlaceholder}
                autoComplete="new-password"
                value={password}
                onChange={(v) => {
                  setPassword(v);
                  if (error) setError(null);
                }}
                disabled={pending}
              />
            </AppFormRow>
            <AppFormRow label={ui.passwordReset.confirmPasswordLabel} labelFor="reset-confirm">
              <AppInput
                id="reset-confirm"
                name="confirm"
                type="password"
                placeholder={ui.passwordReset.confirmPasswordPlaceholder}
                autoComplete="new-password"
                value={confirm}
                onChange={(v) => {
                  setConfirm(v);
                  if (error) setError(null);
                }}
                disabled={pending}
              />
            </AppFormRow>
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
            <AppBtn type="submit" variant="primary" className="w-full" disabled={pending} loading={pending}>
              {ui.passwordReset.updateSubmit}
            </AppBtn>
          </form>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <AppBtn variant="ghost" size="sm" href="/auth/login" as={Link}>
              {ui.passwordReset.backToSignIn}
            </AppBtn>
          </div>
        </AppCard>
      </div>
    </main>
  );
}

function ResetPasswordSuspenseFallback() {
  const ui = useAppUi();
  return (
    <main
      className="app-shell"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 24,
      }}
    >
      <p style={{ fontSize: 14, color: "var(--app-muted)" }}>{ui.common.loading}</p>
    </main>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={<ResetPasswordSuspenseFallback />}>
      <ResetPasswordInner />
    </Suspense>
  );
}
