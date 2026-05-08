import { createBrowserClient } from "@supabase/ssr";

export function getSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// Compat alias for ported code from `feat/web-platform`.
export function createSupabaseBrowserClient() {
  return getSupabaseBrowserClient();
}
