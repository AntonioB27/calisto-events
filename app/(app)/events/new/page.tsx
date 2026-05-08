import type { PlanId } from "@/lib/plan-limits";

import { MascotSpot } from "@/components/MascotSpot";
import { ResumeDraftClient } from "./ResumeDraftClient";
import { Step1Details } from "./_steps/Step1Details";
import { Step2Plan } from "./_steps/Step2Plan";
import { Step3Payment } from "./_steps/Step3Payment";

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

const DEFAULT_DATE = "2026-01-01";
const DEFAULT_PLAN: PlanId = "free";
export const PLAN_OPTIONS = ["free", "standard", "plus", "premium", "max"] as const;
const PLAN_OPTION_SET = new Set<string>(PLAN_OPTIONS);

export function validateCreateEventInput(input: CreateEventInput): CreateEventValidationResult {
  const normalizedName = (input.name ?? "").trim();
  if (!normalizedName) {
    return {
      ok: false,
      error: "NAME_REQUIRED",
    };
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
  if (Array.isArray(value)) {
    return value[0];
  }
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
} {
  const step = pickQueryValue(params.step) ?? "1";
  const name = pickQueryValue(params.name) ?? "";
  const emoji = pickQueryValue(params.emoji) ?? "";
  const date = pickQueryValue(params.date) ?? DEFAULT_DATE;
  const planIdCandidate = pickQueryValue(params.planId);
  const planId = isPlanId(planIdCandidate) ? planIdCandidate : DEFAULT_PLAN;

  return {
    step,
    name,
    emoji,
    date,
    planId,
  };
}

export default async function NewEventPage({ searchParams }: NewEventPageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const { step, name, emoji, date, planId } = parseCreateEventQuery(resolvedParams);

  const validation = validateCreateEventInput({
    name,
    date,
    planId,
  });

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 0 60px' }}>
      <ResumeDraftClient />
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
        <MascotSpot src="/brand/mascot/aurora_planning.png" size={132} variant="stack" />
      </div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: 36,
          color: "var(--app-text)",
          lineHeight: 1.1,
          margin: 0,
        }}
      >
        Create event
      </h1>
      <p style={{ marginTop: 10, fontSize: 13, color: "var(--app-muted)" }}>Step {step} of 3</p>

      {step === "1" && <Step1Details defaultName={name} defaultEmoji={emoji} defaultDate={date} />}
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
          validationError={validation.ok ? null : validation.error}
        />
      )}
    </div>
  );
}
