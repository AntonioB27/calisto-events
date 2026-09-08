"use client";

import Image from "next/image";
import type { LandingCopy } from "@/lib/i18n";
import { PlanCompareTable } from "@/components/plan-cards/PlanCompareTable";
import { PlanCardStack } from "@/components/plan-cards/PlanCardStack";

type PlanCardsProps = { copy: LandingCopy };

export function PlanCards({ copy }: PlanCardsProps) {
  function handleChoose(e: React.MouseEvent) {
    e.stopPropagation();
    document.getElementById("create")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section
      id="plans"
      className="relative scroll-mt-20"
      style={{ borderTop: "1px solid var(--hair)", padding: "40px 0", zIndex: 2 }}
    >
      <div className="mx-auto" style={{ maxWidth: 1280, padding: "0 32px" }}>
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start" style={{ marginBottom: 56 }}>
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
          </div>
        </div>

        <div className="hidden md:block">
          <PlanCompareTable
            plans={copy.plans}
            onChoose={handleChoose}
            copy={{
              plansFormChooseBtn: copy.plansFormChooseBtn,
              plansPerEventSuffix: copy.plansPerEventSuffix,
              planFootnote: copy.planFootnote,
              popularBadge: copy.popularBadge,
            }}
          />
        </div>
        <div className="md:hidden">
          <PlanCardStack
            plans={copy.plans}
            onChoose={handleChoose}
            copy={{
              plansFormChooseBtn: copy.plansFormChooseBtn,
              plansPerEventSuffix: copy.plansPerEventSuffix,
              planFootnote: copy.planFootnote,
              popularBadge: copy.popularBadge,
            }}
          />
        </div>
      </div>
    </section>
  );
}
