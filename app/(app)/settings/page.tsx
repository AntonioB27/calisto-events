import Link from "next/link";

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
          <Link href="/dashboard" style={{ fontSize: 13, color: 'var(--app-gold)', textDecoration: 'underline' }}>
            Events
          </Link>
        </div>

        <div style={{ background: 'var(--app-card)', borderRadius: 18, border: '1.5px solid var(--app-border)', padding: 24 }}>
          <SettingsClient email={user?.email ?? ""} />
        </div>
      </div>
    </main>
  );
}
