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
import { useListerProfile } from "@/lib/queries/listers/useListerProfile";
import { useUserStore } from "@/store/useUserStore";

export default function CuratorsLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const returnUrl = useAuthReturnUrl();
  const hydrated = useUserStoreHydrated();
  const { sessionToken, requiresMfa, token } = useUserStore();

  const { data: user, isLoading: userLoading } = useMe();
  const { data: listerProfile, isLoading: listerProfileLoading } =
    useListerProfile();

  useEffect(() => {
    if (!hydrated) return;

    // If user is in MFA state, redirect to verify MFA
    if (sessionToken && requiresMfa) {
      router.replace("/auth/OTP");
      return;
    }

    if (!userLoading && !listerProfileLoading) {
      // If no token at all, redirect to sign in
      if (!token) {
        router.replace(buildSignInUrl(returnUrl));
        return;
      }

      // Check user and profile
      if (!user) {
        router.replace(buildSignInUrl(returnUrl));
      } else if (!listerProfile) {
        router.replace("/auth/profile-setup");
      }
    }
  }, [
    hydrated,
    user,
    listerProfile,
    userLoading,
    listerProfileLoading,
    sessionToken,
    requiresMfa,
    token,
    router,
    returnUrl,
  ]);

  if (!hydrated) {
    return <FullPageLoader />;
  }

  // Show loader if in MFA state
  if (sessionToken && requiresMfa) {
    return <FullPageLoader />;
  }

  if (userLoading || listerProfileLoading) {
    return <FullPageLoader />;
  }

  if (!user || !listerProfile) {
    return <FullPageLoader />;
  }

  return (
    <>
      {/* <ProfileFromStore /> */}
      {children}
    </>
  );
}
