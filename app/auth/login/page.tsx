"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getSafeReturnPath } from "@/lib/safe-return-path";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = getSafeReturnPath(searchParams.get("returnTo"));
  const [tab, setTab] = useState<'login' | 'register'>('login');
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
    <main className="app-shell" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Wordmark */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 32, height: 3, background: 'var(--app-gold)', borderRadius: 2, margin: '0 auto 12px' }} />
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--app-muted)' }}>
            Welcome to
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 56, color: 'var(--app-text)', lineHeight: 1 }}>
            Calisto.
          </h1>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--app-card)', borderRadius: 18,
          border: '1.5px solid var(--app-border)',
          padding: 32,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'var(--app-bg)', borderRadius: 12, padding: 4, marginBottom: 28 }}>
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => t === 'register' ? router.push('/auth/register') : setTab('login')}
                style={{
                  flex: 1, padding: '10px 0', border: 'none', borderRadius: 10,
                  background: tab === t ? 'var(--app-card-solid)' : 'transparent',
                  color: tab === t ? 'var(--app-text)' : 'var(--app-muted)',
                  fontWeight: tab === t ? 600 : 400, fontSize: 14,
                  boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label htmlFor="login-email" style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--app-muted)', marginBottom: 8 }}>
                Email
              </label>
              <input
                id="login-email"
                name="email" type="email" placeholder="you@example.com"
                autoComplete="email" required
                style={{
                  width: '100%', padding: '13px 16px',
                  background: 'var(--app-bg)',
                  border: '1.5px solid var(--app-border)',
                  borderRadius: 12, fontSize: 15, color: 'var(--app-text)',
                  outline: 'none', fontFamily: 'inherit',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--app-gold)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--app-border)')}
              />
            </div>
            <div>
              <label htmlFor="login-password" style={{ display: 'block', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--app-muted)', marginBottom: 8 }}>
                Password
              </label>
              <input
                id="login-password"
                name="password" type="password" placeholder="••••••••"
                autoComplete="current-password" required
                style={{
                  width: '100%', padding: '13px 16px',
                  background: 'var(--app-bg)',
                  border: '1.5px solid var(--app-border)',
                  borderRadius: 12, fontSize: 15, color: 'var(--app-text)',
                  outline: 'none', fontFamily: 'inherit',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--app-gold)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--app-border)')}
              />
            </div>

            {error && (
              <p style={{ fontSize: 13, color: '#e05252', background: 'rgba(224,82,82,0.08)', padding: '10px 14px', borderRadius: 10 }}>
                {error}
              </p>
            )}

            <button
              type="submit" disabled={pending}
              style={{
                width: '100%', padding: '15px 28px', border: 'none', borderRadius: 14,
                background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
                color: '#fff', fontSize: 15, fontWeight: 600, cursor: pending ? 'not-allowed' : 'pointer',
                opacity: pending ? 0.7 : 1, transition: 'all 0.18s',
                boxShadow: '0 4px 16px color-mix(in srgb, var(--app-purple) 27%, transparent)',
              }}
            >
              {pending ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link href="/auth/forgot-password" style={{ fontSize: 13, color: 'var(--app-muted)', textDecoration: 'underline' }}>
              Forgot password?
            </Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--app-muted)' }}>
          By continuing you agree to Calisto&apos;s{' '}
          <span style={{ textDecoration: 'underline' }}>Terms &amp; Privacy Policy</span>.
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--app-muted)', fontSize: 14 }}>Loading…</p>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
