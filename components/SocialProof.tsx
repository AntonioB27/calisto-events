import type { LandingCopy } from "@/lib/i18n";

type SocialProofProps = { copy: LandingCopy };

export function SocialProof({ copy }: SocialProofProps) {
  return (
    <section aria-label={copy.socialProof.ariaLabel} className="social-proof-section">
      <div className="social-proof-inner">
        <dl className="social-proof-grid">
          {copy.socialProof.stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`social-proof-stat welcome-reveal welcome-reveal--d${i + 1}`}
            >
              <dt className="social-proof-value">{stat.value}</dt>
              <dd className="social-proof-label">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
