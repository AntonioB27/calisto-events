import Image from "next/image";
import Link from "next/link";
import type { LandingCopy, Locale } from "@/lib/i18n";

type WaitlistFormProps = {
  copy: LandingCopy["waitlist"];
  mascotAlt: string;
  locale: Locale;
};

export function WaitlistForm({ copy, mascotAlt }: WaitlistFormProps) {
  return (
    <section
      id="demo"
      className="relative scroll-mt-20 overflow-hidden"
      style={{
        borderTop: "1px solid var(--hair)",
        padding: "48px 0 40px",
        textAlign: "center",
        zIndex: 2,
      }}
    >
      {/* Plum + amber radial glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at center, rgba(139,106,140,0.30) 0%, transparent 60%), radial-gradient(ellipse at 85% 25%, rgba(240,179,75,0.22) 0%, transparent 55%)",
          opacity: 0.7,
          pointerEvents: "none",
        }}
      />

      <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 32px", position: "relative", zIndex: 2 }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "clamp(52px, 8vw, 108px)",
            lineHeight: 0.97,
            letterSpacing: "-0.022em",
            color: "var(--cream)",
            margin: 0,
          }}
        >
          {copy.title}
        </h2>

        <p
          style={{
            margin: "28px auto 0",
            maxWidth: 480,
            fontFamily: "var(--font-sans)",
            fontSize: 16,
            lineHeight: 1.6,
            color: "var(--cream-3, #B5AB99)",
          }}
        >
          {copy.description}
        </p>

        <div style={{ margin: "32px auto 0", maxWidth: 240 }}>
          <Image
            src="/brand/mascot/aurora_planning.png"
            alt={mascotAlt}
            width={240}
            height={240}
            style={{ width: "100%", height: "auto", objectFit: "contain" }}
          />
        </div>

        <div style={{ margin: "36px auto 0", display: "flex", justifyContent: "center" }}>
          <Link
            href="/events/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "15px 32px",
              borderRadius: 999,
              background: "linear-gradient(135deg, var(--gold) 0%, var(--amber) 45%, var(--gold-deep) 100%)",
              color: "#1b1208",
              fontFamily: "var(--font-sans)",
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: "0.01em",
              textDecoration: "none",
              boxShadow: "0 0 0 1px rgba(255,255,255,0.28) inset, 0 16px 48px -12px rgba(240,179,75,0.55)",
              transition: "all 250ms ease",
            }}
          >
            {copy.buttonIdle}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
