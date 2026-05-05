 "use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import type React from "react";
import type { LandingCopy } from "@/lib/i18n";
import Image from "next/image";

type PlanCardsProps = { copy: LandingCopy };

type PlanConfig = {
  icon: () => React.ReactElement;
  accentColor: string;
  borderColor: string;
  panelBackground: string;
  detailStripe: string;
  glow: string;
  originalPrice?: string;
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
function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
      <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
      <path d="M22 17.65l-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m2 11.91 9.17 4.17a2 2 0 0 0 1.66 0L22 11.92" />
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
  free: {
    icon: LeafIcon,
    accentColor: "#9FC58D",
    borderColor: "rgba(159,197,141,0.35)",
    panelBackground: "linear-gradient(165deg, rgba(159,197,141,0.24) 0%, rgba(159,197,141,0.08) 55%, rgba(0,0,0,0) 100%)",
    detailStripe: "linear-gradient(90deg, rgba(159,197,141,1) 0%, rgba(159,197,141,0.55) 100%)",
    glow: "rgba(159,197,141,0.28)",
  },
  standard: {
    icon: StarIcon,
    accentColor: "#86A9F9",
    borderColor: "rgba(134,169,249,0.35)",
    panelBackground: "linear-gradient(165deg, rgba(134,169,249,0.24) 0%, rgba(134,169,249,0.08) 55%, rgba(0,0,0,0) 100%)",
    detailStripe: "linear-gradient(90deg, rgba(134,169,249,1) 0%, rgba(134,169,249,0.55) 100%)",
    glow: "rgba(134,169,249,0.28)",
  },
  plus: {
    icon: LayersIcon,
    accentColor: "#B89BC4",
    borderColor: "rgba(184,155,196,0.35)",
    panelBackground: "linear-gradient(165deg, rgba(184,155,196,0.24) 0%, rgba(184,155,196,0.08) 55%, rgba(0,0,0,0) 100%)",
    detailStripe: "linear-gradient(90deg, rgba(184,155,196,1) 0%, rgba(184,155,196,0.55) 100%)",
    glow: "rgba(184,155,196,0.3)",
  },
  premium: {
    icon: DiamondIcon,
    accentColor: "#E6A760",
    borderColor: "rgba(230,167,96,0.42)",
    panelBackground: "linear-gradient(165deg, rgba(230,167,96,0.26) 0%, rgba(230,167,96,0.1) 55%, rgba(0,0,0,0) 100%)",
    detailStripe: "linear-gradient(90deg, rgba(230,167,96,1) 0%, rgba(230,167,96,0.6) 100%)",
    glow: "rgba(230,167,96,0.34)",
    originalPrice: "70€",
  },
  max: {
    icon: RocketIcon,
    accentColor: "#E97AA4",
    borderColor: "rgba(233,122,164,0.35)",
    panelBackground: "linear-gradient(165deg, rgba(233,122,164,0.24) 0%, rgba(233,122,164,0.08) 55%, rgba(0,0,0,0) 100%)",
    detailStripe: "linear-gradient(90deg, rgba(233,122,164,1) 0%, rgba(233,122,164,0.55) 100%)",
    glow: "rgba(233,122,164,0.3)",
    originalPrice: "100€",
  },
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
          <div style={{ width: "100%" }}>
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
              <div className="ml-auto shrink-0">
                <Image
                  src="/brand/mascot/aurora_present.png"
                  alt={copy.plansMascotAlt}
                  width={200}
                  height={200}
                  style={{ width: 100, height: "auto", objectFit: "contain" }}
                />
              </div>
            </div>
            <p style={{ marginTop: 14, maxWidth: 720, fontFamily: "var(--font-sans)", fontSize: 16, color: "var(--cream-3, #B5AB99)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--cream)", fontWeight: 500 }}>{copy.plansDescriptionStrong}</strong>
              {" — "}
              {copy.plansDescriptionRest}
            </p>
          </div>
        </div>

        {/* Plan stack (single column) */}
        <div
          className="plan-cards-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 22,
            maxWidth: 720,
            margin: "0 auto",
          }}
        >
          {copy.plans.map((plan, idx) => {
            const [priceRow, ...restRows] = plan.rows;
            const config = PLAN_CONFIG[plan.id] ?? PLAN_CONFIG.free!;
            const Icon = config.icon;
            return (
              <article
                key={plan.id}
                className={`plan-card plan-card-${plan.id}`}
                tabIndex={0}
                aria-labelledby={`plan-${plan.id}`}
                data-mobile-active={mobileActivePlan === plan.id ? "true" : "false"}
                ref={(el) => {
                  planRefs.current[plan.id] = el;
                }}
                style={{
                  background: "var(--ink)",
                  border: `1px solid ${config.borderColor}`,
                  borderRadius: 18,
                  overflow: "hidden",
                  position: "relative",
                  outline: "none",
                  boxShadow: `0 20px 56px -40px ${config.glow}`,
                  animation: "planCardReveal 520ms cubic-bezier(0.16, 1, 0.3, 1) both",
                  animationDelay: `${idx * 80}ms`,
                }}
              >
                <div className="plan-card-shell">
                  <div
                    className="plan-card-summary"
                    style={{
                      borderRight: `1px solid ${config.borderColor}`,
                      background: config.panelBackground,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span
                        style={{
                          display: "inline-flex",
                          width: 30,
                          height: 30,
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 9,
                          border: `1px solid ${config.borderColor}`,
                          background: `${config.accentColor}1C`,
                          color: config.accentColor,
                          flexShrink: 0,
                        }}
                      >
                        <Icon />
                      </span>
                    </div>
                    <h3
                      id={`plan-${plan.id}`}
                      style={{
                        fontFamily: "var(--font-display)",
                        fontStyle: "italic",
                        fontSize: 30,
                        fontWeight: 400,
                        color: "var(--cream)",
                        margin: "14px 0 12px",
                        lineHeight: 1.05,
                      }}
                    >
                      {plan.name}
                    </h3>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 56, color: "var(--cream)", lineHeight: 0.94 }}>
                      {config.originalPrice ? (
                        <span
                          style={{
                            display: "block",
                            fontFamily: "var(--font-sans)",
                            fontSize: 20,
                            fontWeight: 500,
                            color: "var(--cream-4, #6E6758)",
                            textDecoration: "line-through",
                            textDecorationThickness: "1.5px",
                            marginBottom: 8,
                          }}
                        >
                          {config.originalPrice}
                        </span>
                      ) : null}
                      {priceRow?.value}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "var(--cream-3, #B5AB99)",
                        marginTop: 7,
                      }}
                    >
                      {copy.plansPerEventSuffix}
                    </div>
                    <p style={{ marginTop: 14, fontFamily: "var(--font-sans)", fontSize: 13.5, color: "var(--cream-3, #B5AB99)", lineHeight: 1.45 }}>
                      {plan.tailoredFor}
                    </p>
                  </div>

                  <div className="plan-card-details">
                    <div
                      aria-hidden
                      style={{
                        height: 4,
                        borderRadius: 999,
                        background: config.detailStripe,
                        marginBottom: 10,
                      }}
                    />
                    <dl style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                      {restRows.map((row) => (
                        <div
                          key={row.label}
                          className="plan-detail-row"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "minmax(130px, auto) 1fr",
                            alignItems: "center",
                            gap: 14,
                            padding: "13px 0",
                            borderBottom: "1px dashed rgba(181,171,153,0.2)",
                            background: `linear-gradient(90deg, ${config.accentColor}10 0%, rgba(0,0,0,0) 30%)`,
                          }}
                        >
                          <dt
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 10,
                              color: "var(--cream-4, #6E6758)",
                              letterSpacing: "0.09em",
                              textTransform: "uppercase",
                            }}
                          >
                            {row.label}
                          </dt>
                          <dd
                            style={{
                              fontFamily: "var(--font-sans)",
                              color: "var(--cream)",
                              fontWeight: 600,
                              margin: 0,
                              textAlign: "right",
                              lineHeight: 1.35,
                            }}
                          >
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
        @keyframes planCardReveal {
          0% {
            opacity: 0;
            transform: translateY(14px) scale(0.985);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .plan-cards-grid {
          align-items: stretch;
        }
        .plan-card-shell {
          display: grid;
          grid-template-columns: minmax(230px, 280px) 1fr;
        }
        .plan-card-summary {
          padding: 22px 20px 20px;
        }
        .plan-card-details {
          padding: 16px 20px;
        }
        .plan-card {
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease, filter 220ms ease;
        }
        .plan-card:hover,
        .plan-card:focus-within {
          transform: translateY(-5px);
          filter: saturate(1.12);
        }
        .plan-card-free:hover,
        .plan-card-free:focus-within { box-shadow: 0 30px 74px -38px rgba(159,197,141,0.35); }
        .plan-card-standard:hover,
        .plan-card-standard:focus-within { box-shadow: 0 30px 74px -38px rgba(134,169,249,0.35); }
        .plan-card-plus:hover,
        .plan-card-plus:focus-within { box-shadow: 0 30px 74px -38px rgba(184,155,196,0.38); }
        .plan-card-premium:hover,
        .plan-card-premium:focus-within { box-shadow: 0 30px 74px -38px rgba(230,167,96,0.4); }
        .plan-card-max:hover,
        .plan-card-max:focus-within { box-shadow: 0 30px 74px -38px rgba(233,122,164,0.38); }
        .plan-card:hover .plan-card-summary,
        .plan-card:focus-within .plan-card-summary {
          filter: brightness(1.08);
        }
        .plan-card:hover .plan-card-details,
        .plan-card:focus-within .plan-card-details {
          background: rgba(0,0,0,0.08);
        }
        .plan-card:hover .plan-detail-row,
        .plan-card:focus-within .plan-detail-row {
          transform: translateX(2px);
        }
        .plan-detail-row {
          transition: transform 200ms ease, background 200ms ease;
        }
        .plan-card .plan-card-details > div[aria-hidden] {
          transition: transform 220ms ease, filter 220ms ease;
        }
        .plan-card:hover .plan-card-details > div[aria-hidden],
        .plan-card:focus-within .plan-card-details > div[aria-hidden] {
          transform: scaleX(1.02);
          filter: brightness(1.2);
        }
        .plan-card[data-mobile-active="true"] {
          transform: translateY(-3px);
          filter: saturate(1.12);
        }
        .plan-card .plan-detail-row:last-child {
          border-bottom: none !important;
        }
        @media (max-width: 780px) {
          .plan-card-shell {
            grid-template-columns: 1fr;
          }
          .plan-card-summary {
            border-right: none !important;
            border-bottom: 1px solid rgba(181,171,153,0.22);
          }
          .plan-card-details {
            padding-top: 8px;
          }
          .plan-detail-row {
            grid-template-columns: 1fr !important;
            gap: 6px !important;
            padding: 11px 0 !important;
          }
          .plan-detail-row dd {
            text-align: left !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .plan-card,
          .plan-detail-row,
          .plan-card .plan-card-details > div[aria-hidden] {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </section>
  );
}
