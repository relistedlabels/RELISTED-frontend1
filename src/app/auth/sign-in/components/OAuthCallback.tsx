"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useMe } from "@/lib/queries/auth/useMe";
import { useProfile } from "@/lib/queries/user/useProfile";
import { useAdminIdStore } from "@/store/useAdminIdStore";

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

    if (user.role === "LISTER") {
      router.replace("/listers/inventory");
      return;
    }

    router.replace("/shop");
  }, [adminId, profile, profileLoading, router, user, userLoading]);

  return null;
}
