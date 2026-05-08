import Link from "next/link";

import { appButtonClassNames } from "@/components/app-ui/AppBtn";
import { AppCard } from "@/components/app-ui/AppCard";
import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";

import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const supabase = await createSupabaseAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex items-center justify-between">
          <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: 'var(--app-text)' }}>
            Settings
          </h1>
          <Link href="/dashboard" className={appButtonClassNames({ variant: "ghost", size: "sm" })}>
            Events
          </Link>
        </div>

        <AppCard pad="lg" style={{ borderRadius: 18, boxShadow: "var(--app-shadow-sm)" }}>
          <SettingsClient email={user?.email ?? ""} />
        </AppCard>
      </div>
    </main>
  );
}
