/** Home's prep list before the event (table event_checklist_items). Shared by the page loader and the client list. */
export const PREP_STEPS = ["invites", "qr", "share", "co", "moderation", "peek"] as const;
export type PrepStep = (typeof PREP_STEPS)[number];

/** A tick on one of Calisto's steps (`step`), or the organizer's own item (`label`). */
export type PrepItem = Readonly<{ id: string; step: PrepStep | null; label: string | null; done: boolean }>;

export const PREP_COLS = "id, step, label, done";

export type PrepData = Readonly<{
  rows: readonly PrepItem[];
  /** Guests (not organizers) who joined: the link is out. */
  guests: number;
  coOrganizers: number;
  /** Confirmed RSVPs; null when the plan has no RSVP, which hides the step. */
  rsvpConfirmed: number | null;
  moderationEnabled: boolean;
}>;

/** Calisto's steps this viewer sees, in order, ticked by what Calisto already knows (`auto`) or by hand. */
export function prepSteps(prep: PrepData, rows: readonly PrepItem[], isPrimaryOrganizer: boolean) {
  const auto: Record<PrepStep, boolean> = {
    invites: (prep.rsvpConfirmed ?? 0) > 0,
    qr: false,
    share: prep.guests > 0,
    co: prep.coOrganizers > 0,
    moderation: prep.moderationEnabled,
    peek: false,
  };
  return PREP_STEPS.filter(
    (step) =>
      (step !== "invites" || prep.rsvpConfirmed !== null) &&
      // Co-organizers can't promote members or open Settings.
      (isPrimaryOrganizer || (step !== "co" && step !== "moderation")),
  ).map((step) => ({ step, auto: auto[step], done: auto[step] || rows.some((r) => r.step === step && r.done) }));
}
