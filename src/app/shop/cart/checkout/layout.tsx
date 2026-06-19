"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import FullPageLoader from "@/common/ui/FullPageLoader";
import { useUserStoreHydrated } from "@/hooks/useUserStoreHydrated";
import {
  buildSignInUrl,
  useAuthReturnUrl,
} from "@/lib/auth/signInRedirectUrl";
import { useMe } from "@/lib/queries/auth/useMe";
import { useUserStore } from "@/store/useUserStore";

export default function CheckoutLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const returnUrl = useAuthReturnUrl();
  const hydrated = useUserStoreHydrated();
  const { sessionToken, requiresMfa, token } = useUserStore();

  const { data: user, isLoading: userLoading } = useMe();

  useEffect(() => {
    if (!hydrated) return;

    if (sessionToken && requiresMfa) {
      router.replace("/auth/OTP");
      return;
    }

    if (!userLoading) {
      if (!token) {
        router.replace(buildSignInUrl(returnUrl));
        return;
      }

      if (!user) {
        router.replace(buildSignInUrl(returnUrl));
      }
    }
  }, [
    hydrated,
    user,
    userLoading,
    sessionToken,
    requiresMfa,
    token,
    router,
    returnUrl,
  ]);

  if (!hydrated) {
    return <FullPageLoader />;
  }

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
