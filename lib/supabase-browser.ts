import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase-env";

type BrowserClient = ReturnType<typeof createBrowserClient>;

// Singletons — one instance per client session so PKCE code verifiers are
// consistent across signInWithOAuth and the subsequent callback exchange.
let _client: BrowserClient | null = null;
let _maybeClient: BrowserClient | null = null;

export function maybeCreateSupabaseBrowserClient(): BrowserClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url?.trim() || !anonKey?.trim()) {
    return null;
  }
  if (!_maybeClient) {
    _maybeClient = createBrowserClient(url, anonKey);
  }
  return _maybeClient;
}

export function getSupabaseBrowserClient(): BrowserClient {
  if (!_client) {
    const url = getSupabaseUrl(
      "Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL in .env.local (Supabase Dashboard → Settings → API).",
    );
    const anonKey = getSupabaseAnonKey(
      "Missing Supabase anon key. Set NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (Supabase Dashboard → Settings → API).",
    );
    _client = createBrowserClient(url, anonKey);
  }
  return _client;
}

// Compat alias for ported code from `feat/web-platform`.
export function createSupabaseBrowserClient() {
  return getSupabaseBrowserClient();
}
