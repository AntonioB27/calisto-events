import type { NextConfig } from "next";

/**
 * Browser Supabase (@supabase/ssr) reads NEXT_PUBLIC_* at build time — they must be
 * non-empty in the client bundle. Hosts sometimes only define SUPABASE_URL +
 * SUPABASE_ANON_KEY (server-style) or EXPO_PUBLIC_* (from mobile tooling). Map those
 * into NEXT_PUBLIC_* so production builds embed the anon key safely (never service role).
 */
function firstNonempty(...vals: readonly (string | undefined)[]): string {
  for (const v of vals) {
    const s = typeof v === "string" ? v.trim() : "";
    if (s) return v!.trim();
  }
  return "";
}

const NEXT_PUBLIC_SUPABASE_URL = firstNonempty(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_URL,
);

const NEXT_PUBLIC_SUPABASE_ANON_KEY = firstNonempty(
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  process.env.SUPABASE_ANON_KEY,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
);

/** RFC 8288 / RFC 9727 §3 — agent discovery on marketing home routes. */
const AGENT_DISCOVERY_LINK =
  '</.well-known/api-catalog>; rel="api-catalog", ' +
  '</openapi.json>; rel="service-desc", ' +
  '</docs/api>; rel="service-doc", ' +
  '</.well-known/agent-skills/index.json>; rel="describedby"';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  async headers() {
    return [
      { source: "/", headers: [{ key: "Link", value: AGENT_DISCOVERY_LINK }] },
      { source: "/en", headers: [{ key: "Link", value: AGENT_DISCOVERY_LINK }] },
      { source: "/hr", headers: [{ key: "Link", value: AGENT_DISCOVERY_LINK }] },
      { source: "/de", headers: [{ key: "Link", value: AGENT_DISCOVERY_LINK }] },
    ];
  },
};

export default nextConfig;
