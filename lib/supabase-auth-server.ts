import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type OrganizerContext = {
  userId?: string | null;
  session?: {
    user?: {
      id?: string | null;
    } | null;
  } | null;
} | null;

export class AuthRequiredError extends Error {
  readonly code = "AUTH_REQUIRED";

  constructor(message = "Authentication required.") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

export function isAuthRequiredError(error: unknown): error is AuthRequiredError {
  if (error instanceof AuthRequiredError) {
    return true;
  }

  if (!error || typeof error !== "object") {
    return false;
  }

  return (error as { code?: unknown }).code === "AUTH_REQUIRED";
}

function toUserId(context: OrganizerContext): string | null {
  if (context?.userId) {
    return context.userId;
  }

  if (context?.session?.user?.id) {
    return context.session.user.id;
  }

  return null;
}

function shouldTrustExplicitContext(): boolean {
  return process.env.NODE_ENV === "test";
}

export function getSupabaseAuthServerClient() {
  const cookieStorePromise = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const cookieStore = await cookieStorePromise;
          return cookieStore.getAll();
        },
        async setAll(cookiesToSet) {
          try {
            const cookieStore = await cookieStorePromise;
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — middleware handles refresh.
          }
        },
      },
    },
  );
}

// Compat name used by `feat/web-platform`.
export async function createSupabaseAuthServerClient() {
  return getSupabaseAuthServerClient();
}

export async function requireOrganizerSession(context?: OrganizerContext) {
  if (context === null) {
    throw new AuthRequiredError();
  }

  const userIdFromContext = shouldTrustExplicitContext() ? toUserId(context ?? null) : null;
  if (userIdFromContext) {
    return { userId: userIdFromContext };
  }

  let supabase: ReturnType<typeof getSupabaseAuthServerClient>;
  try {
    supabase = getSupabaseAuthServerClient();
  } catch {
    throw new AuthRequiredError();
  }

  let data: { user: { id: string } | null } | null = null;
  let error: unknown = null;
  try {
    const res = await supabase.auth.getUser();
    data = res.data as { user: { id: string } | null };
    error = res.error;
  } catch {
    throw new AuthRequiredError();
  }
  if (error || !data.user?.id) {
    throw new AuthRequiredError();
  }

  return { userId: data.user.id };
}
