"use client";

import Link from "next/link";

import { useAppUi } from "@/components/AppUiProvider";
import { AppBadge } from "@/components/app-ui/AppBadge";
import { appButtonClassNames } from "@/components/app-ui/AppBtn";
import { AppCard } from "@/components/app-ui/AppCard";
import { interpolate } from "@/lib/app-ui";
import type { PlanId } from "@/lib/plan-limits";
import { getPlanLimits, PLAN_DB_INT_MAX } from "@/lib/plan-limits";

const PLANS = ["free", "standard", "plus", "premium", "max"] as const;

function formatCapLabel(n: number, unlimitedLabel: string) {
  return n >= PLAN_DB_INT_MAX ? unlimitedLabel : String(n);
}

export function PlanTiersPageClient() {
  const ui = useAppUi();

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-start justify-between gap-3">
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--app-gold)",
              }}
            >
              {ui.planTiersPage.eyebrow}
            </p>
            <h1
              style={{
                marginTop: 8,
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 700,
                fontSize: 28,
                color: "var(--app-text)",
                lineHeight: 1.2,
              }}
            >
              {ui.planTiersPage.title}
            </h1>
            <p style={{ marginTop: 6, fontSize: 14, color: "var(--app-muted)" }}>{ui.planTiersPage.subtitle}</p>
          </div>
          <Link
            href="/dashboard"
            className={appButtonClassNames({ variant: "ghost", size: "sm", className: "flex-shrink-0" })}
          >
            {ui.planTiersPage.back}
          </Link>
        </div>

        <div className="grid gap-4">
          {PLANS.map((planId) => {
            const limits = getPlanLimits(planId);
            return (
              <AppCard key={planId} hover pad="lg">
                <div className="flex items-start justify-between gap-3">
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontStyle: "italic",
                      fontWeight: 700,
                      fontSize: 20,
                      color: "var(--app-text)",
                    }}
                  >
                    {ui.plans[planId as PlanId]}
                  </h2>
                  <AppBadge tone="accent" className="flex-shrink-0">
                    {interpolate(ui.planTiersPage.uploadBadge, { n: limits.uploadDaysAfterEvent })}
                  </AppBadge>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {(
                    [
                      { label: ui.planTiersPage.colGuests, value: limits.guests },
                      { label: ui.planTiersPage.colPhotos, value: limits.photos },
                      { label: ui.planTiersPage.colVideos, value: limits.videos },
                    ] as const
                  ).map(({ label, value }) => (
                    <div
                      key={label}
                      style={{
                        background: "var(--app-card-solid)",
                        border: "1.5px solid var(--app-border)",
                        borderRadius: 12,
                        padding: 16,
                      }}
                    >
                      <dt
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          color: "var(--app-muted)",
                        }}
                      >
                        {label}
                      </dt>
                      <dd style={{ marginTop: 8, fontSize: 22, fontWeight: 700, color: "var(--app-text)" }}>
                        {formatCapLabel(value, ui.createStep2.unlimited)}
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
