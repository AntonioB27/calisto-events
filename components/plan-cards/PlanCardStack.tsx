"use client";

import type React from "react";
import type { LandingCopy } from "@/lib/i18n";

export type PlanCardStackProps = {
  plans: LandingCopy["plans"];
  onChoose: (e: React.MouseEvent, planId: string) => void;
  copy: Pick<LandingCopy, "plansFormChooseBtn" | "plansPerEventSuffix" | "planFootnote" | "popularBadge">;
};

const ORIGINAL_PRICE: Record<string, string> = { premium: "70€", max: "100€" };
const FEATURED_PLAN_ID = "premium";

export function PlanCardStack({ plans, onChoose, copy }: PlanCardStackProps) {
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {plans.map((plan) => {
          const featured = plan.id === FEATURED_PLAN_ID;
          const [priceRow, ...featureRows] = plan.rows;
          const originalPrice = ORIGINAL_PRICE[plan.id];
          return (
            <div
              key={plan.id}
              style={{
                borderRadius: 18,
                border: featured ? "1px solid rgba(245,199,107,0.45)" : "1px solid var(--hair-2)",
                background: featured
                  ? "linear-gradient(180deg, rgba(245,199,107,0.1), var(--panel-b))"
                  : "linear-gradient(180deg, var(--panel-a), var(--panel-b))",
                padding: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 22, color: featured ? "var(--gold)" : "var(--cream)" }}>
                      {plan.name}
                    </span>
                    {featured && (
                      <span
                        style={{
                          fontSize: 8.5, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
                          color: "var(--gold)", background: "rgba(245,199,107,0.12)", border: "1px solid rgba(245,199,107,0.35)",
                          borderRadius: 4, padding: "2px 6px", fontFamily: "var(--font-sans)",
                        }}
                      >
                        {copy.popularBadge}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 14, color: "var(--cream-3)", marginTop: 4, fontFamily: "var(--font-sans)" }}>
                    {originalPrice && (
                      <span style={{ textDecoration: "line-through", color: "var(--cream-4)", marginRight: 6 }}>
                        {originalPrice}
                      </span>
                    )}
                    {priceRow?.value} {plan.id !== "free" && copy.plansPerEventSuffix}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => onChoose(e, plan.id)}
                  style={{
                    flexShrink: 0, fontSize: 13.5, fontWeight: 500, padding: "9px 16px", borderRadius: 999, cursor: "pointer",
                    whiteSpace: "nowrap", fontFamily: "var(--font-sans)",
                    background: featured
                      ? "linear-gradient(135deg, var(--gold) 0%, var(--amber) 45%, var(--gold-deep) 100%)"
                      : "transparent",
                    border: featured ? "1px solid transparent" : "1px solid var(--hair-strong)",
                    color: featured ? "#1b1208" : "var(--cream)",
                  }}
                >
                  {copy.plansFormChooseBtn}
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px 16px", marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--glass-bg-2)" }}>
                {featureRows.map((row) => (
                  <div key={row.label}>
                    <div style={{ fontSize: 11.5, color: "var(--cream-4)", fontFamily: "var(--font-sans)" }}>{row.label}</div>
                    <div style={{ fontSize: 14, color: "var(--cream-2)", fontWeight: 500, fontFamily: "var(--font-sans)" }}>{row.value}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p style={{ marginTop: 16, fontSize: 13, color: "var(--cream-4)", fontFamily: "var(--font-sans)" }}>
        {copy.planFootnote}
      </p>
    </>
  );
}
