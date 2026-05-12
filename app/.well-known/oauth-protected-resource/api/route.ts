import { NextResponse } from "next/server";

import { getPublicOrigin } from "@/lib/public-origin";

export const dynamic = "force-dynamic";

function supabaseIssuer(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;
  return `${raw.replace(/\/$/, "")}/auth/v1`;
}

/**
 * RFC 9728 metadata for resource identifier `{origin}/api` — retrieved from
 * `GET /.well-known/oauth-protected-resource/api` (suffix inserted between host and path).
 */
export async function GET(): Promise<NextResponse> {
  const origin = await getPublicOrigin();
  const issuer = supabaseIssuer();
  if (!issuer) {
    return NextResponse.json(
      { error: "Protected resource metadata requires NEXT_PUBLIC_SUPABASE_URL." },
      { status: 503 },
    );
  }

  const resource = `${origin}/api`;
  const body = {
    resource,
    authorization_servers: [issuer],
    scopes_supported: ["openid", "email", "profile"],
    bearer_methods_supported: ["header"],
    resource_documentation: `${origin}/docs/api`,
  };

  return NextResponse.json(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}

export async function HEAD(): Promise<NextResponse> {
  const issuer = supabaseIssuer();
  if (!issuer) {
    return new NextResponse(null, { status: 503 });
  }
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
