import { AppCard } from "@/components/app-ui/AppCard";
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
    <main className="px-4 py-10">
      <div className="mx-auto max-w-lg">
        <SettingsPageHeader />

        <AppCard pad="lg" style={{ borderRadius: 18, boxShadow: "var(--app-shadow-sm)" }}>
          <SettingsClient email={user?.email ?? ""} initialDisplayName={initialDisplayName} />
        </AppCard>
      </div>
    </main>
  );
}
