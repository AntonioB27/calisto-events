 "use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import type React from "react";
import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type PlanCardsProps = { copy: LandingCopy };

type PlanConfig = {
  icon: () => React.ReactElement;
  featured: boolean;
  accentColor: string;
  borderColor: string;
};

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}
function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function DiamondIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0Z" />
    </svg>
  );
}
function RocketIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

const PLAN_CONFIG: Record<string, PlanConfig> = {
  free:     { icon: LeafIcon,    featured: false, accentColor: "var(--cream-3, #B5AB99)", borderColor: "rgba(181,171,153,0.2)" },
  standard: { icon: StarIcon,    featured: false, accentColor: "var(--plum-2, #A584A6)",  borderColor: "rgba(165,132,166,0.25)" },
  premium:  { icon: DiamondIcon, featured: true,  accentColor: "var(--amber, #E6A760)",   borderColor: "rgba(230,167,96,0.3)" },
  max:      { icon: RocketIcon,  featured: false, accentColor: "var(--amber-2, #F2C08A)", borderColor: "rgba(242,192,138,0.2)" },
};

export function PlanCards({ copy }: PlanCardsProps) {
  const [mobileActivePlan, setMobileActivePlan] = useState<string>("free");
  const planRefs: MutableRefObject<Record<string, HTMLElement | null>> = useRef({});
  const activePlanRef = useRef<string | null>(mobileActivePlan);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let raf = 0;
    const updateMobileActivePlan = () => {
      if (window.innerWidth > 640) return;
      const centerY = window.innerHeight / 2;
      let closestId: string | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (const [planId, el] of Object.entries(planRefs.current)) {
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const distance = Math.abs(cardCenter - centerY);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestId = planId;
        }
      }

      if (closestId && closestId !== activePlanRef.current) {
        activePlanRef.current = closestId;
        setMobileActivePlan(closestId);
      }
    };

    const onScrollOrResize = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        updateMobileActivePlan();
      });
    };

    updateMobileActivePlan();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  return (
    <section
      id="plans"
      className="relative scroll-mt-20"
      style={{ borderTop: "1px solid var(--hair)", padding: "120px 0", zIndex: 2 }}
    >
      <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 32px" }}>
        {/* Header */}
        <div
          className="flex flex-col gap-6 lg:flex-row lg:items-start"
          style={{ marginBottom: 56 }}
        >
          <div style={{ maxWidth: 720 }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10.5px",
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 14,
              }}
            >
              {copy.plansSectionLabel}
            </div>
            <div className="flex w-full items-center gap-4">
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 400,
                  fontSize: "clamp(36px, 5vw, 64px)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.02em",
                  color: "var(--cream)",
                  margin: 0,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {copy.plansTitle}
              </h2>
              <div className="ml-auto lg:ml-0 shrink-0">
                <Image
                  src="/brand/mascot/aurora_present.png"
                  alt={copy.plansMascotAlt}
                  width={200}
                  height={200}
                  style={{ width: 100, height: "auto", objectFit: "contain" }}
                />
              </div>
            </div>
            <p style={{ marginTop: 14, fontFamily: "var(--font-sans)", fontSize: 16, color: "var(--cream-3, #B5AB99)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--cream)", fontWeight: 500 }}>{copy.plansDescriptionStrong}</strong>
              {" — "}
              {copy.plansDescriptionRest}
            </p>
          </div>
        </div>

        {/* Plan grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
          }}
        >
          {copy.plans.map((plan, idx) => {
            const [priceRow, ...restRows] = plan.rows;
            const config = PLAN_CONFIG[plan.id] ?? PLAN_CONFIG.free!;
            const Icon = config.icon;
            const isLast = idx === copy.plans.length - 1;
            return (
              <article
                key={plan.id}
                className="plan-card"
                tabIndex={0}
                aria-labelledby={`plan-${plan.id}`}
                data-mobile-active={mobileActivePlan === plan.id ? "true" : "false"}
                ref={(el) => {
                  planRefs.current[plan.id] = el;
                }}
                style={{
                  padding: "40px 32px",
                  background: config.featured
                    ? `linear-gradient(180deg, rgba(245,199,107,0.16) 0%, rgba(240,179,75,0.08) 35%, var(--ink) 100%)`
                    : "var(--ink)",
                  border: "1px solid var(--hair)",
                  borderRadius: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  position: "relative",
                  outline: "none",
                  boxShadow: "0 18px 48px -32px rgba(0,0,0,0.65)",
                }}
              >
                {/* Featured inset ring */}
                {config.featured && (
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      borderRadius: 18,
                      boxShadow: "inset 0 0 0 1px rgba(245,199,107,0.35)",
                    }}
                  />
                )}

                {/* Plan name + icon */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        width: 28,
                        height: 28,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 8,
                        border: `1px solid ${config.borderColor}`,
                        background: `${config.accentColor}15`,
                        color: config.accentColor,
                        flexShrink: 0,
                      }}
                    >
                      <Icon />
                    </span>
                    <h3
                      id={`plan-${plan.id}`}
                      style={{
                        fontFamily: "var(--font-display)",
                        fontStyle: "italic",
                        fontSize: 22,
                        fontWeight: 400,
                        color: "var(--cream)",
                        margin: 0,
                      }}
                    >
                      {plan.name}
                    </h3>
                  </div>
                  {config.featured && (
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "9px",
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "var(--amber, #E6A760)",
                        padding: "4px 9px",
                        border: "1px solid rgba(245,199,107,0.45)",
                        background: "rgba(245,199,107,0.12)",
                        borderRadius: 999,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {copy.popularBadge}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: 48,
                      fontWeight: 400,
                      color: "var(--cream)",
                      lineHeight: 1,
                      display: "flex",
                      alignItems: "baseline",
                      gap: 6,
                    }}
                  >
                    {priceRow?.value}
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--cream-4, #6E6758)", letterSpacing: "0.02em" }}>
                      {copy.plansPerEventSuffix}
                    </span>
                  </div>
                  <p style={{ marginTop: 8, fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--cream-4, #6E6758)", lineHeight: 1.4 }}>
                    {plan.tailoredFor}
                  </p>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: config.featured ? "rgba(230,167,96,0.15)" : "var(--hair)" }} />

                {/* Feature rows — expand on hover */}
                <div className="plan-card-extras">
                  <div className="plan-card-extras-inner">
                    <dl style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {restRows.map((row) => (
                        <div key={row.label} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5 }}>
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.5}
                            strokeLinecap="round"
                            style={{ color: config.accentColor, flexShrink: 0, marginTop: 3 }}
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                          <dt style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--cream-4, #6E6758)", letterSpacing: "0.06em", flexShrink: 0, marginTop: 1 }}>
                            {row.label}
                          </dt>
                          <dd style={{ fontFamily: "var(--font-sans)", color: "var(--cream-3, #B5AB99)", marginLeft: "auto", textAlign: "right" }}>
                            {row.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <p
          style={{
            marginTop: 16,
            borderRadius: 12,
            border: "1px solid var(--hair)",
            background: "var(--glass-bg)",
            padding: "12px 16px",
            fontFamily: "var(--font-sans)",
            fontSize: 12.5,
            fontStyle: "italic",
            color: "var(--cream-4, #6E6758)",
            lineHeight: 1.6,
          }}
        >
          {copy.planFootnote}
        </p>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          #plans > div > div:nth-child(2) { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          #plans > div > div:nth-child(2) { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
