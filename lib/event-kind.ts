export const EVENT_KINDS = ["wedding", "birthday", "corporate", "other"] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export function parseEventKind(raw: string | null | undefined): EventKind {
  if (raw && (EVENT_KINDS as readonly string[]).includes(raw)) {
    return raw as EventKind;
  }
  return "other";
}
