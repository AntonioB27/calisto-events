import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n";
import { CALISTO_UI_LOCALE_COOKIE } from "@/lib/ui-locale-constants";

function wantsMarkdownLanding(request: NextRequest): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  const accept = request.headers.get("accept");
  if (!accept) return false;
  return /\btext\/markdown\b/i.test(accept);
}

function localeFromMarketingHomePath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return DEFAULT_LOCALE;
  if (segments.length === 1 && isLocale(segments[0]!)) return segments[0]!;
  return null;
}

/** Refreshes the Supabase session cookie on navigations (`@supabase/ssr`). */
export async function middleware(request: NextRequest) {
  if (wantsMarkdownLanding(request)) {
    const locale = localeFromMarketingHomePath(request.nextUrl.pathname);
    if (locale) {
      const url = request.nextUrl.clone();
      url.pathname = `/internal/markdown-home/${locale}`;
      return NextResponse.rewrite(url);
    }
  }

  let supabaseResponse = NextResponse.next({ request });

  const firstSegment = request.nextUrl.pathname.split("/").filter(Boolean)[0] ?? "";
  if (firstSegment === "en" || firstSegment === "hr" || firstSegment === "de") {
    supabaseResponse.cookies.set(CALISTO_UI_LOCALE_COOKIE, firstSegment, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url?.trim() || !anonKey?.trim()) {
    console.warn(
      "[calisto-landing] Supabase middleware skipped (session cookies will not refresh): set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. See README (Supabase Dashboard → Settings → API).",
    );
    return supabaseResponse;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Refresh session — do not remove.
  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
