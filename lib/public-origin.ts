import { headers } from "next/headers";

/**
 * Canonical public origin for absolute links (join URLs, emails).
 * Prefer NEXT_PUBLIC_SITE_URL in production; fall back to the incoming request host.
 */
export async function getPublicOrigin(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (env) return env;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  if (!host) return "http://localhost:3000";

  const forwardedProto = h.get("x-forwarded-proto");
  const proto =
    forwardedProto ?? (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

  return `${proto}://${host}`;
}
