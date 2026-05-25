import Link from "next/link";

const FS = "'DM Serif Display', serif";
const FB = "'DM Sans', sans-serif";
const GOLD   = '#C5922A';
const PURPLE = '#5B2D8E';

export default function DemoLandingPage() {
  return (
    <main
      className="app-shell"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        {/* Eyebrow */}
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: GOLD, fontFamily: FB, marginBottom: 12 }}>
          Live demo
        </p>

        {/* Headline */}
        <h1 style={{ fontFamily: FS, fontStyle: "italic", fontWeight: 700, fontSize: 38, color: "var(--app-text)", lineHeight: 1.1, marginBottom: 16, letterSpacing: "-0.02em" }}>
          See Calisto in action
        </h1>

        {/* Subtitle */}
        <p style={{ fontSize: 15, color: "var(--app-muted)", lineHeight: 1.65, fontFamily: FB, marginBottom: 36 }}>
          Explore a real wedding event — no account needed. Switch between the organizer's command view and the guest experience to see both sides of Calisto.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/demo/demoevent?role=organizer"
            style={{
              background: `linear-gradient(135deg, #8B4FD8, ${PURPLE})`,
              color: "#fff",
              padding: "14px 28px",
              borderRadius: 14,
              fontFamily: FB,
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 6px 18px rgba(91,45,142,0.35)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            See as Organizer →
          </Link>
          <Link
            href="/demo/demoevent?role=guest"
            style={{
              background: "var(--app-surface)",
              color: "var(--app-text)",
              border: "1.5px solid var(--app-border)",
              padding: "14px 28px",
              borderRadius: 14,
              fontFamily: FB,
              fontSize: 15,
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            See as Guest →
          </Link>
        </div>

        {/* Footer note */}
        <p style={{ marginTop: 32, fontSize: 12, color: "var(--app-muted)", fontFamily: FB, fontStyle: "italic" }}>
          A wedding by Ana & Marco · 33 photos · 17 guests
        </p>
      </div>
    </main>
  );
}
