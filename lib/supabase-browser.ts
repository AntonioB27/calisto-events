import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase-env";

type BrowserClient = ReturnType<typeof createBrowserClient>;

export function maybeCreateSupabaseBrowserClient(): BrowserClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url?.trim() || !anonKey?.trim()) {
    return null;
  }
  return createBrowserClient(url, anonKey);
}

export function getSupabaseBrowserClient(): BrowserClient {
  const url = getSupabaseUrl(
    "Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL in .env.local (Supabase Dashboard → Settings → API).",
  );
  const anonKey = getSupabaseAnonKey(
    "Missing Supabase anon key. Set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (Supabase Dashboard → Settings → API).",
  );
  return createBrowserClient(url, anonKey);
}

// Compat alias for ported code from `feat/web-platform`.
export function createSupabaseBrowserClient() {
  return getSupabaseBrowserClient();
}
