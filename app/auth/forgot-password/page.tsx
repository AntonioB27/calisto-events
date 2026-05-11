"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppCard } from "@/components/app-ui/AppCard";
import { AppFormRow } from "@/components/app-ui/AppFormRow";
import { AppInput } from "@/components/app-ui/AppInput";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

function buildRedirectTo() {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/auth/reset-password`;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const clean = email.trim();
    if (!clean) {
      setError("Enter your email address.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo = buildRedirectTo();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(clean, {
        redirectTo: redirectTo || undefined,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email.");
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
            Welcome to
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
            Reset Password
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
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <AppCard pad="lg" style={{ borderRadius: 18, boxShadow: "var(--app-shadow-sm)" }}>
          {sent ? (
            <div
              style={{
                background: "color-mix(in srgb, var(--app-success) 12%, transparent)",
                border: "1.5px solid color-mix(in srgb, var(--app-success) 35%, transparent)",
                borderRadius: 12,
                padding: "16px 18px",
                fontSize: 14,
                color: "var(--app-success)",
                lineHeight: 1.6,
              }}
            >
              Check your inbox for a link to set a new password. You can close this tab.
            </div>
          ) : (
            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <AppFormRow label="Email" labelFor="forgot-email">
                <AppInput
                  id="forgot-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={setEmail}
                  disabled={pending}
                  required
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
                Send reset link
              </AppBtn>
            </form>
          )}

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <AppBtn variant="ghost" size="sm" href="/auth/login" as={Link}>
              Back to sign in
            </AppBtn>
          </div>
        </AppCard>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--app-muted)" }}>
          By continuing you agree to Calisto&apos;s{" "}
          <Link href="/terms" style={{ textDecoration: "underline", color: "inherit" }}>
            Terms
          </Link>
          {" "}and{" "}
          <Link href="/privacy" style={{ textDecoration: "underline", color: "inherit" }}>
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
