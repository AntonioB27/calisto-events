const KEY_PREFIX = "calisto_my_events_hidden_v1_";

function visibilityStorageKey(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

export function loadHiddenEventIds(userId: string): string[] {
  try {
    const raw = window.localStorage.getItem(visibilityStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function saveHiddenEventIds(userId: string, eventIds: string[]): void {
  try {
    window.localStorage.setItem(visibilityStorageKey(userId), JSON.stringify(eventIds));
  } catch {
    /* ignore */
  }
}

