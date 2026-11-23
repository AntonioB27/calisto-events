/** Latest ZIP export row as the organizer's client reads it (RLS: primary organizer only). */
export type ZipJob = {
  id: string;
  status: string;
  include_videos: boolean;
  error_message: string | null;
  expires_at: string | null;
  created_at: string;
  file_size_bytes: number | null;
  progress_done: number | null;
  progress_total: number | null;
  // Status page only (ZIP_STATUS_COLUMNS)
  started_at?: string | null;
  finished_at?: string | null;
  failed_item?: string | null;
  emailed_started_at?: string | null;
  emailed_result_at?: string | null;
};

export const ZIP_JOB_COLUMNS =
  "id, status, include_videos, error_message, expires_at, created_at, file_size_bytes, progress_done, progress_total";

export const ZIP_STATUS_COLUMNS = `${ZIP_JOB_COLUMNS}, started_at, finished_at, failed_item, emailed_started_at, emailed_result_at`;

export type ZipPhase = "queued" | "packing" | "saving" | "ready" | "failed";

/** Failed exports stop showing their pill after this long. */
const FAILED_VISIBLE_MS = 24 * 60 * 60 * 1000;

/** What the dock shows for this job, or null when there is nothing worth showing (none, expired, old failure). */
export function zipPhase(job: ZipJob | null, now: number): ZipPhase | null {
  if (!job) return null;
  switch (job.status) {
    case "queued":
      return "queued";
    case "running": {
      const total = job.progress_total ?? 0;
      return total > 0 && (job.progress_done ?? 0) >= total ? "saving" : "packing";
    }
    case "ready":
      return job.expires_at && Date.parse(job.expires_at) <= now ? null : "ready";
    case "failed":
      return now - Date.parse(job.created_at) > FAILED_VISIBLE_MS ? null : "failed";
    default:
      return null;
  }
}

export function isZipWorking(phase: ZipPhase | null): boolean {
  return phase === "queued" || phase === "packing" || phase === "saving";
}

/** 0–100. Packing tops out at 98 so the bar never claims "done" before the file is saved. */
export function zipPercent(phase: ZipPhase | null, done: number, total: number): number {
  if (phase === "ready") return 100;
  if (phase === "saving") return 99;
  if (!total) return 0;
  return Math.max(0, Math.min(98, Math.floor((done / total) * 98)));
}

/** How many of the `slots` photo prints are filled for this percentage. */
export function filledPrints(phase: ZipPhase | null, pct: number, slots: number): number {
  if (phase === "ready") return slots;
  return Math.min(slots - 1, Math.floor((pct / 100) * slots));
}

/** Whole minutes left from the rate seen since `since`, or null until there is enough signal. */
export function zipMinutesLeft(
  since: { at: number; done: number },
  now: number,
  done: number,
  total: number,
): number | null {
  const elapsed = now - since.at;
  const packed = done - since.done;
  if (elapsed < 3000 || packed <= 0 || total <= done) return null;
  return Math.ceil(((total - done) / (packed / elapsed)) / 60_000);
}

export function formatZipSize(bytes: number, locale: string): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toLocaleString(locale, { maximumFractionDigits: 1 })} GB`;
  return `${Math.max(1, Math.round(bytes / 1e6)).toLocaleString(locale)} MB`;
}

/** "antonio@gmail.com" → "a•••@gmail.com", so the page can say where e-mails went without spelling it out. */
export function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at < 1) return email;
  return `${email[0]}•••${email.slice(at)}`;
}

/** Whole hours and minutes until `until`, never negative. */
export function timeLeft(until: number, now: number): { h: number; m: number } {
  const mins = Math.max(0, Math.floor((until - now) / 60_000));
  return { h: Math.floor(mins / 60), m: mins % 60 };
}
