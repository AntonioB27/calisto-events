import Link from "next/link";

import { appButtonClassNames } from "@/components/app-ui/AppBtn";
import {
  MascotSpot,
  WELCOME_HERO_COLUMN_MAX_WIDTH_PX,
  WELCOME_HERO_MASCOT_PX,
} from "@/components/MascotSpot";

export default function WelcomePage() {
  return (
    <main className="app-shell" style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: WELCOME_HERO_COLUMN_MAX_WIDTH_PX, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <MascotSpot
            src="/brand/mascot/aurora_present.png"
            size={WELCOME_HERO_MASCOT_PX}
            variant="stack"
            className="welcome-mascot"
          />
        </div>
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
          <Link href="/events/new" className={appButtonClassNames({ variant: "primary", size: "lg" })}>
            Create an event
          </Link>
          <Link href="/join" className={appButtonClassNames({ variant: "outline", size: "lg" })}>
            Join an event
          </Link>
          <Link
            href={`/auth/login?returnTo=${encodeURIComponent("/dashboard")}`}
            className={appButtonClassNames({ variant: "ghost", size: "lg" })}
          >
            I already have an account
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
