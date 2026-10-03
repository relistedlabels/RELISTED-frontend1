"use client";

import { useMe } from "@/lib/queries/auth/useMe";
import { useListerProfile } from "@/lib/queries/listers/useListerProfile";
import { useUserStore } from "@/store/useUserStore";

export function useListerNavigation() {
  const token = useUserStore((s) => s.token);
  const role = useUserStore((s) => s.role);
  const { data: user } = useMe();
  const { data: listerProfile } = useListerProfile(role === "LISTER" && !!token);

  const goToListerFlow = () => {
    if (!token || !user) {
      window.location.href = "/auth/create-account";
      return;
    }

    if (role === "LISTER" && listerProfile) {
      window.location.href = "/listers/dashboard";
      return;
    }

    window.location.href = "/auth/profile-setup?upgrade=lister";
  };

  return { goToListerFlow };
}
