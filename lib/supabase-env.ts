export function getSupabaseUrl(errorMessage: string): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!value) {
    throw new Error(errorMessage);
  }
  return value;
}

export function getSupabaseAnonKey(errorMessage: string): string {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) {
    throw new Error(errorMessage);
  }
  return value;
}
