"use client";

import { useRouter } from "next/navigation";
import { useMe } from "@/lib/queries/auth/useMe";
import { useProfile } from "@/lib/queries/user/useProfile";

export function useAuthRedirect() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useMe();

  const { data: profile, isLoading: profileLoading } = useProfile();

  const redirect = () => {
    if (userLoading || profileLoading) return;

    if (!user) {
      router.replace("/auth/sign-in");
      return;
    }

    if (!profile || !profile.name) {
      router.replace("/auth/profile-setup");
      return;
    }

    if (user.role === "CURATOR") {
      router.replace("/listers/inventory");
      return;
    }

    if (user.role === "DRESSER") {
      router.replace("/shop");
      return;
    }
  };

  return {
    redirect,
    isReady: !userLoading && !profileLoading,
  };
}
