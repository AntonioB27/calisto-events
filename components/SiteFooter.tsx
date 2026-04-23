import type { LandingCopy } from "@/lib/i18n";

type SiteFooterProps = { copy: LandingCopy };

export function SiteFooter({ copy }: SiteFooterProps) {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--hair)",
        padding: "44px 0 60px",
        zIndex: 2,
        position: "relative",
      }}
    >
      <div
        className="mx-auto flex flex-wrap justify-between items-center"
        style={{ maxWidth: 1280, padding: "0 32px", gap: 24 }}
      >
        {/* Brand */}
        <a
          href="#top"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "var(--font-display)",
            fontSize: 18,
            fontWeight: 500,
            color: "var(--cream)",
            textDecoration: "none",
            letterSpacing: "0.01em",
          }}
        >
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "radial-gradient(circle at 30% 30%, var(--plum-2, #A584A6), var(--plum, #8B6A8C) 55%, #3d2640 100%)",
              boxShadow: "0 0 14px rgba(165,132,166,0.35)",
              flexShrink: 0,
            }}
          />
          Calisto
          <em style={{ fontStyle: "italic", color: "var(--cream-2, #E8DCC6)", fontWeight: 400 }}>.</em>
        </a>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 24 }}>
          {[
            { href: "#", label: copy.footerPrivacy },
            { href: "#", label: copy.footerTerms },
            { href: "mailto:hello@calisto.co", label: "hello@calisto.co" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.href}
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 12,
                color: "var(--cream-4, #6E6758)",
                textDecoration: "none",
                transition: "color 200ms",
                letterSpacing: "0.02em",
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10.5px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--cream-4, #6E6758)",
          }}
        >
          © MMXXVI · {copy.footerRightsLine}
        </div>
      </div>
    </footer>
  );
}
