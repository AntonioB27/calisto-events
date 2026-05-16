import { redirect } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import {
  createSupabaseAuthServerClient,
  isAuthRequiredError,
  requireOrganizerSession,
} from "@/lib/supabase-auth-server";

export default async function ProtectedAppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let userInitial = 'A';
  let userName = '';

  try {
    await requireOrganizerSession();
    const supabase = await createSupabaseAuthServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const fullName: string = user?.user_metadata?.full_name ?? '';
    const email: string = user?.email ?? '';
    userName = fullName || email;
    userInitial = (fullName?.[0] ?? email?.[0] ?? 'A').toUpperCase();
  } catch (error) {
    if (isAuthRequiredError(error)) {
      redirect("/auth/login");
    }
    throw error;
  }

  return (
    <AppShell userName={userName} userInitial={userInitial}>
      {children}
    </AppShell>
  );
}
