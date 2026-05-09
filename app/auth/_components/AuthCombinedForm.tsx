"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppBtn } from "@/components/app-ui/AppBtn";
import { AuthModeRail } from "@/components/app-ui/AuthModeRail";
import { AppCard } from "@/components/app-ui/AppCard";
import { AppFormRow } from "@/components/app-ui/AppFormRow";
import { AppInput } from "@/components/app-ui/AppInput";
import {
  MascotSpot,
  WELCOME_HERO_COLUMN_MAX_WIDTH_PX,
  WELCOME_HERO_KEY_MASCOT_FRAME_HEIGHT_PX,
  WELCOME_HERO_MASCOT_PX,
} from "@/components/MascotSpot";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getSafeReturnPath } from "@/lib/safe-return-path";

export type AuthCombinedMode = "login" | "register";

function parseModeParam(raw: string | null): AuthCombinedMode {
  return raw === "register" ? "register" : "login";
}

function GoogleMark() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.507 12.237c0-.837-.069-1.645-.206-2.427H12.24v4.579h6.356a5.489 5.489 0 01-2.379 3.596v2.986h3.849c2.246-2.069 3.544-5.117 3.544-8.734z"
      />
      <path
        fill="#34A853"
        d="M12.24 24c3.21 0 5.917-1.066 7.892-2.892l-3.849-2.986c-1.07.718-2.446 1.142-4.043 1.142-3.114 0-5.744-2.102-6.682-4.924H1.694v3.086A11.986 11.986 0 0012.24 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.557 14.341a7.207 7.207 0 010-4.682V6.574H1.694a11.99 11.99 0 000 10.793l3.862-3.026z"
      />
      <path
        fill="#EA4335"
        d="M12.24 4.734c1.759 0 3.344.605 4.586 1.793l3.446-3.446C18.154 1.083 15.478 0 12.239 0A11.987 11.987 0 001.694 6.574l3.862 3.086c.937-2.824 3.568-4.927 6.682-4.927z"
      />
    </svg>
  );
}

export function AuthCombinedForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = useMemo(
    () => getSafeReturnPath(searchParams.get("returnTo")),
    [searchParams],
  );
  const initialMode = useMemo(
    () => parseModeParam(searchParams.get("mode")),
    [searchParams],
  );

  const [mode, setMode] = useState<AuthCombinedMode>(initialMode);
  const [pending, setPending] = useState(false);
  const [oauthPending, setOauthPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const oauthErrorHandledRef = useRef(false);

  useEffect(() => {
    if (oauthErrorHandledRef.current) return;
    if (searchParams.get("oauth_error") !== "1") return;
    oauthErrorHandledRef.current = true;
    setError("Google sign-in didn’t finish. Try again or use email and password.");
    const qs = new URLSearchParams(searchParams.toString());
    qs.delete("oauth_error");
    const tail = qs.toString();
    router.replace(tail ? `/auth/login?${tail}` : "/auth/login", { scroll: false });
  }, [router, searchParams]);

  function selectMode(next: AuthCombinedMode) {
    setMode(next);
    setError(null);
    setSuccessMessage(null);
  }

  async function onGoogleOAuth() {
    setOauthPending(true);
    setError(null);

    let willRedirect = false;
    try {
      const supabase = getSupabaseBrowserClient();
      const nextPath = returnTo ?? "/dashboard";
      const redirectTo = new URL(`${window.location.origin}/auth/callback`);
      redirectTo.searchParams.set("next", nextPath);

      const { data, error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: redirectTo.toString() },
      });

      if (oauthErr) {
        setError(oauthErr.message);
        return;
      }

      const href = typeof data.url === "string" ? data.url : null;
      if (href) {
        willRedirect = true;
        window.location.assign(href);
        return;
      }

      setError("Could not start Google sign-in. Try again shortly.");
    } finally {
      if (!willRedirect) {
        setOauthPending(false);
      }
    }
  }

  async function onLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const formData = new FormData(event.currentTarget);
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");

      const supabase = getSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push(returnTo ?? "/dashboard");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function onRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        router.push(returnTo ?? "/dashboard");
        router.refresh();
        return;
      }

      setSuccessMessage("Check your email to confirm your account");
    } finally {
      setPending(false);
    }
  }

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
      <div style={{ width: "100%", maxWidth: WELCOME_HERO_COLUMN_MAX_WIDTH_PX }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <MascotSpot
              src="/brand/mascot/aurora_key.png"
              size={WELCOME_HERO_MASCOT_PX}
              frameHeight={WELCOME_HERO_KEY_MASCOT_FRAME_HEIGHT_PX}
              variant="stack"
              className="welcome-mascot"
            />
          </div>
          <div style={{ width: 32, height: 3, background: "var(--app-gold)", borderRadius: 2, margin: "0 auto 16px" }} />
          <p
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--app-muted)",
            }}
          >
            Welcome to
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: 56,
              color: "var(--app-text)",
              lineHeight: 1,
            }}
          >
            Calisto.
          </h1>
        </div>

        <AppCard pad="lg" className="auth-card" style={{ borderRadius: 18 }}>
          <AuthModeRail active={mode} onLogin={() => selectMode("login")} onRegister={() => selectMode("register")} />

          <AppBtn
            type="button"
            variant="outline"
            className="w-full auth-oauth-google-btn"
            disabled={pending || oauthPending}
            loading={oauthPending}
            onClick={onGoogleOAuth}
          >
            <GoogleMark />
            Continue with Google
          </AppBtn>

          <div className="auth-oauth-divider" role="presentation">
            <span className="auth-oauth-divider__rule auth-oauth-divider__rule--left" aria-hidden />
            <span className="auth-oauth-divider__text">
              <span className="auth-oauth-divider__eyebrow">Or</span>
              <span className="auth-oauth-divider__body">continue with email</span>
            </span>
            <span className="auth-oauth-divider__rule auth-oauth-divider__rule--right" aria-hidden />
          </div>

          <div className={`auth-form-stack auth-form-stack--${mode}`}>
            <div
              className={`auth-form-panel auth-form-panel--login ${mode === "login" ? "auth-form-panel--visible" : ""}`}
              aria-hidden={mode !== "login"}
            >
            <form
              id="panel-auth-login"
              role="tabpanel"
              aria-labelledby="auth-tab-login"
              onSubmit={onLoginSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <AppFormRow label="Email" labelFor="login-email">
                <AppInput
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </AppFormRow>
              <AppFormRow label="Password" labelFor="login-password">
                <AppInput
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </AppFormRow>

              {error && mode === "login" ? (
                <p
                  role="alert"
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

              <AppBtn type="submit" variant="primary" className="w-full" disabled={pending} loading={pending && mode === "login"}>
                Sign In
              </AppBtn>
            </form>

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <AppBtn variant="ghost" size="sm" href="/auth/forgot-password" as={Link}>
                Forgot password?
              </AppBtn>
            </div>
          </div>

          <div
            className={`auth-form-panel auth-form-panel--register ${mode === "register" ? "auth-form-panel--visible" : ""}`}
            aria-hidden={mode !== "register"}
          >
            <form
              id="panel-auth-register"
              role="tabpanel"
              aria-labelledby="auth-tab-register"
              onSubmit={onRegisterSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <AppFormRow label="Full name" labelFor="register-name">
                <AppInput id="register-name" name="name" type="text" placeholder="Antonio Kovač" autoComplete="name" />
              </AppFormRow>
              <AppFormRow label="Email" labelFor="register-email">
                <AppInput
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </AppFormRow>
              <AppFormRow label="Password" labelFor="register-password">
                <AppInput
                  id="register-password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </AppFormRow>

              {error && mode === "register" ? (
                <p
                  role="alert"
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
              {successMessage ? (
                <p
                  role="status"
                  style={{
                    fontSize: 13,
                    color: "var(--app-success)",
                    background: "color-mix(in srgb, var(--app-success) 12%, transparent)",
                    border: "1.5px solid color-mix(in srgb, var(--app-success) 35%, transparent)",
                    padding: "10px 14px",
                    borderRadius: 10,
                  }}
                >
                  {successMessage}
                </p>
              ) : null}

              <AppBtn type="submit" variant="primary" className="w-full" disabled={pending} loading={pending && mode === "register"}>
                Create Account
              </AppBtn>
            </form>
          </div>
        </div>
        </AppCard>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--app-muted)" }}>
          By continuing you agree to Calisto&apos;s{" "}
          <span style={{ textDecoration: "underline" }}>Terms &amp; Privacy Policy</span>.
        </p>
      </div>
    </main>
  );
}
