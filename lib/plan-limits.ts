import type { Locale } from "@/lib/i18n";

import { bcp47FromUiLocale } from "@/lib/locale-bcp47";

/**
 * Caps and upload windows aligned with `event-media-app` / Supabase plan defaults.
 */
export type PlanId = "free" | "standard" | "plus" | "premium" | "max";

export type PlanLimits = Readonly<{
  guests: number;
  photos: number;
  videos: number;
  uploadDaysAfterEvent: number;
  /** Whole-event retention: DB `scheduled_deletion_at` = event_date + this many days. */
  retentionDaysAfterEvent: number;
}>;

/** Matches Postgres int max used for unlimited-style caps in the app DB. */
export const PLAN_DB_INT_MAX = 2147483647;

const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    guests: 5,
    photos: 20,
    videos: 0,
    uploadDaysAfterEvent: 3,
    retentionDaysAfterEvent: 7,
  },
  standard: {
    guests: 30,
    photos: 150,
    videos: 10,
    uploadDaysAfterEvent: 7,
    retentionDaysAfterEvent: 30,
  },
  plus: {
    guests: 100,
    photos: 500,
    videos: 50,
    uploadDaysAfterEvent: 14,
    retentionDaysAfterEvent: 90,
  },
  premium: {
    guests: 250,
    photos: 2000,
    videos: 200,
    uploadDaysAfterEvent: 30,
    retentionDaysAfterEvent: 180,
  },
  max: {
    guests: PLAN_DB_INT_MAX,
    photos: PLAN_DB_INT_MAX,
    videos: PLAN_DB_INT_MAX,
    uploadDaysAfterEvent: 60,
    retentionDaysAfterEvent: 365,
  },
};

export function getPlanLimits(planId: PlanId): PlanLimits {
  return { ...PLAN_LIMITS[planId] };
}

const PLAN_IDS: readonly PlanId[] = ["free", "standard", "plus", "premium", "max"];

export function normalizePlanId(value: unknown): PlanId {
  return typeof value === "string" && (PLAN_IDS as readonly string[]).includes(value) ? (value as PlanId) : "free";
}

/** Stat ring / subtitle when cap is unlimited in DB terms */
export function isUnlimitedQuota(n: number): boolean {
  return n >= PLAN_DB_INT_MAX / 2;
}

/** Localized quota line under stat rings (Overview). */
export function formatQuotaSublabelLocalized(
  n: number,
  unlimitedLabel: string,
  ofTemplate: string,
  locale: Locale,
): string {
  if (isUnlimitedQuota(n)) return unlimitedLabel;
  const num = n.toLocaleString(bcp47FromUiLocale(locale));
  return ofTemplate.replace("{n}", num);
}

/** @deprecated Prefer formatQuotaSublabelLocalized — kept for callers without locale bundle. */
export function formatQuotaSublabel(n: number): string {
  return formatQuotaSublabelLocalized(n, "Unlimited plan", "of {n}", "en");
}

/** End of guest upload window (inclusive of `eventDate` through N full days after, same instant math as `canGuestUpload`). */
export function getUploadWindowEndMs(args: { planId: PlanId; eventDate: string }): number | null {
  const limits = getPlanLimits(args.planId);
  const eventDateMs = new Date(args.eventDate).getTime();
  if (Number.isNaN(eventDateMs)) return null;
  const uploadWindowMs = limits.uploadDaysAfterEvent * 24 * 60 * 60 * 1000;
  return eventDateMs + uploadWindowMs;
}

/** Client-side fallback for scheduled full-event deletion instant (must match DB `events_compute_scheduled_deletion_at`). */
export function getRetentionDeletionEndMs(args: { planId: PlanId; eventDate: string }): number | null {
  const limits = getPlanLimits(args.planId);
  const eventDateMs = new Date(args.eventDate).getTime();
  if (Number.isNaN(eventDateMs)) return null;
  const retentionMs = limits.retentionDaysAfterEvent * 24 * 60 * 60 * 1000;
  return eventDateMs + retentionMs;
}

export function canGuestUpload(args: { planId: PlanId; eventDate: string; now: string }): boolean {
  const eventDateMs = new Date(args.eventDate).getTime();
  const nowMs = new Date(args.now).getTime();

  if (Number.isNaN(eventDateMs) || Number.isNaN(nowMs)) {
    return false;
  }

  const uploadWindowEndMs = getUploadWindowEndMs({ planId: args.planId, eventDate: args.eventDate });
  if (uploadWindowEndMs === null) return false;

  return nowMs >= eventDateMs && nowMs <= uploadWindowEndMs;
}
