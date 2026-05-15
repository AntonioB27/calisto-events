"use client";

import type { PlanId } from "@/lib/plan-limits";
import { getPlanLimits, PLAN_DB_INT_MAX } from "@/lib/plan-limits";
import { interpolate } from "@/lib/app-ui";
import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { AppPageHeader } from "@/components/app-ui/AppPageHeader";
import { writeCreateEventDraftToStorage } from "@/lib/create-event-draft";
import { useMemo, useState } from "react";

type Step2PlanProps = {
  name: string;
  emoji: string;
  date: string;
  selectedPlanId: PlanId;
  planOptions: readonly PlanId[];
  validationError: "NAME_REQUIRED" | null;
};

// NOTE: prices are business-facing; adjust to match mobile pricing.
const PLAN_PRICE: Record<PlanId, string> = {
  free: "0€",
  standard: "15€",
  plus: "35€",
  premium: "65€",
  max: "90€",
};

const PLAN_ORIGINAL_PRICE: Partial<Record<PlanId, string>> = {
  premium: "70€",
  max: "100€",
};

const PLAN_STYLE: Record<PlanId, { accent: string; tint: string }> = {
  free: { accent: "rgba(140, 120, 95, 0.9)", tint: "rgba(140, 120, 95, 0.10)" },
  standard: { accent: "color-mix(in srgb, var(--app-purple) 78%, #2b6cb0)", tint: "color-mix(in srgb, var(--app-purple) 10%, transparent)" },
  plus: { accent: "color-mix(in srgb, var(--app-gold) 78%, var(--app-purple))", tint: "color-mix(in srgb, var(--app-gold) 12%, transparent)" },
  premium: { accent: "var(--app-gold)", tint: "color-mix(in srgb, var(--app-gold) 14%, transparent)" },
  max: { accent: "color-mix(in srgb, var(--app-purple) 55%, var(--app-gold))", tint: "color-mix(in srgb, var(--app-purple) 10%, transparent)" },
};

export function Step2Plan({ name, emoji, date, selectedPlanId, planOptions, validationError }: Step2PlanProps) {
  const ui = useAppUi();
  const [selected, setSelected] = useState<PlanId>(selectedPlanId);
  const [expanded, setExpanded] = useState<PlanId | null>(null);

  function formatCap(n: number): string {
    return n >= PLAN_DB_INT_MAX ? ui.createStep2.unlimited : String(n);
  }

  const writeStep2Draft = (planId: PlanId) => {
    writeCreateEventDraftToStorage({
      step: "2",
      name,
      emoji,
      date,
      planId,
    });
  };

  const toggleExpanded = (planId: PlanId) => {
    setExpanded((current) => (current === planId ? null : planId));
  };

  const cards = useMemo(
    () =>
      planOptions.map((planId) => {
        const limits = getPlanLimits(planId);
        return {
          planId,
          limits,
          price: PLAN_PRICE[planId],
          originalPrice: PLAN_ORIGINAL_PRICE[planId],
          style: PLAN_STYLE[planId],
        };
      }),
    [planOptions, ui.createStep2.unlimited],
  );

  return (
    <div className="welcome-reveal welcome-reveal--d1">
      <AppPageHeader eyebrow={ui.createStep2.eyebrow} title={ui.createStep2.heading} description={ui.createStep2.description} />

      <form action="/events/new" method="get">
        <input type="hidden" name="name" value={name} />
        <input type="hidden" name="emoji" value={emoji} />
        <input type="hidden" name="date" value={date} />
        <input type="hidden" name="planId" value={selected} />

        {validationError ? (
          <p
            role="alert"
            style={{
              marginBottom: 16,
              fontSize: 13,
              color: "var(--app-danger)",
              background: "color-mix(in srgb, var(--app-danger) 10%, transparent)",
              padding: "10px 14px",
              borderRadius: "var(--app-radius-md)",
              border: "1px solid color-mix(in srgb, var(--app-danger) 35%, transparent)",
            }}
          >
            {ui.validateCreate.nameRequired}
          </p>
        ) : null}

        <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
          {cards.map(({ planId, limits, price, originalPrice, style }) => {
            const on = selected === planId;
            const border = on ? `1.5px solid ${style.accent}` : "1.5px solid var(--app-border)";
            const bg = on ? style.tint : "var(--app-surface)";
            const isExpanded = expanded === planId;
            const detailsId = `plan-details-${planId}`;

            return (
              <button
                key={planId}
                type="button"
                onClick={() => {
                  setSelected(planId);
                  writeStep2Draft(planId);
                }}
                className="app-card app-card--pad-lg"
                style={{
                  textAlign: "left",
                  border,
                  background: bg,
                  boxShadow: on ? "var(--app-shadow-md)" : "var(--app-shadow-sm)",
                  transform: on ? "translateY(-1px)" : "translateY(0px)",
                  transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: "0 0 auto 0",
                    height: 3,
                    background: `linear-gradient(90deg, ${style.accent}, color-mix(in srgb, ${style.accent} 35%, transparent))`,
                  }}
                />

                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 18,
                          fontWeight: 800,
                          color: "var(--app-text)",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {ui.plans[planId]}
                      </h3>
                      {planId === "premium" ? (
                        <span
                          className="app-badge app-badge--accent"
                          style={{ borderColor: style.accent, color: style.accent }}
                        >
                          {ui.createStep2.popularBadge}
                        </span>
                      ) : null}
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--app-muted)", lineHeight: 1.45 }}>
                      {interpolate(ui.createStep2.guestsPhotosVideos, {
                        guests: formatCap(limits.guests),
                        photos: formatCap(limits.photos),
                        videos: formatCap(limits.videos),
                      })}
                    </p>
                    <p style={{ margin: "8px 0 0", fontSize: 12, color: "var(--app-subtle)" }}>
                      {interpolate(ui.createStep2.uploadsOpenAfterDays, { n: limits.uploadDaysAfterEvent })}
                    </p>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--app-subtle)" }}>
                      {ui.createStep2.priceEyebrow}
                    </div>
                    <div style={{ marginTop: 6, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", lineHeight: 1.05 }}>
                        {originalPrice ? (
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: "var(--app-subtle)",
                              textDecoration: "line-through",
                              textDecorationThickness: "1.5px",
                              opacity: 0.85,
                            }}
                          >
                            {originalPrice}
                          </div>
                        ) : null}
                        <div style={{ marginTop: originalPrice ? 3 : 0, fontSize: 16, fontWeight: 800, color: style.accent }}>
                          {price}
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label={interpolate(ui.createStep2.moreDetailsAria, { plan: ui.plans[planId] })}
                        aria-expanded={isExpanded}
                        aria-controls={detailsId}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleExpanded(planId);
                        }}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 999,
                          border: "1.5px solid color-mix(in srgb, var(--app-border) 90%, transparent)",
                          background: "color-mix(in srgb, var(--app-surface) 70%, transparent)",
                          color: "var(--app-text)",
                          display: "grid",
                          placeItems: "center",
                          cursor: "pointer",
                          boxShadow: "var(--app-shadow-sm)",
                        }}
                      >
                        ?
                      </button>
                    </div>
                    <div
                      aria-hidden
                      style={{
                        marginTop: 10,
                        width: 14,
                        height: 14,
                        borderRadius: 999,
                        border: on ? `6px solid ${style.accent}` : "6px solid color-mix(in srgb, var(--app-border) 90%, transparent)",
                        boxShadow: on ? `0 0 0 4px color-mix(in srgb, ${style.accent} 18%, transparent)` : "none",
                        marginLeft: "auto",
                      }}
                    />
                  </div>
                </div>

                <div
                  id={detailsId}
                  role="region"
                  aria-label={interpolate(ui.createStep2.detailRegionAria, { plan: ui.plans[planId] })}
                  style={{
                    marginTop: 14,
                    borderTop: "1px solid color-mix(in srgb, var(--app-border) 80%, transparent)",
                    paddingTop: 12,
                    display: "grid",
                    gap: 10,
                    maxHeight: isExpanded ? 220 : 0,
                    opacity: isExpanded ? 1 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.22s ease, opacity 0.18s ease",
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                    {(
                      [
                        { label: ui.createStep2.rowGuests, value: formatCap(limits.guests) },
                        { label: ui.createStep2.rowPhotos, value: formatCap(limits.photos) },
                        { label: ui.createStep2.rowVideos, value: formatCap(limits.videos) },
                        {
                          label: ui.createStep2.rowUploadWindow,
                          value: interpolate(ui.createStep2.uploadWindowDays, { n: limits.uploadDaysAfterEvent }),
                        },
                      ] as const
                    ).map((row) => (
                      <div
                        key={row.label}
                        style={{
                          background: "color-mix(in srgb, var(--app-surface-2) 70%, transparent)",
                          border: "1.5px solid color-mix(in srgb, var(--app-border) 80%, transparent)",
                          borderRadius: 12,
                          padding: 12,
                        }}
                      >
                        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--app-subtle)" }}>
                          {row.label}
                        </div>
                        <div style={{ marginTop: 6, fontSize: 16, fontWeight: 800, color: "var(--app-text)" }}>
                          {row.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p style={{ margin: 0, fontSize: 12, color: "var(--app-muted)", lineHeight: 1.5 }}>
                    {ui.createStep2.tipChangePlanLater}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <AppBtn type="submit" variant="ghost" formAction="/events/new" formMethod="get" name="step" value="1">
            {ui.common.back}
          </AppBtn>
          <AppBtn
            type="submit"
            variant="primary"
            name="step"
            value="3"
            style={{ flex: 1 }}
            onClick={(event) => {
              const form = event.currentTarget.form;
              if (!form) return;
              const planInput = form.elements.namedItem("planId");
              const current = planInput instanceof HTMLInputElement ? (planInput.value as PlanId) : selected;
              writeStep2Draft(current);
            }}
          >
            {ui.createStep2.continuePayment}
          </AppBtn>
        </div>
      </form>
    </div>
  );
}
