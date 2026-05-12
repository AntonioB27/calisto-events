"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAppUi } from "@/components/AppUiProvider";
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
import { getBrowserPublicOrigin } from "@/lib/browser-public-origin";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getPostAuthRedirectPath } from "@/lib/safe-return-path";

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
  const ui = useAppUi();
  const router = useRouter();
  const searchParams = useSearchParams();
  const afterAuthPath = useMemo(
    () => getPostAuthRedirectPath(searchParams.get("returnTo")),
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
    setError(ui.auth.oauthFail);
    const qs = new URLSearchParams(searchParams.toString());
    qs.delete("oauth_error");
    const tail = qs.toString();
    router.replace(tail ? `/auth/login?${tail}` : "/auth/login", { scroll: false });
  }, [router, searchParams, ui.auth.oauthFail]);

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
      const nextPath = afterAuthPath;
      const origin = getBrowserPublicOrigin() || window.location.origin;
      const redirectTo = new URL(`${origin}/auth/callback`);
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

      setError(ui.auth.googleStartFail);
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

      router.push(afterAuthPath);
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
        router.push(afterAuthPath);
        router.refresh();
        return;
      }

      setSuccessMessage(ui.auth.checkEmailVerify);
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
        paddingTop: 24,
        paddingLeft: 24,
        paddingRight: 24,
        paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))",
        overflowY: "auto",
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
            {ui.auth.welcomeEyebrow}
          </p>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: "clamp(36px, 13vw, 56px)",
              color: "var(--app-text)",
              lineHeight: 1,
            }}
          >
            Calisto{ui.auth.brandRest}
          </h1>
        </div>

        <AppCard pad="lg" className="auth-card" style={{ borderRadius: 18 }}>
          <AuthModeRail
            active={mode}
            onLogin={() => selectMode("login")}
            onRegister={() => selectMode("register")}
            copy={ui.authRail}
          />

          <AppBtn
            type="button"
            variant="outline"
            className="w-full auth-oauth-google-btn"
            disabled={pending || oauthPending}
            loading={oauthPending}
            onClick={onGoogleOAuth}
            size="lg"
          >
            <GoogleMark />
            {ui.auth.continueGoogle}
          </AppBtn>

          <div className="auth-oauth-divider" role="presentation">
            <span className="auth-oauth-divider__rule auth-oauth-divider__rule--left" aria-hidden />
            <span className="auth-oauth-divider__text">
              <span className="auth-oauth-divider__eyebrow">{ui.auth.dividerOr}</span>
              <span className="auth-oauth-divider__body">{ui.auth.dividerBody}</span>
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
              <AppFormRow label={ui.auth.email} labelFor="login-email">
                <AppInput
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder={ui.auth.emailPlaceholderRegister}
                  autoComplete="email"
                  required
                />
              </AppFormRow>
              <AppFormRow label={ui.auth.password} labelFor="login-password">
                <AppInput
                  id="login-password"
                  name="password"
                  type="password"
                  placeholder={ui.auth.passwordDots}
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

              <AppBtn type="submit" variant="primary" size="lg" className="w-full auth-submit-btn" disabled={pending} loading={pending && mode === "login"}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <rect x="3" y="7.5" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M5 7.5V5a3 3 0 0 1 6 0v2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                {ui.auth.signInSubmit}
              </AppBtn>
            </form>

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <AppBtn variant="ghost" size="sm" href="/auth/forgot-password" as={Link} className="auth-forgot-link">
                {ui.auth.forgotPw}
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
              <AppFormRow label={ui.auth.fullName} labelFor="register-name">
                <AppInput
                  id="register-name"
                  name="name"
                  type="text"
                  placeholder={ui.auth.namePlaceholder}
                  autoComplete="name"
                />
              </AppFormRow>
              <AppFormRow label={ui.auth.email} labelFor="register-email">
                <AppInput
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder={ui.auth.emailPlaceholderAlt}
                  autoComplete="email"
                  required
                />
              </AppFormRow>
              <AppFormRow label={ui.auth.password} labelFor="register-password">
                <AppInput
                  id="register-password"
                  name="password"
                  type="password"
                  placeholder={ui.auth.passwordDots}
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

              <AppBtn type="submit" variant="primary" size="lg" className="w-full auth-submit-btn" disabled={pending} loading={pending && mode === "register"}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M8 1.5 L9.18 6.82 L14.5 8 L9.18 9.18 L8 14.5 L6.82 9.18 L1.5 8 L6.82 6.82 Z" />
                </svg>
                {ui.auth.createAccountSubmit}
              </AppBtn>
            </form>
          </div>
        </div>
        </AppCard>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--app-muted)" }}>
          {ui.auth.legalPrefix}{" "}
          <Link href="/terms" style={{ textDecoration: "underline", color: "inherit" }}>
            {ui.auth.terms}
          </Link>
          {" "}
          {ui.auth.and}{" "}
          <Link href="/privacy" style={{ textDecoration: "underline", color: "inherit" }}>
            {ui.auth.privacy}
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
