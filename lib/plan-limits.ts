/**
 * Caps and upload windows aligned with `event-media-app` / Supabase plan defaults.
 */
export type PlanId = "free" | "standard" | "plus" | "premium" | "max";

export type PlanLimits = Readonly<{
  guests: number;
  photos: number;
  videos: number;
  uploadDaysAfterEvent: number;
}>;

/** Matches Postgres int max used for unlimited-style caps in the app DB. */
export const PLAN_DB_INT_MAX = 2147483647;

const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    guests: 5,
    photos: 20,
    videos: 0,
    uploadDaysAfterEvent: 3,
  },
  standard: {
    guests: 30,
    photos: 150,
    videos: 10,
    uploadDaysAfterEvent: 7,
  },
  plus: {
    guests: 100,
    photos: 500,
    videos: 50,
    uploadDaysAfterEvent: 14,
  },
  premium: {
    guests: 250,
    photos: 2000,
    videos: 200,
    uploadDaysAfterEvent: 30,
  },
  max: {
    guests: PLAN_DB_INT_MAX,
    photos: PLAN_DB_INT_MAX,
    videos: PLAN_DB_INT_MAX,
    uploadDaysAfterEvent: 60,
  },
};

export function getPlanLimits(planId: PlanId): PlanLimits {
  return { ...PLAN_LIMITS[planId] };
}

export function canGuestUpload(args: { planId: PlanId; eventDate: string; now: string }): boolean {
  const limits = getPlanLimits(args.planId);
  const eventDateMs = new Date(args.eventDate).getTime();
  const nowMs = new Date(args.now).getTime();

  if (Number.isNaN(eventDateMs) || Number.isNaN(nowMs)) {
    return false;
  }

  const uploadWindowMs = limits.uploadDaysAfterEvent * 24 * 60 * 60 * 1000;
  const uploadWindowEndMs = eventDateMs + uploadWindowMs;

  return nowMs >= eventDateMs && nowMs <= uploadWindowEndMs;
}
