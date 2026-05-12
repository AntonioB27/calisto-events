import { NextResponse } from "next/server";

function supabaseAuthBase(): string | null {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

/** Delegates to Supabase Auth OAuth 2.0 Authorization Server metadata. */
export async function GET(): Promise<NextResponse> {
  const base = supabaseAuthBase();
  if (!base) {
    return NextResponse.json(
      { error: "OAuth authorization server metadata is not configured (missing NEXT_PUBLIC_SUPABASE_URL)." },
      { status: 503 },
    );
  }
  const target = `${base}/auth/v1/.well-known/oauth-authorization-server`;
  return NextResponse.redirect(target, 307);
}
