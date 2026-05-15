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
    <div className="px-4 py-10" style={{ maxWidth: 640, margin: "0 auto" }}>
      <ResumeDraftClient />

      {/* Step progress header */}
      <div
        className="welcome-reveal"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: "0.20em",
              textTransform: "uppercase",
              color: "var(--app-gold)",
            }}
          >
            New event
          </p>
          <div style={{ display: "flex", alignItems: "center", marginTop: 12 }}>
            {([1, 2, 3] as const).map((n) => {
              const cur = Number(step);
              const done = n < cur;
              const active = n === cur;
              return (
                <div key={n} style={{ display: "flex", alignItems: "center" }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                      fontWeight: 800,
                      background: active
                        ? "linear-gradient(135deg, var(--app-purple) 0%, var(--app-purple-2) 100%)"
                        : done
                        ? "color-mix(in srgb, var(--app-gold) 18%, var(--app-surface-2))"
                        : "var(--app-surface-2)",
                      border: `1.5px solid ${
                        active
                          ? "transparent"
                          : done
                          ? "color-mix(in srgb, var(--app-gold) 42%, transparent)"
                          : "var(--app-border)"
                      }`,
                      color: active ? "#fff" : done ? "var(--app-gold)" : "var(--app-subtle)",
                      boxShadow: active
                        ? "0 3px 12px color-mix(in srgb, var(--app-purple) 30%, transparent)"
                        : "none",
                      flexShrink: 0,
                    }}
                  >
                    {done ? "✓" : n}
                  </div>
                  {n < 3 && (
                    <div
                      style={{
                        width: 24,
                        height: 1.5,
                        background: done
                          ? "color-mix(in srgb, var(--app-gold) 45%, var(--app-border))"
                          : "var(--app-border)",
                        borderRadius: 1,
                        margin: "0 6px",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <MascotSpot
          src="/brand/mascot/aurora_planning.png"
          size={72}
          variant="stack"
          className="welcome-mascot-float"
        />
      </div>

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
