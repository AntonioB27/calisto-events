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

// ── Palette (matches DashboardClient) ────────────────────────────────────────
const MUTED   = '#9A8570';
const GOLD    = '#C5922A';
const GOLD_DK = '#A37118';
const BORDER  = '#DDD4C5';
const INK_S   = '#5A4A36';
const FB = "'DM Sans', sans-serif";
const FS = "'DM Serif Display', serif";

const STEP_LABELS = ['Details', 'Plan', 'Review'] as const;

export default async function NewEventPage({ searchParams }: NewEventPageProps) {
  const resolvedParams = (await searchParams) ?? {};
  const { step, name, emoji, date, planId, moderationEnabled } = parseCreateEventQuery(resolvedParams);

  const validation = validateCreateEventInput({ name, date, planId });
  const cur = Number(step);

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "18px 16px 64px" }}>
      <ResumeDraftClient />

      {/* Step progress header */}
      <div
        className="welcome-reveal"
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}
      >
        <div>
          {/* Gold eyebrow */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 18, height: 2, background: GOLD, borderRadius: 1, flexShrink: 0 }} />
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: "0.28em", textTransform: "uppercase", color: GOLD_DK, fontFamily: FB }}>
              New event
            </span>
          </div>
          {/* Step indicators */}
          <div style={{ display: "flex", alignItems: "center", marginTop: 14 }}>
            {([1, 2, 3] as const).map((n, i) => {
              const done = n < cur;
              const active = n === cur;
              return (
                <div key={n} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 44 }}>
                    <span style={{
                      fontFamily: FS, fontStyle: "italic", fontWeight: 700,
                      fontSize: active ? 22 : 14,
                      color: done ? MUTED : active ? GOLD : `${MUTED}45`,
                      lineHeight: 1,
                    }}>
                      {done ? "✓" : `0${n}`}
                    </span>
                    <span style={{
                      fontFamily: FB, fontSize: 8.5, fontWeight: 700,
                      letterSpacing: "0.18em", textTransform: "uppercase",
                      marginTop: 4,
                      color: active ? INK_S : `${MUTED}70`,
                    }}>
                      {STEP_LABELS[i]}
                    </span>
                  </div>
                  {n < 3 && (
                    <div style={{
                      width: 14, height: 1,
                      background: done ? `${GOLD}50` : BORDER,
                      flexShrink: 0, marginBottom: 14,
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <MascotSpot
          src="/brand/mascot/aurora_planning.png"
          size={144}
          variant="stack"
          className="welcome-mascot-float"
        />
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
