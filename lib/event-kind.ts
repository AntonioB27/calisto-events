export const EVENT_KINDS = ["generic", "wedding"] as const;

export type EventKind = (typeof EVENT_KINDS)[number];

export const DEFAULT_EVENT_KIND: EventKind = "generic";

export function normalizeEventKind(raw: string | null | undefined): EventKind {
  if (raw && (EVENT_KINDS as readonly string[]).includes(raw)) {
    return raw as EventKind;
  }
  return DEFAULT_EVENT_KIND;
}
