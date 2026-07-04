import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getPostAuthRedirectPath } from "@/lib/safe-return-path";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase-env";

function buildLoginRecoverUrl(origin: string, nextPath: string): string {
  const u = new URL("/auth/login", origin);
  u.searchParams.set("oauth_error", "1");
  if (nextPath && nextPath !== "/dashboard") {
    u.searchParams.set("returnTo", nextPath);
  }
  return u.toString();
}

function getPublicOrigin(requestOrigin: string): string {
  // Prefer the build-time public URL — the raw request origin can be wrong
  // behind a proxy (e.g. http:// instead of https://).
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (siteUrl?.trim()) {
    try {
      const withProto = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`;
      return new URL(withProto).origin;
    } catch { /* fall through */ }
  }
  return requestOrigin;
}

export async function GET(request: Request) {
  const { searchParams, origin: requestOrigin } = new URL(request.url);
  const origin = getPublicOrigin(requestOrigin);
  const code = searchParams.get("code");
  const nextPath = getPostAuthRedirectPath(searchParams.get("next"));

  let supabaseUrl: string;
  let anonKey: string;
  try {
    supabaseUrl = getSupabaseUrl("Missing NEXT_PUBLIC_SUPABASE_URL (Supabase Dashboard → Settings → API).");
    anonKey = getSupabaseAnonKey("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY (Supabase Dashboard → Settings → API).");
  } catch {
    return NextResponse.redirect(buildLoginRecoverUrl(origin, nextPath));
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    });

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        return NextResponse.redirect(`${origin}${nextPath}`);
      }

      console.error("[auth/callback] exchangeCodeForSession error:", error.name, error.message);
    } catch (err) {
      console.error("[auth/callback] exchangeCodeForSession threw:", err instanceof Error ? err.name : typeof err, err instanceof Error ? err.message : String(err));
    }
  }

  return NextResponse.redirect(buildLoginRecoverUrl(origin, nextPath));
}
