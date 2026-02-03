"use client";

import { useMe } from "@/lib/queries/auth/useMe";
import { useLogout } from "@/lib/mutations";
import Button from "../ui/Button";

export function AuthActions() {
  const { data: user, isLoading } = useMe();
  const logout = useLogout();

  // Avoid flicker while auth state is resolving
  if (isLoading) return null;

  // ✅ Logged in → show Logout
  if (user) {
    return (
      <Button
        text={logout.isPending ? "Logging out..." : "Log out"}
        onClick={() => logout.mutate()}
        backgroundColor="bg-transparent"
        border="border border-white"
        color="text-white"
        disabled={logout.isPending}
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
