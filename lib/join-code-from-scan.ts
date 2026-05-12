import { isAccessCodeValid, normalizeAccessCode } from "@/lib/access-code";

const JOIN_PATH = /\/join\/([^/?#\s]+)/i;

function trySegment(segment: string): string | null {
  let decoded = segment;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    // keep raw segment
  }

  const stripped = decoded.replace(/^CALISTO[-\s]?/i, "");
  for (const candidate of [decoded, stripped]) {
    const code = normalizeAccessCode(candidate);
    if (isAccessCodeValid(code)) return code;
  }
  return null;
}

/**
 * Extract a valid event access code from QR / barcode text (join URL or raw code).
 */
export function decodeJoinCodeFromScan(raw: string): string | null {
  const t = raw.trim();
  if (!t) return null;

  const pathHit = t.match(JOIN_PATH);
  if (pathHit?.[1]) {
    const fromPath = trySegment(pathHit[1]);
    if (fromPath) return fromPath;
  }

  for (const candidate of [t, /^https?:\/\//i.test(t) ? t : `https://${t}`]) {
    try {
      const u = new URL(candidate);
      const m = u.pathname.match(/^\/join\/([^/]+)\/?$/i) ?? u.pathname.match(JOIN_PATH);
      if (m?.[1]) {
        const c = trySegment(m[1]);
        if (c) return c;
      }
    } catch {
      // not a URL
    }
  }

  return trySegment(t);
}
