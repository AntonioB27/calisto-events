"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppCard } from "@/components/app-ui/AppCard";
import { AppFormRow } from "@/components/app-ui/AppFormRow";
import { AppInput } from "@/components/app-ui/AppInput";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getSafeReturnPath } from "@/lib/safe-return-path";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = getSafeReturnPath(searchParams.get("returnTo"));
  const [tab, setTab] = useState<"login" | "register">("login");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://www.calisto-events.com/_next/image?url=%2Fbrand%2Fmascot.png&w=640&q=75"
            alt="Aurora"
            style={{ width: 90, height: 90, objectFit: "contain", marginBottom: 12, filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.1))" }}
          />
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

        <AppCard pad="lg" style={{ borderRadius: 18, boxShadow: "var(--app-shadow-sm)" }}>
          <div
            style={{
              display: "flex",
              background: "var(--app-bg)",
              borderRadius: 12,
              padding: 4,
              gap: 4,
              marginBottom: 28,
            }}
          >
            {(["login", "register"] as const).map((t) => (
              <AppBtn
                key={t}
                type="button"
                variant={tab === t ? "secondary" : "ghost"}
                className="flex-1"
                onClick={() => (t === "register" ? router.push("/auth/register") : setTab("login"))}
              >
                {t === "login" ? "Sign In" : "Register"}
              </AppBtn>
            ))}
          </div>

          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
              Sign In
            </AppBtn>
          </form>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <AppBtn variant="ghost" size="sm" href="/auth/forgot-password" as={Link}>
              Forgot password?
            </AppBtn>
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="app-shell" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <p style={{ color: "var(--app-muted)", fontSize: 14 }}>Loading…</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
