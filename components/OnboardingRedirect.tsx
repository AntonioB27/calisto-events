"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = Readonly<{
  needsOnboarding: boolean;
  children: React.ReactNode;
}>;

export function OnboardingRedirect({ needsOnboarding, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!needsOnboarding) return;
    if (pathname?.startsWith("/onboarding")) return;
    router.replace("/onboarding/organizer");
  }, [needsOnboarding, pathname, router]);

  return <>{children}</>;
}
