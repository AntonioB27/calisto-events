"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

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
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 40, color: 'var(--app-text)', lineHeight: 1 }}>
            Reset Password
          </h1>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--app-muted)', marginTop: 10 }}>
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--app-card)', borderRadius: 18,
          border: '1.5px solid var(--app-border)',
          padding: 32,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          {sent ? (
            <div style={{
              background: 'rgba(34,160,107,0.08)', border: '1.5px solid rgba(34,160,107,0.2)',
              borderRadius: 12, padding: '16px 18px', fontSize: 14, color: '#22a06b', lineHeight: 1.6,
            }}>
              Check your inbox for a link to set a new password. You can close this tab.
            </div>
          ) : (
            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--app-muted)', marginBottom: 8 }}>
                  Email
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  disabled={pending}
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
                  color: '#fff', fontSize: 15, fontWeight: 600,
                  cursor: pending ? 'not-allowed' : 'pointer',
                  opacity: pending ? 0.7 : 1, transition: 'all 0.18s',
                  boxShadow: '0 4px 16px color-mix(in srgb, var(--app-purple) 27%, transparent)',
                }}
              >
                {pending ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link href="/auth/login" style={{ fontSize: 13, color: 'var(--app-muted)', textDecoration: 'underline' }}>
              Back to sign in
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
