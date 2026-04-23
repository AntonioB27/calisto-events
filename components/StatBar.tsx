import type { LandingCopy } from "@/lib/i18n";

type StatBarProps = { copy: LandingCopy };

export function StatBar({ copy }: StatBarProps) {
  return (
    <section
      className="relative"
      style={{
        borderTop: "1px solid var(--hair)",
        borderBottom: "1px solid var(--hair)",
        padding: "60px 0",
        zIndex: 2,
      }}
    >
      <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 32px" }}>
        <dl
          className="grid"
          style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
        >
          {copy.statBar.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center"
              style={{
                borderRight: i < copy.statBar.length - 1 ? "1px solid var(--hair)" : undefined,
                padding: "0 24px",
              }}
            >
              <dt
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontSize: "clamp(2.8rem, 5vw, 4rem)",
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  color: "var(--cream)",
                }}
              >
                {stat.value}
              </dt>
              <dd
                style={{
                  marginTop: 10,
                  fontFamily: "var(--font-mono)",
                  fontSize: "10.5px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--cream-4, #6E6758)",
                }}
              >
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <style>{`
        @media (max-width: 640px) {
          #stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
