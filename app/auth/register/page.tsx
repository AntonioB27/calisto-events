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

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = getSafeReturnPath(searchParams.get("returnTo"));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const supabase = getSupabaseBrowserClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setPending(false);
      return;
    }

    if (data.session) {
      router.push(returnTo ?? "/dashboard");
      router.refresh();
      return;
    }

    setSuccessMessage("Check your email to confirm your account");
    setPending(false);
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
                variant={t === "register" ? "secondary" : "ghost"}
                className="flex-1"
                onClick={() => {
                  if (t === "login") router.push("/auth/login");
                }}
              >
                {t === "login" ? "Sign In" : "Register"}
              </AppBtn>
            ))}
          </div>

          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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
            {successMessage ? (
              <p
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

            <AppBtn type="submit" variant="primary" className="w-full" disabled={pending} loading={pending}>
              Create Account
            </AppBtn>
          </form>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <AppBtn variant="ghost" size="sm" href="/auth/login" as={Link}>
              Already have an account? Sign in
            </AppBtn>
          </div>
        </AppCard>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--app-muted)" }}>
          By continuing you agree to Calisto&apos;s Terms &amp; Privacy Policy.
        </p>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="app-shell" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
          <p style={{ color: "var(--app-muted)", fontSize: 14 }}>Loading…</p>
        </main>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
