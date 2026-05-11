/**
 * Canonical origin for Supabase auth `redirectTo` URLs from the browser.
 *
 * Prefer `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_APP_URL` (inlined at build time) so
 * OAuth and password-reset callbacks match the public domain and Supabase
 * “Redirect URLs”, even if the app was opened on a preview hostname.
 *
 * Falls back to `window.location.origin` when unset (typical local dev).
 */
export function getBrowserPublicOrigin(): string {
  if (typeof window === "undefined") {
    return "";
  }
  for (const raw of [process.env.NEXT_PUBLIC_SITE_URL, process.env.NEXT_PUBLIC_APP_URL]) {
    const trimmed = raw?.trim();
    if (!trimmed) continue;
    const withProto =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`;
    try {
      return new URL(withProto).origin;
    } catch {
      continue;
    }
  }
  return window.location.origin;
}
