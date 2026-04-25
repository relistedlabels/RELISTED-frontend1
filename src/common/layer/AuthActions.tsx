"use client";

import { usePathname } from "next/navigation";
import { useMe } from "@/lib/queries/auth/useMe";
import { useListerProfile } from "@/lib/queries/listers/useListerProfile";
import { useProfile as useRenterProfile } from "@/lib/queries/renters/useProfile";
import Button from "../ui/Button";
import UserProfileDropdown from "./UserProfileDropdown";

export function AuthActions() {
  const { data: user, isLoading } = useMe();
  const isLister = user?.role?.toLowerCase() === "lister";
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const { data: listerProfileData } = useListerProfile(isLister);
  const { data: renterProfileData } = useRenterProfile(
    Boolean(user) && !isLister && !isAdmin,
  );
  const pathname = usePathname();

  // Avoid flicker while auth state is resolving
  if (isLoading) return null;

  // ✅ Logged in → show User Profile Dropdown
  if (user) {
    // Determine avatar based on user role
    let userAvatar: string | null = null;

    if (user.role?.toLowerCase() === "lister") {
      userAvatar = listerProfileData?.data?.profile?.profileImage || null;
    } else {
      userAvatar = renterProfileData?.profile?.profileImage || null;
    }

    return (
      <UserProfileDropdown
        userName={user.name}
        userAvatar={userAvatar}
        userRole={user.role?.toLowerCase() === "lister" ? "lister" : "renter"}
      />
    );
  }

  // ❌ Not logged in → show Sign In / Sign Up
  const redirectUrl = `${pathname}${typeof window !== "undefined" ? window.location.search : ""}`;
  return (
    <div className="flex items-center gap-[9px]">
      <Button
        text="Sign In"
        isLink={true}
        href={`/auth/sign-in?redirect=${encodeURIComponent(redirectUrl)}`}
        backgroundColor="bg-transparent"
        border="border border-white"
        color="text-white"
      />
      <Button
        text="Sign Up"
        isLink={true}
        href={`/auth/create-account`}
        backgroundColor="bg-white"
        color="text-black hover:text-white"
        border="border border-white"
      />
    </div>
  );
}
