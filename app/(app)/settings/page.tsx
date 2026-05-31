import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";

import { SettingsClient } from "./SettingsClient";
import { SettingsPageHeader } from "./SettingsPageHeader";

export default async function SettingsPage() {
  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialDisplayName = "";
  if (user?.id) {
    const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
    const raw = profile?.display_name;
    initialDisplayName = typeof raw === "string" ? raw : "";
  }

  return (
    <main style={{ padding: '0 16px 48px' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <SettingsPageHeader />
        <SettingsClient email={user?.email ?? ""} initialDisplayName={initialDisplayName} />
      </div>
    </main>
  );
}
