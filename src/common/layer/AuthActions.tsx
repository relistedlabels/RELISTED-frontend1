"use client";

import { useMe } from "@/lib/queries/auth/useMe";
import Button from "../ui/Button";
import UserProfileDropdown from "./UserProfileDropdown";

export function AuthActions() {
  const { data: user, isLoading } = useMe();

  // Avoid flicker while auth state is resolving
  if (isLoading) return null;

  // ✅ Logged in → show User Profile Dropdown
  if (user) {
    return (
      <UserProfileDropdown
        userName={user.name}
        userAvatar={null}
        userRole={user.role?.toLowerCase() === "lister" ? "lister" : "renter"}
      />
    );
  }

  // ❌ Not logged in → show Sign In / Sign Up
  return (
    <div className="flex gap-[9px] items-center">
      <Button
        text="Sign In"
        isLink={true}
        href="/auth/sign-in"
        backgroundColor="bg-transparent"
        border="border border-white"
        color="text-white"
      />
      <Button
        text="Sign Up"
        isLink={true}
        href="/auth/create-account"
        backgroundColor="bg-white"
        color="text-black hover:text-white"
        border="border border-white"
      />
    </div>
  );
}
