import { createClient } from "@supabase/supabase-js";

function getSupabaseUrl(): string {
  const value =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!value) {
    throw new Error(
      "Missing Supabase URL. Set SUPABASE_URL (preferred) or NEXT_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_URL.",
    );
  }
  return value;
}

function getServiceRoleKey(): string {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!value) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }
  return value;
}

export function getSupabaseServerClient() {
  const url = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
