"use client";

import type { PlanId } from "@/lib/plan-limits";
import { getPlanLimits, PLAN_DB_INT_MAX } from "@/lib/plan-limits";
import { interpolate } from "@/lib/app-ui";
import { useAppUi } from "@/components/AppUiProvider";
import { AppBtn } from "@/components/app-ui/AppBtn";
import { TabHeader } from "@/components/app-ui/TabHeader";
import { writeCreateEventDraftToStorage } from "@/lib/create-event-draft";
import { useEffect, useState } from "react";
import { usePostHog } from "posthog-js/react";
import { ANALYTICS_EVENTS } from "@/lib/analytics-events";
import { formatEuroCents, planPriceEuroCents } from "@/lib/event-stripe-checkout";

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
  const posthog = usePostHog();

  useEffect(() => {
    posthog.capture(ANALYTICS_EVENTS.CREATE_STEP2_VIEWED);
  }, [posthog]);

  const [selected, setSelected] = useState<PlanId>(selectedPlanId);

  function formatCap(n: number): string {
    return n >= PLAN_DB_INT_MAX ? ui.createStep2.unlimited : String(n);
  }

  const writeStep2Draft = (planId: PlanId) => {
    writeCreateEventDraftToStorage({ step: "2", name, emoji, date, planId });
  };

  const cards = planOptions.map(planId => ({
    planId,
    limits: getPlanLimits(planId),
    price: formatEuroCents(planPriceEuroCents(planId)),
  }));

  const choose = (planId: PlanId) => { setSelected(planId); writeStep2Draft(planId); };

  return (
    <div className="welcome-reveal welcome-reveal--d1">
      <TabHeader title={ui.createStep2.heading} pose="present" poseSize={104}>
        {ui.createStep2.description}
      </TabHeader>

      <form action="/events/new" method="get" className="create-flow" style={{ marginTop: 6 }}>
        <input type="hidden" name="name" value={name} />
        <input type="hidden" name="emoji" value={emoji} />
        <input type="hidden" name="date" value={date} />
        <input type="hidden" name="planId" value={selected} />

        {validationError && (
          <p role="alert" className="create-error">{ui.validateCreate.nameRequired}</p>
        )}

        <div role="radiogroup" aria-label={ui.createStep2.heading} className="create-plans">
          {cards.map(({ planId, limits, price }) => (
            <button
              key={planId}
              type="button"
              role="radio"
              aria-checked={selected === planId}
              className="create-plan"
              onClick={() => choose(planId)}
            >
              <span className="create-plan__radio" aria-hidden />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="create-plan__name">{ui.plans[planId]}</span>
                {planId === "premium" && <span className="create-badge">{ui.createStep2.popularBadge}</span>}
                <span className="create-plan__line">
                  {interpolate(ui.createStep2.guestsPhotosVideos, {
                    guests: formatCap(limits.guests),
                    photos: formatCap(limits.photos),
                    videos: formatCap(limits.videos),
                  })}
                </span>
                <span className="create-plan__line" style={{ fontSize: 13, color: "var(--app-muted)" }}>
                  {interpolate(ui.createStep2.uploadsOpenAfterDays, { n: limits.uploadDaysAfterEvent })}
                </span>
              </span>
              <span className="create-plan__price">{price}</span>
            </button>
          ))}
        </div>

        <p className="create-note">{ui.createStep2.tipChangePlanLater}</p>

        <div className="create-actions">
          <AppBtn type="submit" variant="outline" size="lg" formAction="/events/new" formMethod="get" name="step" value="1">
            {ui.common.back}
          </AppBtn>
          <AppBtn
            type="submit"
            variant="gold"
            size="lg"
            name="step"
            value="3"
            style={{ flex: 1 }}
            onClick={(event) => {
              const form = event.currentTarget.form;
              if (!form) return;
              const planInput = form.elements.namedItem("planId");
              const current = planInput instanceof HTMLInputElement ? (planInput.value as PlanId) : selected;
              writeStep2Draft(current);
              posthog.capture(ANALYTICS_EVENTS.CREATE_STEP2_COMPLETED, { plan_id: current });
            }}
          >
            {ui.createStep2.continuePayment}
          </AppBtn>
        </div>
      </form>
    </div>
  );
}
