import { createSupabaseAuthServerClient } from "@/lib/supabase-auth-server";
import { JoinCodeForm } from "./JoinCodeForm";
import { JoinEntryFooter } from "./JoinEntryFooter";

export default async function JoinEntryPage() {
  const supabase = await createSupabaseAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <main className="join-shell" style={{ minHeight: "100vh", padding: "0 16px" }}>
      <JoinCodeForm isLoggedIn={!!user} />
      <JoinEntryFooter />
    </main>
  );
}
