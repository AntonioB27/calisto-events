const TTL_MS = 3480 * 1000; // 3600s URL TTL minus 120s safety margin

type CacheEntry = { url: string; expiresAt: number };
type StoredCache = { entries: Record<string, CacheEntry> };

const memCache = new Map<string, CacheEntry>();

function storageKey(eventId: string) {
  return `calisto:surl:${eventId}`;
}

/** Load sessionStorage entries for an event into the in-memory cache. Call once on mount. */
export function warmCache(eventId: string): void {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem(storageKey(eventId));
    if (!raw) return;
    const stored = JSON.parse(raw) as StoredCache;
    const now = Date.now();
    for (const [path, entry] of Object.entries(stored.entries)) {
      if (entry.expiresAt > now && !memCache.has(path)) {
        memCache.set(path, entry);
      }
    }
  } catch {
    // ignore parse / quota errors
  }
}

/** Split paths into already-cached URLs and paths that need signing. */
export function getCachedUrls(paths: string[]): {
  cached: Record<string, string>;
  missing: string[];
} {
  const now = Date.now();
  const cached: Record<string, string> = {};
  const missing: string[] = [];
  for (const path of paths) {
    const entry = memCache.get(path);
    if (entry && entry.expiresAt > now) {
      cached[path] = entry.url;
    } else {
      if (entry) memCache.delete(path); // evict expired
      missing.push(path);
    }
  }
  return { cached, missing };
}

/** Persist freshly-signed URLs to both the in-memory cache and sessionStorage. */
export function storeCachedUrls(eventId: string, urlMap: Record<string, string>): void {
  const expiresAt = Date.now() + TTL_MS;
  for (const [path, url] of Object.entries(urlMap)) {
    memCache.set(path, { url, expiresAt });
  }
  if (typeof window === "undefined") return;
  try {
    const key = storageKey(eventId);
    let existing: Record<string, CacheEntry> = {};
    const raw = sessionStorage.getItem(key);
    if (raw) {
      try {
        existing = (JSON.parse(raw) as StoredCache).entries;
      } catch {
        existing = {};
      }
    }
    // Merge, pruning expired entries to keep storage lean
    const now = Date.now();
    const merged: Record<string, CacheEntry> = {};
    for (const [path, entry] of Object.entries(existing)) {
      if (entry.expiresAt > now) merged[path] = entry;
    }
    for (const [path, url] of Object.entries(urlMap)) {
      merged[path] = { url, expiresAt };
    }
    sessionStorage.setItem(key, JSON.stringify({ entries: merged }));
  } catch {
    // ignore quota errors
  }
}

/** Remove a single path from the in-memory cache (e.g. after the file is deleted). */
export function invalidateCachedUrl(path: string): void {
  memCache.delete(path);
}
