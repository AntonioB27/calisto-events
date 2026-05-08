const KEY_PREFIX = "calisto_my_events_order_v1_";

export function orderStorageKey(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

export function loadSavedOrder(userId: string): string[] {
  try {
    const raw = window.localStorage.getItem(orderStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function saveOrder(userId: string, orderedIds: string[]): void {
  try {
    window.localStorage.setItem(orderStorageKey(userId), JSON.stringify(orderedIds));
  } catch {
    /* ignore */
  }
}

/** Apply saved id order; unknown / new events keep fetch order after ordered ids. */
export function mergeWithSavedOrder<T extends { id: string }>(items: T[], savedIds: string[]): T[] {
  const byId = new Map(items.map((i) => [i.id, i]));
  const ordered: T[] = [];
  const used = new Set<string>();
  for (const id of savedIds) {
    const it = byId.get(id);
    if (it) {
      ordered.push(it);
      used.add(id);
    }
  }
  for (const it of items) {
    if (!used.has(it.id)) ordered.push(it);
  }
  return ordered;
}

