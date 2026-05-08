import { getPlanLimits, type PlanId } from "./plan-limits";

type GetUsageStatsInput = {
  planId: PlanId;
  photosUsed: number;
  videosUsed: number;
  guestsUsed: number;
};

type UsageStats = {
  photosRemaining: number;
  videosRemaining: number;
  guestsRemaining: number;
};

function sanitizeUsage(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }

  return value;
}

export function getUsageStats(input: GetUsageStatsInput): UsageStats {
  const limits = getPlanLimits(input.planId);
  const photosUsed = sanitizeUsage(input.photosUsed);
  const videosUsed = sanitizeUsage(input.videosUsed);
  const guestsUsed = sanitizeUsage(input.guestsUsed);

  return {
    photosRemaining: Math.max(0, limits.photos - photosUsed),
    videosRemaining: Math.max(0, limits.videos - videosUsed),
    guestsRemaining: Math.max(0, limits.guests - guestsUsed),
  };
}
