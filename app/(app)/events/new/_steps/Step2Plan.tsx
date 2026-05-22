"use client";

import type { PlanId } from "@/lib/plan-limits";
import { getPlanLimits, PLAN_DB_INT_MAX } from "@/lib/plan-limits";
import { interpolate } from "@/lib/app-ui";
import { useAppUi } from "@/components/AppUiProvider";
import { writeCreateEventDraftToStorage } from "@/lib/create-event-draft";
import { useMemo, useState } from "react";

// ── Palette ───────────────────────────────────────────────────────────────────
const INK    = '#221509';
const INK_S  = '#5A4A36';
const MUTED  = '#9A8570';
const GOLD   = '#C5922A';
const GOLD_DK = '#A37118';
const PURPLE = '#5B2D8E';
const BORDER = '#DDD4C5';
const RUST   = '#B5461B';
const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";
const GOLD_FOIL = 'linear-gradient(135deg,#E6BF66 0%,#C5922A 45%,#F4D88F 70%,#946C18 100%)';

const PLAN_ACCENT: Record<PlanId, string> = {
  free:     '#9A8570',
  standard: '#2D7AAE',
  plus:     '#B87333',
  premium:  '#C5922A',
  max:      '#5B2D8E',
};

const PLAN_STRIPE: Record<PlanId, string> = {
  free:     `linear-gradient(90deg,${MUTED}60,${MUTED}20)`,
  standard: 'linear-gradient(90deg,#4A8CB8,#2D6A9640)',
  plus:     'linear-gradient(90deg,#D4956B,#B8733340)',
  premium:  GOLD_FOIL,
  max:      'linear-gradient(90deg,#8B5FCC,#5B2D8E40)',
};

// NOTE: prices are business-facing; adjust to match mobile pricing.
const PLAN_PRICE: Record<PlanId, string> = {
  free: "0€", standard: "15€", plus: "35€", premium: "65€", max: "90€",
};

const PLAN_ORIGINAL_PRICE: Partial<Record<PlanId, string>> = {
  premium: "70€", max: "100€",
};

type Step2PlanProps = {
  name: string;
  emoji: string;
  date: string;
  selectedPlanId: PlanId;
  planOptions: readonly PlanId[];
  validationError: "NAME_REQUIRED" | null;
};

export function Step2Plan({ name, emoji, date, selectedPlanId, planOptions, validationError }: Step2PlanProps) {
  const ui = useAppUi();
  const [selected, setSelected] = useState<PlanId>(selectedPlanId);
  const [expanded, setExpanded] = useState<PlanId | null>(null);

  function formatCap(n: number): string {
    return n >= PLAN_DB_INT_MAX ? ui.createStep2.unlimited : String(n);
  }

  const writeStep2Draft = (planId: PlanId) => {
    writeCreateEventDraftToStorage({ step: "2", name, emoji, date, planId });
  };

  const toggleExpanded = (planId: PlanId) => {
    setExpanded(current => current === planId ? null : planId);
  };

  const cards = useMemo(
    () => planOptions.map(planId => ({
      planId,
      limits: getPlanLimits(planId),
      price: PLAN_PRICE[planId],
      originalPrice: PLAN_ORIGINAL_PRICE[planId],
      accent: PLAN_ACCENT[planId],
      stripe: PLAN_STRIPE[planId],
    })),
    [planOptions, ui.createStep2.unlimited],
  );

  return (
    <div className="welcome-reveal welcome-reveal--d1">
      {/* Heading */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 18, height: 2, background: GOLD, borderRadius: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: GOLD_DK, fontFamily: FB }}>
            {ui.createStep2.eyebrow}
          </span>
        </div>
        <h2 style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 26, color: INK, lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>
          {ui.createStep2.heading}
        </h2>
        <p style={{ fontFamily: FS, fontStyle: 'italic', fontSize: 14, color: INK_S, lineHeight: 1.5, marginTop: 6, marginBottom: 0 }}>
          {ui.createStep2.description}
        </p>
      </div>

      <form action="/events/new" method="get">
        <input type="hidden" name="name" value={name} />
        <input type="hidden" name="emoji" value={emoji} />
        <input type="hidden" name="date" value={date} />
        <input type="hidden" name="planId" value={selected} />

        {validationError && (
          <p role="alert" style={{ marginBottom: 16, fontSize: 13, color: RUST, background: `${RUST}15`, padding: '10px 14px', borderRadius: 10, border: `1px solid ${RUST}40`, fontFamily: FB }}>
            {ui.validateCreate.nameRequired}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {cards.map(({ planId, limits, price, originalPrice, accent, stripe }) => {
            const on = selected === planId;
            const isExpanded = expanded === planId;
            const detailsId = `plan-details-${planId}`;

            return (
              <button
                key={planId}
                type="button"
                onClick={() => { setSelected(planId); writeStep2Draft(planId); }}
                style={{
                  textAlign: 'left', cursor: 'pointer',
                  background: on ? 'rgba(244,240,234,0.95)' : 'rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  border: on ? `2px solid ${accent}` : `1px solid ${BORDER}`,
                  borderRadius: 14,
                  padding: '14px 14px 14px 14px',
                  boxShadow: on ? `0 6px 20px -4px ${accent}30, inset 0 1px 0 rgba(255,255,255,0.7)` : '0 2px 8px -2px rgba(40,25,15,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
                  transform: on ? 'translateY(-1px)' : 'translateY(0)',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* Top accent stripe */}
                <div aria-hidden style={{ position: 'absolute', inset: '0 0 auto 0', height: 3, background: stripe }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginTop: 4 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 19, color: INK, letterSpacing: '-0.01em', lineHeight: 1 }}>
                        {ui.plans[planId]}
                      </h3>
                      {planId === 'premium' && (
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: accent, background: `${accent}18`, border: `1px solid ${accent}40`, borderRadius: 4, padding: '2px 6px', fontFamily: FB }}>
                          {ui.createStep2.popularBadge}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '5px 0 0', fontSize: 12.5, color: INK_S, lineHeight: 1.4, fontFamily: FB }}>
                      {interpolate(ui.createStep2.guestsPhotosVideos, {
                        guests: formatCap(limits.guests),
                        photos: formatCap(limits.photos),
                        videos: formatCap(limits.videos),
                      })}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: 11.5, color: MUTED, fontFamily: FB }}>
                      {interpolate(ui.createStep2.uploadsOpenAfterDays, { n: limits.uploadDaysAfterEvent })}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, fontFamily: FB }}>
                      {ui.createStep2.priceEyebrow}
                    </div>
                    <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: 1.05 }}>
                        {originalPrice && (
                          <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textDecoration: 'line-through', textDecorationThickness: '1.5px', opacity: 0.85, fontFamily: FB }}>
                            {originalPrice}
                          </div>
                        )}
                        <div style={{ fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 18, color: accent, marginTop: originalPrice ? 1 : 0, lineHeight: 1 }}>
                          {price}
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label={interpolate(ui.createStep2.moreDetailsAria, { plan: ui.plans[planId] })}
                        aria-expanded={isExpanded}
                        aria-controls={detailsId}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleExpanded(planId); }}
                        style={{ width: 26, height: 26, borderRadius: '50%', border: `1.5px solid ${BORDER}`, background: 'rgba(255,255,255,0.6)', color: INK_S, display: 'grid', placeItems: 'center', cursor: 'pointer', fontFamily: FB, fontSize: 12, fontWeight: 700, flexShrink: 0 }}
                      >
                        ?
                      </button>
                    </div>
                    {/* Radio dot */}
                    <div aria-hidden style={{ marginTop: 8, width: 14, height: 14, borderRadius: '50%', border: on ? `5px solid ${accent}` : `2px solid ${BORDER}`, boxShadow: on ? `0 0 0 3px ${accent}22` : 'none', marginLeft: 'auto' }} />
                  </div>
                </div>

                {/* Expandable detail rows */}
                <div
                  id={detailsId}
                  role="region"
                  aria-label={interpolate(ui.createStep2.detailRegionAria, { plan: ui.plans[planId] })}
                  style={{ overflow: 'hidden', maxHeight: isExpanded ? 240 : 0, opacity: isExpanded ? 1 : 0, transition: 'max-height 0.22s ease, opacity 0.18s ease' }}
                >
                  <div style={{ borderTop: `1px dashed ${BORDER}`, marginTop: 12, paddingTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {(
                      [
                        { label: ui.createStep2.rowGuests, value: formatCap(limits.guests) },
                        { label: ui.createStep2.rowPhotos, value: formatCap(limits.photos) },
                        { label: ui.createStep2.rowVideos, value: formatCap(limits.videos) },
                        { label: ui.createStep2.rowUploadWindow, value: interpolate(ui.createStep2.uploadWindowDays, { n: limits.uploadDaysAfterEvent }) },
                      ] as const
                    ).map(row => (
                      <div key={row.label} style={{ background: 'rgba(255,255,255,0.6)', border: `1px solid ${BORDER}`, borderRadius: 10, padding: '10px 12px' }}>
                        <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUTED, fontFamily: FB }}>{row.label}</div>
                        <div style={{ marginTop: 5, fontFamily: FS, fontStyle: 'italic', fontWeight: 700, fontSize: 16, color: accent, lineHeight: 1 }}>{row.value}</div>
                      </div>
                    ))}
                  </div>
                  <p style={{ margin: '10px 0 0', fontSize: 12, color: MUTED, lineHeight: 1.5, fontFamily: FB }}>
                    {ui.createStep2.tipChangePlanLater}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="submit"
            formAction="/events/new"
            formMethod="get"
            name="step"
            value="1"
            style={{ background: 'transparent', color: PURPLE, border: `1px solid ${PURPLE}55`, borderRadius: 11, padding: '13px 18px', fontFamily: FB, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            {ui.common.back}
          </button>
          <button
            type="submit"
            name="step"
            value="3"
            onClick={(event) => {
              const form = event.currentTarget.form;
              if (!form) return;
              const planInput = form.elements.namedItem("planId");
              const current = planInput instanceof HTMLInputElement ? (planInput.value as PlanId) : selected;
              writeStep2Draft(current);
            }}
            style={{ flex: 1, background: `linear-gradient(135deg,#7B3FBE,${PURPLE})`, color: '#fff', border: 'none', borderRadius: 11, padding: '13px 18px', fontFamily: FB, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(91,45,142,0.32)' }}
          >
            {ui.createStep2.continuePayment}
          </button>
        </div>
      </form>
    </div>
  );
}
