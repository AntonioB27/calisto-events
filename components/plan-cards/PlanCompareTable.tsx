"use client";

import type React from "react";
import type { LandingCopy } from "@/lib/i18n";

export type PlanCompareTableProps = {
  plans: LandingCopy["plans"];
  onChoose: (e: React.MouseEvent, planId: string) => void;
  copy: Pick<LandingCopy, "plansFormChooseBtn" | "plansPerEventSuffix" | "planFootnote" | "popularBadge">;
};

const ORIGINAL_PRICE: Record<string, string> = { premium: "70€", max: "100€" };
const FEATURED_PLAN_ID = "premium";

export function PlanCompareTable({ plans, onChoose, copy }: PlanCompareTableProps) {
  const featureLabels = plans[0]?.rows.slice(1).map((r) => r.label) ?? [];

  return (
    <>
      <div
        style={{
          overflowX: "auto",
          border: "1px solid var(--hair-2)",
          borderRadius: 20,
          background: "linear-gradient(180deg, var(--panel-a), var(--panel-b))",
        }}
      >
        <table style={{ width: "100%", minWidth: 640, borderCollapse: "collapse", fontSize: 15 }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left", padding: "18px 20px", fontSize: 12, fontWeight: 500,
                  letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--cream-4)",
                  fontFamily: "var(--font-mono)", borderBottom: "1px solid var(--hair-2)",
                }}
              />
              {plans.map((plan) => {
                const featured = plan.id === FEATURED_PLAN_ID;
                const [priceRow] = plan.rows;
                const originalPrice = ORIGINAL_PRICE[plan.id];
                return (
                  <th
                    key={plan.id}
                    style={{
                      textAlign: "left", padding: "18px 20px", borderBottom: "1px solid var(--hair-2)",
                      background: featured ? "rgba(245,199,107,0.08)" : "transparent",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 400, color: featured ? "var(--gold)" : "var(--cream)" }}>
                        {plan.name}
                      </div>
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
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {featureLabels.map((label, rowIdx) => (
              <tr key={label}>
                <td
                  style={{
                    padding: "14px 20px", color: "var(--cream-3)", fontSize: 14,
                    borderBottom: "1px solid var(--glass-bg-2)", whiteSpace: "nowrap", fontFamily: "var(--font-sans)",
                  }}
                >
                  {label}
                </td>
                {plans.map((plan) => {
                  const featured = plan.id === FEATURED_PLAN_ID;
                  return (
                    <td
                      key={plan.id}
                      style={{
                        padding: "14px 20px", color: "var(--cream-2)", borderBottom: "1px solid var(--glass-bg-2)",
                        background: featured ? "rgba(245,199,107,0.04)" : "transparent", fontFamily: "var(--font-sans)",
                      }}
                    >
                      {plan.rows[rowIdx + 1]?.value}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td style={{ padding: "18px 20px" }} />
              {plans.map((plan) => {
                const featured = plan.id === FEATURED_PLAN_ID;
                return (
                  <td key={plan.id} style={{ padding: "18px 20px", background: featured ? "rgba(245,199,107,0.08)" : "transparent" }}>
                    <button
                      type="button"
                      onClick={(e) => onChoose(e, plan.id)}
                      style={{
                        fontSize: 14, fontWeight: 500, padding: "10px 18px", borderRadius: 999, cursor: "pointer",
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
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <p
        style={{
          marginTop: 16, fontSize: 13, color: "var(--cream-4)", maxWidth: 640, fontFamily: "var(--font-sans)",
        }}
      >
        {copy.planFootnote}
      </p>
    </>
  );
}
