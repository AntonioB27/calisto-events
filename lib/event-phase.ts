export type EventPhase = "before" | "during" | "after";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Where an event is in its arc, by calendar day (UTC, matching how event_date is stored).
 * "during" covers the event day and the morning after, when guests are still uploading.
 */
export function getEventPhase(eventDate: string | null | undefined, now: Date = new Date()): EventPhase {
  if (!eventDate) return "before";
  const start = Date.parse(eventDate.slice(0, 10) + "T00:00:00Z");
  if (Number.isNaN(start)) return "before";
  const t = now.getTime();
  if (t < start) return "before";
  if (t < start + 2 * DAY_MS) return "during";
  return "after";
}

/** Whole days from today (UTC) until the event day; 0 on the day itself, negative after. */
export function daysUntilEvent(eventDate: string, now: Date = new Date()): number {
  const start = Date.parse(eventDate.slice(0, 10) + "T00:00:00Z");
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((start - today) / DAY_MS);
}
