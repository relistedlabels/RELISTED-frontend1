"use client";

import { useMe } from "@/lib/queries/auth/useMe";
import { useUserStore } from "@/store/useUserStore";

/** Stable user id for onboarding localStorage (store first, then /auth/user). */
export function useOnboardingUserId(): string | null {
  const storeUserId = useUserStore((s) => s.userId);
  const { data: me } = useMe();
  return storeUserId ?? me?.id ?? null;
}
