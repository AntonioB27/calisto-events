import Link from "next/link";

export default function WelcomePage() {
  return (
    <main className="app-shell" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <div style={{ width: 32, height: 3, background: 'var(--app-gold)', borderRadius: 2, margin: '0 auto 16px' }} />
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--app-muted)', marginBottom: 8 }}>
          Welcome to
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 56, color: 'var(--app-text)', lineHeight: 1, marginBottom: 12 }}>
          Calisto.
        </h1>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--app-muted)', marginBottom: 40, lineHeight: 1.6 }}>
          Collect photos and videos from everyone at your event.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link href="/auth/register" style={{
            display: 'block', padding: '15px 28px', borderRadius: 14, fontSize: 15, fontWeight: 600,
            background: 'linear-gradient(135deg, var(--app-purple) 0%, #7B3FBE 100%)',
            color: '#fff', textDecoration: 'none', textAlign: 'center',
            boxShadow: '0 4px 16px color-mix(in srgb, var(--app-purple) 27%, transparent)',
          }}>
            Create organizer account
          </Link>
          <Link href="/auth/login" style={{
            display: 'block', padding: '15px 28px', borderRadius: 14, fontSize: 15, fontWeight: 600,
            background: 'transparent', color: 'var(--app-muted)',
            border: '1.5px solid var(--app-border)', textDecoration: 'none', textAlign: 'center',
          }}>
            I already have an account
          </Link>
          <Link href="/join" style={{
            display: 'block', padding: '12px', fontSize: 14,
            color: 'var(--app-muted)', textDecoration: 'none', textAlign: 'center',
          }}>
            I have an event code →
          </Link>
        </div>

        <p style={{ marginTop: 40, fontSize: 12, color: 'var(--app-muted)' }}>
          <Link href="/" style={{ color: 'var(--app-gold)', textDecoration: 'underline' }}>
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
