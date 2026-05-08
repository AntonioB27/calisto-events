/** Avoid open redirects: only same-origin relative paths. */
export function getSafeReturnPath(returnTo: string | null | undefined): string | null {
  if (returnTo == null || typeof returnTo !== "string") return null;
  const trimmed = returnTo.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  return trimmed;
}
