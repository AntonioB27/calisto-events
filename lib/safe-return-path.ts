/** Avoid open redirects: only same-origin relative paths. */
export function getSafeReturnPath(returnTo: string | null | undefined): string | null {
  if (returnTo == null || typeof returnTo !== "string") return null;
  const trimmed = returnTo.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  return trimmed;
}

/**
 * Where to send the user after OAuth (or email sign-in) completes.
 * Uses `getSafeReturnPath` then defaults to `/dashboard`.
 * Treats `/` like “no destination” so we never post-login dump users on the marketing home.
 */
export function getPostAuthRedirectPath(next: string | null | undefined): string {
  const p = getSafeReturnPath(next);
  if (!p || p === "/") return "/dashboard";
  return p;
}
