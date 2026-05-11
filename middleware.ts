import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { CALISTO_UI_LOCALE_COOKIE } from "@/lib/ui-locale-constants";

/** Refreshes the Supabase session cookie on navigations (`@supabase/ssr`). */
export async function middleware(request: NextRequest) {
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
