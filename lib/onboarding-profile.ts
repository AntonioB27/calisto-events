import type { SupabaseClient } from "@supabase/supabase-js";

/** True when organizer should see first-run setup (profiles.onboarding_completed_at is null). */
export async function needsOrganizerOnboarding(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("onboarding_completed_at")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return false;
  }

  if (!data) {
    return true;
  }

  return data.onboarding_completed_at == null;
}
