"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useRef, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

function ResetPasswordInner() {
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
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
      setError(err instanceof Error ? err.message : "Could not update password.");
    } finally {
      setPending(false);
    }
  }

  const shellStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '100vh', padding: 24,
  };

  if (!ready) {
    return (
      <main className="app-shell" style={shellStyle}>
        <p style={{ fontSize: 14, color: 'var(--app-muted)' }}>Verifying reset link…</p>
      </main>
    );
  }

  if (!hasRecoverySession) {
    return (
      <main className="app-shell" style={shellStyle}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 32, height: 3, background: 'var(--app-gold)', borderRadius: 2, margin: '0 auto 12px' }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 36, color: 'var(--app-text)', lineHeight: 1 }}>
              Link expired
            </h1>
          </div>
          <div style={{
            background: 'var(--app-card)', borderRadius: 18,
            border: '1.5px solid var(--app-border)', padding: 32,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <p style={{ fontSize: 14, color: 'var(--app-muted)', lineHeight: 1.6 }}>
              Open the latest link from your email, or request a new one.
            </p>
            <Link href="/auth/forgot-password" style={{ fontSize: 14, fontWeight: 600, color: 'var(--app-gold)', textDecoration: 'underline' }}>
              Request a new reset link
            </Link>
            <Link href="/auth/login" style={{ fontSize: 13, color: 'var(--app-muted)', textDecoration: 'underline' }}>
              Back to sign in
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell" style={shellStyle}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 32, height: 3, background: 'var(--app-gold)', borderRadius: 2, margin: '0 auto 12px' }} />
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--app-muted)' }}>
            Account
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 40, color: 'var(--app-text)', lineHeight: 1 }}>
            Set a new password
          </h1>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--app-muted)', marginTop: 10 }}>
            Choose a strong password you haven&apos;t used here before.
          </p>
        </div>

        <div style={{
          background: 'var(--app-card)', borderRadius: 18,
          border: '1.5px solid var(--app-border)', padding: 32,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--app-muted)', marginBottom: 8 }}>
                New password
              </div>
              <input
                name="password"
                type="password"
                placeholder="New password"
                autoComplete="new-password"
                value={password}
                onChange={(ev) => {
                  setPassword(ev.target.value);
                  if (error) setError(null);
                }}
                disabled={pending}
                style={{
                  width: '100%', padding: '13px 16px',
                  background: 'var(--app-bg)',
                  border: '1.5px solid var(--app-border)',
                  borderRadius: 12, fontSize: 15, color: 'var(--app-text)',
                  outline: 'none', fontFamily: 'inherit',
                  opacity: pending ? 0.7 : 1,
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--app-gold)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--app-border)')}
              />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--app-muted)', marginBottom: 8 }}>
                Confirm password
              </div>
              <input
                name="confirm"
                type="password"
                placeholder="Confirm new password"
                autoComplete="new-password"
                value={confirm}
                onChange={(ev) => {
                  setConfirm(ev.target.value);
                  if (error) setError(null);
                }}
                disabled={pending}
                style={{
                  width: '100%', padding: '13px 16px',
                  background: 'var(--app-bg)',
                  border: '1.5px solid var(--app-border)',
                  borderRadius: 12, fontSize: 15, color: 'var(--app-text)',
                  outline: 'none', fontFamily: 'inherit',
                  opacity: pending ? 0.7 : 1,
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--app-gold)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--app-border)')}
              />
            </div>
            {error ? (
              <p style={{ fontSize: 13, color: '#e05252', background: 'rgba(224,82,82,0.08)', padding: '10px 14px', borderRadius: 10 }}>
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              style={{
                width: '100%', padding: '15px 28px', border: 'none', borderRadius: 14,
                background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
                color: '#fff', fontSize: 15, fontWeight: 600,
                cursor: pending ? 'not-allowed' : 'pointer',
                opacity: pending ? 0.7 : 1, transition: 'all 0.18s',
                boxShadow: '0 4px 16px color-mix(in srgb, var(--app-purple) 27%, transparent)',
              }}
            >
              {pending ? "Saving…" : "Update password"}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <Link href="/auth/login" style={{ fontSize: 13, color: 'var(--app-muted)', textDecoration: 'underline' }}>
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <main className="app-shell" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', padding: 24,
        }}>
          <p style={{ fontSize: 14, color: 'var(--app-muted)' }}>Loading…</p>
        </main>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
