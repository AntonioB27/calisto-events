import type { PlanId } from "@/lib/plan-limits";

import { ResumeDraftClient } from "./ResumeDraftClient";
import { Step1Details } from "./_steps/Step1Details";
import { Step2Plan } from "./_steps/Step2Plan";
import { Step3Payment } from "./_steps/Step3Payment";
import "./create-event.css";

type CreateEventInput = Readonly<{
  name?: string;
  date?: string;
  planId?: PlanId;
}>;

type CreateEventValidationResult =
  | Readonly<{
      ok: true;
      value: {
        name: string;
        date: string;
        planId: PlanId;
      };
    }>
  | Readonly<{
      ok: false;
      error: "NAME_REQUIRED";
    }>;

const DEFAULT_DATE = new Date().toISOString().split("T")[0];
const DEFAULT_PLAN: PlanId = "free";
export const PLAN_OPTIONS = ["free", "standard", "plus", "premium", "max"] as const;
const PLAN_OPTION_SET = new Set<string>(PLAN_OPTIONS);

export function validateCreateEventInput(input: CreateEventInput): CreateEventValidationResult {
  const normalizedName = (input.name ?? "").trim();
  if (!normalizedName) {
    return { ok: false, error: "NAME_REQUIRED" };
  }
  return {
    ok: true,
    value: {
      name: normalizedName,
      date: input.date ?? DEFAULT_DATE,
      planId: input.planId ?? DEFAULT_PLAN,
    },
  };
}

type NewEventPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function pickQueryValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function isPlanId(value: string | undefined): value is PlanId {
  return typeof value === "string" && PLAN_OPTION_SET.has(value);
}

type CreateEventQueryParams = Record<string, string | string[] | undefined>;

export function parseCreateEventQuery(params: CreateEventQueryParams): {
  step: string;
  name: string;
  emoji: string;
  date: string;
  planId: PlanId;
  moderationEnabled: boolean;
} {
  const step = pickQueryValue(params.step) ?? "1";
  const name = pickQueryValue(params.name) ?? "";
  const emoji = pickQueryValue(params.emoji) ?? "";
  const date = pickQueryValue(params.date) ?? DEFAULT_DATE;
  const planIdCandidate = pickQueryValue(params.planId);
  const planId = isPlanId(planIdCandidate) ? planIdCandidate : DEFAULT_PLAN;
  const moderationEnabled = pickQueryValue(params.moderationEnabled) === "true";
  return { step, name, emoji, date, planId, moderationEnabled };
}

export default async function NewEventPage({ searchParams }: NewEventPageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const { step, name, emoji, date, planId, moderationEnabled } = parseCreateEventQuery(resolvedParams);

  const validation = validateCreateEventInput({ name, date, planId });
  const cur = Number(step);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "18px 16px 64px" }}>
      <ResumeDraftClient />

      {/* Decorative: each step's heading says where you are */}
      <div className="create-progress" aria-hidden>
        {[1, 2, 3].map((n) => <span key={n} data-on={n <= cur ? "" : undefined} />)}
      </div>

      {step === "1" && (
        <Step1Details
          defaultName={name}
          defaultEmoji={emoji}
          defaultDate={date}
          defaultModerationEnabled={moderationEnabled}
        />
      )}
      {step === "2" && (
        <Step2Plan
          name={name}
          emoji={emoji}
          date={date}
          selectedPlanId={planId}
          planOptions={PLAN_OPTIONS}
          validationError={validation.ok ? null : validation.error}
        />
      )}
      {step === "3" && (
        <Step3Payment
          name={name}
          emoji={emoji}
          date={date}
          planId={planId}
          moderationEnabled={moderationEnabled}
          validationError={validation.ok ? null : validation.error}
        />
      )}
    </div>
  );
}
