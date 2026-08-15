"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserStoreHydrated } from "@/hooks/useUserStoreHydrated";
import { shouldRedirectToOnboarding } from "@/lib/onboarding/onboardingGate";
import { useMe } from "@/lib/queries/auth/useMe";
import { useUserStore } from "@/store/useUserStore";

export function OnboardingRedirectGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useUserStoreHydrated();
  const token = useUserStore((s) => s.token);
  const userId = useUserStore((s) => s.userId);
  const storeRole = useUserStore((s) => s.role);
  const { data: user, isLoading } = useMe();

  useEffect(() => {
    if (!hydrated || isLoading || !token) return;

    const redirectPath = shouldRedirectToOnboarding({
      pathname,
      role: user?.role ?? storeRole,
      userId,
      isAuthenticated: true,
    });

    if (redirectPath) {
      router.replace(redirectPath);
    }
  }, [
    hydrated,
    isLoading,
    pathname,
    router,
    storeRole,
    token,
    user?.role,
    userId,
  ]);

  return null;
}
