import type React from "react";
import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type PlanCardsProps = {
  copy: LandingCopy;
};

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0Z" />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

type PlanConfig = {
  icon: () => React.ReactElement;
  accentClass: string;
  glowColor: string;
  popular: boolean;
};

const PLAN_CONFIG: Record<string, PlanConfig> = {
  free:     { icon: LeafIcon,    accentClass: "bg-zinc-400/20 text-zinc-300 border-zinc-400/30",  glowColor: "rgba(161,161,170,0.2)", popular: false },
  standard: { icon: StarIcon,    accentClass: "bg-[#b453c9]/20 text-[#d08ae0] border-[#b453c9]/30", glowColor: "rgba(180,83,201,0.25)", popular: false },
  premium:  { icon: DiamondIcon, accentClass: "bg-amber-400/20 text-amber-300 border-amber-400/30",  glowColor: "rgba(245,158,11,0.3)",  popular: true  },
  max:      { icon: RocketIcon,  accentClass: "bg-orange-400/20 text-orange-300 border-orange-400/30", glowColor: "rgba(249,115,22,0.25)", popular: false },
};

export function PlanCards({ copy }: PlanCardsProps) {
  return (
    <section
      id="plans"
      className="relative overflow-x-clip scroll-mt-20 bg-ink px-4 py-20 sm:px-6 sm:py-24"
    >
      {/* Ambient glow — capped to section width for narrow viewports */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[min(800px,100%)] max-w-full -translate-x-1/2"
        style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(245,158,11,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <div className="min-w-0 max-w-2xl">
            <h2
              className="font-extrabold tracking-tight text-white"
              style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
            >
              {copy.plansTitle}
            </h2>
            <p className="mt-3 text-lg text-zinc-300">
              <strong className="font-semibold text-white">{copy.plansDescriptionStrong}</strong>
              {" — "}
              {copy.plansDescriptionRest}
            </p>
          </div>
          <div className="mx-auto flex w-full max-w-[min(100%,240px)] shrink-0 flex-col items-center gap-3 sm:max-w-[260px] lg:mx-0">
            <div className="relative w-full px-1">
              <p className="relative rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-center text-sm font-semibold leading-snug text-white shadow-md backdrop-blur-md">
                {copy.plansAuroraBubble}
                <span
                  aria-hidden
                  className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-white/15 bg-ink"
                />
              </p>
            </div>
            <Image
              src="/brand/mascot/aurora_planning.png"
              alt={copy.plansMascotAlt}
              width={1000}
              height={1000}
              className="h-auto w-full object-contain drop-shadow-[0_16px_32px_rgba(180,83,201,0.25)]"
            />
          </div>
        </div>

        {/* Cards */}
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {copy.plans.map((plan) => {
            const [priceRow, ...restRows] = plan.rows;
            const config = PLAN_CONFIG[plan.id] ?? PLAN_CONFIG.free!;
            const Icon = config.icon;
            return (
              <article
                key={plan.id}
                tabIndex={0}
                className={`plan-card group relative overflow-hidden rounded-2xl outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink ${
                  config.popular
                    ? "border border-amber-400/50 bg-white/8 shadow-[0_0_0_1px_rgba(245,158,11,0.15),0_8px_32px_rgba(245,158,11,0.12)]"
                    : "border border-white/10 bg-white/5 hover:bg-white/8"
                }`}
                aria-labelledby={`plan-${plan.id}`}
              >
                {/* Popular inner glow */}
                {config.popular && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 65%)",
                    }}
                  />
                )}

                {/* Hover inner glow for non-popular */}
                {!config.popular && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${config.glowColor.replace(/[\d.]+\)$/, "0.06)")} 0%, transparent 65%)`,
                    }}
                  />
                )}

                {/* Card header */}
                <div className="relative px-6 py-5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`inline-flex h-7 w-7 items-center justify-center rounded-lg border ${config.accentClass}`}>
                        <Icon />
                      </span>
                      <h3
                        id={`plan-${plan.id}`}
                        className="text-lg font-extrabold tracking-wide text-white"
                      >
                        {plan.name}
                      </h3>
                    </div>
                    {config.popular && (
                      <span className="rounded-full bg-amber-400/20 border border-amber-400/30 px-3 py-0.5 text-xs font-bold text-amber-300">
                        {copy.popularBadge}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <p className="text-4xl font-extrabold tracking-tight text-white">
                      {priceRow?.value}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">
                    {plan.tailoredFor}
                  </p>

                  {/* Divider */}
                  <div className={`mt-5 h-px ${config.popular ? "bg-amber-400/20" : "bg-white/8"}`} />
                </div>

                {/* Card body */}
                <div className="relative px-6 pb-5">
                  <div className="plan-card-extras">
                    <div className="plan-card-extras-inner">
                      <dl className="space-y-3 pt-1">
                        {restRows.map((row) => (
                          <div key={row.label} className="grid grid-cols-[7.5rem_1fr] gap-2 text-sm">
                            <dt className="font-medium text-zinc-500">{row.label}</dt>
                            <dd className="text-zinc-300">{row.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm italic leading-relaxed text-zinc-400">
          {copy.planFootnote}
        </p>
      </div>
    </section>
  );
}
