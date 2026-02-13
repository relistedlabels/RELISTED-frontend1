"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/lib/queries/auth/useMe";
import { useListerProfile } from "@/lib/queries/listers/useListerProfile";
import { useUserStore } from "@/store/useUserStore";
import FullPageLoader from "@/common/ui/FullPageLoader";
import ProfileFromStore from "@/common/ui/ProfileFromStore";

export default function CuratorsLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { sessionToken, requiresMfa, token } = useUserStore();

  const { data: user, isLoading: userLoading, isError: userError } = useMe();
  const {
    data: listerProfile,
    isLoading: listerProfileLoading,
    isError: listerProfileError,
  } = useListerProfile();

  useEffect(() => {
    // If user is in MFA state, redirect to verify MFA
    if (sessionToken && requiresMfa) {
      router.replace("/auth/verify-mfa");
      return;
    }

    if (!userLoading && !listerProfileLoading) {
      // If no token at all, redirect to sign in
      if (!token) {
        router.replace("/auth/sign-in");
        return;
      }

      // Check user and profile
      if (!user) {
        router.replace("/auth/sign-in");
      } else if (!listerProfile) {
        router.replace("/auth/profile-setup");
      }
    }
  }, [
    user,
    listerProfile,
    userLoading,
    listerProfileLoading,
    sessionToken,
    requiresMfa,
    token,
    router,
  ]);

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
