"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/lib/queries/auth/useMe";
import { useProfile } from "@/lib/queries/user/useProfile";
import { useUserStore } from "@/store/useUserStore";
import FullPageLoader from "@/common/ui/FullPageLoader";
import ProfileFromStore from "@/common/ui/ProfileFromStore";

export default function CuratorsLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { sessionToken, requiresMfa, token } = useUserStore();

  const { data: user, isLoading: userLoading, isError: userError } = useMe();
  const { data: profile, isLoading: profileLoading } = useProfile();

  useEffect(() => {
    // If user is in MFA state, redirect to verify MFA
    if (sessionToken && requiresMfa) {
      router.replace("/auth/verify-mfa");
      return;
    }

    if (!userLoading && !profileLoading) {
      // If no token at all, redirect to sign in
      if (!token) {
        router.replace("/auth/sign-in");
        return;
      }

      // Check user and profile
      if (!user) {
        router.replace("/auth/sign-in");
      } else if (!profile) {
        router.replace("/auth/profile-setup");
      }
    }
  }, [
    user,
    profile,
    userLoading,
    profileLoading,
    sessionToken,
    requiresMfa,
    token,
    router,
  ]);

  // Show loader if in MFA state
  if (sessionToken && requiresMfa) {
    return <FullPageLoader />;
  }

  if (userLoading || profileLoading) {
    return <FullPageLoader />;
  }

  if (!user || !profile) {
    return <FullPageLoader />;
  }

  return (
    <>
      {/* <ProfileFromStore /> */}
      {children}
    </>
  );
}
