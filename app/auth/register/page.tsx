"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '13px 16px',
    background: 'var(--app-bg)',
    border: '1.5px solid var(--app-border)',
    borderRadius: 12, fontSize: 15, color: 'var(--app-text)',
    outline: 'none', fontFamily: 'inherit',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
    textTransform: 'uppercase', color: 'var(--app-muted)', marginBottom: 8,
  };

  return (
    <main className="app-shell" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 32, height: 3, background: 'var(--app-gold)', borderRadius: 2, margin: '0 auto 12px' }} />
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--app-muted)' }}>
            Welcome to
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 56, color: 'var(--app-text)', lineHeight: 1 }}>
            Calisto.
          </h1>
        </div>

        <div style={{
          background: 'var(--app-card)', borderRadius: 18,
          border: '1.5px solid var(--app-border)', padding: 32,
        }}>
          {/* Tab switcher */}
          <div style={{ display: 'flex', background: 'var(--app-bg)', borderRadius: 12, padding: 4, marginBottom: 28 }}>
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => t === 'login' ? router.push('/auth/login') : undefined}
                style={{
                  flex: 1, padding: '10px 0', border: 'none', borderRadius: 10,
                  background: t === 'register' ? 'var(--app-card-solid)' : 'transparent',
                  color: t === 'register' ? 'var(--app-text)' : 'var(--app-muted)',
                  fontWeight: t === 'register' ? 600 : 400, fontSize: 14,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={labelStyle}>Full name</div>
              <input name="name" type="text" placeholder="Antonio Kovač" autoComplete="name" style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor='var(--app-gold)')}
                onBlur={e => (e.currentTarget.style.borderColor='var(--app-border)')} />
            </div>
            <div>
              <div style={labelStyle}>Email</div>
              <input name="email" type="email" placeholder="you@example.com" autoComplete="email" required style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor='var(--app-gold)')}
                onBlur={e => (e.currentTarget.style.borderColor='var(--app-border)')} />
            </div>
            <div>
              <div style={labelStyle}>Password</div>
              <input name="password" type="password" placeholder="••••••••" autoComplete="new-password" required style={inputStyle}
                onFocus={e => (e.currentTarget.style.borderColor='var(--app-gold)')}
                onBlur={e => (e.currentTarget.style.borderColor='var(--app-border)')} />
            </div>

            {error && <p style={{ fontSize: 13, color: '#e05252', background: 'rgba(224,82,82,0.08)', padding: '10px 14px', borderRadius: 10 }}>{error}</p>}
            {successMessage && <p style={{ fontSize: 13, color: '#22a06b', background: 'rgba(34,160,107,0.08)', padding: '10px 14px', borderRadius: 10 }}>{successMessage}</p>}

            <button
              type="submit" disabled={pending}
              style={{
                width: '100%', padding: '15px', border: 'none', borderRadius: 14,
                background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
                color: '#fff', fontSize: 15, fontWeight: 600,
                cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.7 : 1,
              }}
            >
              {pending ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link href="/auth/login" style={{ fontSize: 13, color: 'var(--app-muted)', textDecoration: 'underline' }}>
              Already have an account? Sign in
            </Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 12, color: 'var(--app-muted)' }}>
          By continuing you agree to Calisto&apos;s Terms &amp; Privacy Policy.
        </p>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <main className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--app-muted)', fontSize: 14 }}>Loading…</p>
      </main>
    }>
      <RegisterForm />
    </Suspense>
  );
}
