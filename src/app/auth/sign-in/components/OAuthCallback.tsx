"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMe } from "@/lib/queries/auth/useMe";
import { useProfile } from "@/lib/queries/user/useProfile";
import { resolvePostAuthDestination } from "@/lib/onboarding/onboardingGate";
import { useAdminIdStore } from "@/store/useAdminIdStore";
import { useUserStore } from "@/store/useUserStore";

export default function OAuthCallback() {
  const qc = useQueryClient();
  const router = useRouter();
  const adminId = useAdminIdStore((s) => s.adminId);
  const { data: user, isLoading: userLoading } = useMe();
  const { data: profile, isLoading: profileLoading } = useProfile();

  useEffect(() => {
    qc.invalidateQueries({ queryKey: ["auth", "me"] });
  }, [qc]);

  useEffect(() => {
    if (userLoading || profileLoading) return;

    if (!user) {
      router.replace("/auth/sign-in");
      return;
    }

    if (user.role === "ADMIN") {
      router.replace(`/admin/${adminId ?? "k340eol21"}/dashboard`);
      return;
    }

    if (!profile || !profile.user?.name) {
      router.replace("/auth/profile-setup");
      return;
    }

    const userId = useUserStore.getState().userId;
    router.replace(
      resolvePostAuthDestination({
        role: user.role,
        userId,
        honorRedirect: false,
      }),
    );
  }, [adminId, profile, profileLoading, router, user, userLoading]);

  return null;
}
