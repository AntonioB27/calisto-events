import Link from "next/link";

import { AppCard } from "@/components/app-ui/AppCard";
import { getPlanLimits } from "@/lib/plan-limits";

const PLANS = ["free", "standard", "plus", "premium", "max"] as const;

export default function PlanTiersPage() {
  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-start justify-between gap-3">
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--app-gold)' }}>
              Plans
            </p>
            <h1 style={{ marginTop: 8, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: 'var(--app-text)', lineHeight: 1.2 }}>
              Plan tiers
            </h1>
            <p style={{ marginTop: 6, fontSize: 14, color: 'var(--app-muted)' }}>
              A quick summary of guest and upload limits.
            </p>
          </div>
          <Link href="/dashboard" style={{ fontSize: 13, color: 'var(--app-gold)', textDecoration: 'underline', flexShrink: 0 }}>
            Back
          </Link>
        </div>

        <div className="grid gap-4">
          {PLANS.map((planId) => {
            const limits = getPlanLimits(planId);
            return (
              <AppCard key={planId} hover style={{ padding: 24 }}>
                <div className="flex items-start justify-between gap-3">
                  <h2 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 20, color: 'var(--app-text)', textTransform: 'capitalize' }}>
                    {planId}
                  </h2>
                  <span style={{
                    flexShrink: 0,
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    background: 'color-mix(in srgb, var(--app-gold) 12%, transparent)',
                    border: '1.5px solid color-mix(in srgb, var(--app-gold) 30%, transparent)',
                    color: 'var(--app-gold)',
                  }}>
                    {limits.uploadDaysAfterEvent} days uploads
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {(
                    [
                      { label: "Guests", value: limits.guests },
                      { label: "Photos", value: limits.photos },
                      { label: "Videos", value: limits.videos },
                    ] as const
                  ).map(({ label, value }) => (
                    <div
                      key={label}
                      style={{
                        background: 'var(--app-card-solid)',
                        border: '1.5px solid var(--app-border)',
                        borderRadius: 12,
                        padding: 16,
                      }}
                    >
                      <dt style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--app-muted)' }}>
                        {label}
                      </dt>
                      <dd style={{ marginTop: 8, fontSize: 22, fontWeight: 700, color: 'var(--app-text)' }}>
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </AppCard>
            );
          })}
        </div>
      </div>
    </main>
  );
}

