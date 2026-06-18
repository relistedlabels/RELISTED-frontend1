"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import FullPageLoader from "@/common/ui/FullPageLoader";
import { useMe } from "@/lib/queries/auth/useMe";
import { useUserStore } from "@/store/useUserStore";

export default function RentersLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { sessionToken, requiresMfa, token } = useUserStore();

  const { data: user, isLoading: userLoading } = useMe();

  useEffect(() => {
    if (sessionToken && requiresMfa) {
      router.replace("/auth/OTP");
      return;
    }

    if (!userLoading) {
      if (!token) {
        router.replace("/auth/sign-in");
        return;
      }

      if (!user) {
        router.replace("/auth/sign-in");
      }
    }
  }, [user, userLoading, sessionToken, requiresMfa, token, router]);

  if (sessionToken && requiresMfa) {
    return <FullPageLoader />;
  }

  if (userLoading) {
    return <FullPageLoader />;
  }

  if (!token || !user) {
    return <FullPageLoader />;
  }

  return <>{children}</>;
}
