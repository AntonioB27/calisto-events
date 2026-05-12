import { NextResponse } from "next/server";

import { getPublicOrigin } from "@/lib/public-origin";

export const dynamic = "force-dynamic";

function supabaseIssuer(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;
  return `${raw.replace(/\/$/, "")}/auth/v1`;
}

/** RFC 9728 — this site’s HTTP API is protected by Supabase-issued tokens where applicable. */
export async function GET(): Promise<NextResponse> {
  const origin = await getPublicOrigin();
  const issuer = supabaseIssuer();
  if (!issuer) {
    return NextResponse.json(
      { error: "Protected resource metadata requires NEXT_PUBLIC_SUPABASE_URL." },
      { status: 503 },
    );
  }

  const body = {
    resource: `${origin}/api/`,
    authorization_servers: [issuer],
    scopes_supported: ["openid", "email", "profile"],
    bearer_methods_supported: ["header"],
  };

  return NextResponse.json(body, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
