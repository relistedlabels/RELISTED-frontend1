

"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/lib/queries/auth/useMe";
import { useProfile } from "@/lib/queries/user/useProfile";
import FullPageLoader from "@/common/ui/FullPageLoader";
import ProfileFromStore from "@/common/ui/ProfileFromStore";

export default function CuratorsLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const { data: user, isLoading: userLoading } = useMe();
  const { data: profile, isLoading: profileLoading } = useProfile();

  useEffect(() => {
    if (!userLoading && !profileLoading) {
      if (!user) {
        router.replace("/auth/sign-in");
      } else if (!profile) {
        router.replace("/auth/profile-setup");
      }
    }
  }, [user, profile, userLoading, profileLoading, router]);

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
