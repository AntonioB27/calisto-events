import Link from "next/link";

export default function ResetPasswordSuccessPage() {
  return (
    <main className="app-shell" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 32, height: 3, background: 'var(--app-gold)', borderRadius: 2, margin: '0 auto 12px' }} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 40, color: 'var(--app-text)', lineHeight: 1 }}>
            Password updated
          </h1>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--app-muted)', marginTop: 10 }}>
            You can sign in with your new password.
          </p>
        </div>
        <div style={{
          background: 'var(--app-card)', borderRadius: 18,
          border: '1.5px solid var(--app-border)', padding: 32,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <Link
            href="/auth/login"
            style={{
              display: 'flex', justifyContent: 'center',
              padding: '15px 28px', borderRadius: 14,
              background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
              color: '#fff', fontSize: 15, fontWeight: 600,
              textDecoration: 'none', transition: 'all 0.18s',
              boxShadow: '0 4px 16px color-mix(in srgb, var(--app-purple) 27%, transparent)',
            }}
          >
            Go to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
