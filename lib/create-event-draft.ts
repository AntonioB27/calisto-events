import type { PlanId } from "./plan-limits";

export const CREATE_EVENT_DRAFT_KEY = "calisto_create_event_draft_v1";

export type CreateEventDraft = Readonly<{
  v: 1;
  savedAt: string;
  step: "1" | "2" | "3";
  name: string;
  emoji?: string;
  date: string;
  planId: PlanId;
  moderationEnabled?: boolean;
}>;

function isPlanId(value: unknown): value is PlanId {
  return (
    value === "free" ||
    value === "standard" ||
    value === "plus" ||
    value === "premium" ||
    value === "max"
  );
}

export function encodeCreateEventDraft(draft: CreateEventDraft): string {
  return JSON.stringify(draft);
}

export function decodeCreateEventDraft(raw: string): CreateEventDraft | null {
  try {
    const parsed = JSON.parse(raw) as Partial<CreateEventDraft>;
    if (parsed.v !== 1) return null;
    if (typeof parsed.savedAt !== "string") return null;
    if (parsed.step !== "1" && parsed.step !== "2" && parsed.step !== "3") return null;
    if (typeof parsed.name !== "string") return null;
    if (parsed.emoji != null && typeof parsed.emoji !== "string") return null;
    if (typeof parsed.date !== "string") return null;
    if (!isPlanId(parsed.planId)) return null;
    if (parsed.moderationEnabled != null && typeof parsed.moderationEnabled !== "boolean") return null;
    return parsed as CreateEventDraft;
  } catch {
    return null;
  }
}

export function readCreateEventDraftFromStorage(): CreateEventDraft | null {
  try {
    const raw = window.localStorage.getItem(CREATE_EVENT_DRAFT_KEY);
    if (!raw) return null;
    return decodeCreateEventDraft(raw);
  } catch {
    return null;
  }
}

export function writeCreateEventDraftToStorage(
  draftWithoutSavedAtV: Omit<CreateEventDraft, "savedAt" | "v">,
) {
  const full: CreateEventDraft = {
    v: 1,
    savedAt: new Date().toISOString(),
    ...draftWithoutSavedAtV,
  };
  try {
    window.localStorage.setItem(CREATE_EVENT_DRAFT_KEY, encodeCreateEventDraft(full));
  } catch {
    // ignore
  }
}

export function clearCreateEventDraftFromStorage() {
  try {
    window.localStorage.removeItem(CREATE_EVENT_DRAFT_KEY);
  } catch {
    // ignore
  }
}
