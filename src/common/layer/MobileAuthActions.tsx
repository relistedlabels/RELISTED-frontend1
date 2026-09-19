"use client";

import type { ComponentType } from "react";
import {
  AlertCircle,
  LayoutDashboard,
  LogOut,
  Settings,
  ShoppingBag,
  User,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLogout } from "@/lib/mutations";
import { useMe } from "@/lib/queries/auth/useMe";
import { useListerProfile } from "@/lib/queries/listers/useListerProfile";
import { useProfile as useRenterProfile } from "@/lib/queries/renters/useProfile";
import { useAdminIdStore } from "@/store/useAdminIdStore";
import { Paragraph1 } from "../ui/Text";
import LogoutConfirmModal from "./LogoutConfirmModal";
import { cloudinaryOptimizedImageUrl } from "@/lib/media/cloudinaryOptimizedImageUrl";

interface MobileAuthActionsProps {
  onClose?: () => void;
}

function MobileAccountLink({
  href,
  label,
  icon: Icon,
  onClick,
  iconClassName = "text-gray-400",
  labelClassName = "text-white",
}: {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  onClick: () => void;
  iconClassName?: string;
  labelClassName?: string;
}) {
  return (
    <Link href={href} onClick={onClick}>
      <span className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-gray-900">
        <Icon size={18} className={iconClassName} aria-hidden />
        <Paragraph1 className={`text-sm ${labelClassName}`}>{label}</Paragraph1>
      </span>
    </Link>
  );
}

export function MobileAuthActions({ onClose }: MobileAuthActionsProps) {
  const { data: user, isLoading } = useMe();
  const isLister = user?.role?.toLowerCase() === "lister";
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  const { data: listerProfileData } = useListerProfile(isLister);
  const { data: renterProfileData } = useRenterProfile(
    Boolean(user) && !isLister && !isAdmin,
  );
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const adminId = useAdminIdStore((s) => s.adminId);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [signInRedirectUrl, setSignInRedirectUrl] = useState(pathname);
  const router = useRouter();

  useEffect(() => {
    const qs = searchParams.toString();
    setSignInRedirectUrl(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, searchParams]);
  const logout = useLogout();

  if (isLoading) return null;

  const handleLinkClick = () => {
    onClose?.();
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    logout.mutate(undefined, {
      onSuccess: () => {
        router.replace("/auth/sign-in");
      },
    });
  };

  const getSettingsRoute = () => {
    if (!user) return "/renters/account";
    switch (user.role) {
      case "LISTER":
        return "/renters/account";
      case "ADMIN":
        return adminId ? `/admin/${adminId}/settings` : "/auth/sign-in";
      case "DRESSER":
      default:
        return "/renters/account";
    }
  };

  const getWalletRoute = () => {
    if (!user) return "/renters/wallet";
    switch (user.role) {
      case "LISTER":
        return "/renters/wallet";
      case "ADMIN":
        return adminId ? `/admin/${adminId}/wallets` : "/auth/sign-in";
      case "DRESSER":
      default:
        return "/renters/wallet";
    }
  };

  const getOrdersRoute = () => {
    if (!user) return "/renters/orders";
    switch (user.role) {
      case "LISTER":
        return "/renters/orders";
      case "ADMIN":
        return adminId ? `/admin/${adminId}/orders` : "/auth/sign-in";
      case "DRESSER":
      default:
        return "/renters/orders";
    }
  };

  const getDisputeRoute = () => {
    if (!user) return "/renters/dispute";
    switch (user.role) {
      case "LISTER":
        return "/renters/dispute";
      case "ADMIN":
        return adminId ? `/admin/${adminId}/disputes` : "/auth/sign-in";
      case "DRESSER":
      default:
        return "/renters/dispute";
    }
  };

  if (user) {
    let userAvatar: string | null = null;

    if (user.role?.toLowerCase() === "lister") {
      userAvatar = listerProfileData?.data?.profile?.profileImage || null;
    } else {
      userAvatar = renterProfileData?.profile?.profileImage || null;
    }

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-gray-600 to-gray-800">
            {userAvatar ? (
              <img
                src={cloudinaryOptimizedImageUrl(userAvatar, {
                  preset: "thumb",
                })}
                alt={user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <User size={20} className="text-white" aria-hidden />
            )}
          </div>
          <div className="text-left">
            <Paragraph1 className="text-sm font-semibold text-white">
              {user.name}
            </Paragraph1>
            <Paragraph1 className="text-xs capitalize text-gray-400">
              {user.role}
            </Paragraph1>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {user.role === "LISTER" ? (
            <MobileAccountLink
              href="/listers/dashboard"
              label="Lister Dashboard"
              icon={LayoutDashboard}
              onClick={handleLinkClick}
            />
          ) : null}
          <MobileAccountLink
            href={getSettingsRoute()}
            label="Settings"
            icon={Settings}
            onClick={handleLinkClick}
          />
          <MobileAccountLink
            href={getWalletRoute()}
            label="Wallet"
            icon={Wallet}
            onClick={handleLinkClick}
          />
          <MobileAccountLink
            href={getOrdersRoute()}
            label="Orders"
            icon={ShoppingBag}
            onClick={handleLinkClick}
          />
          <MobileAccountLink
            href={getDisputeRoute()}
            label="Disputes"
            icon={AlertCircle}
            onClick={handleLinkClick}
          />
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            disabled={logout.isPending}
            className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-gray-900 disabled:opacity-50"
          >
            <LogOut size={18} className="text-red-500" aria-hidden />
            <Paragraph1 className="text-sm text-red-500">
              {logout.isPending ? "Logging out..." : "Logout"}
            </Paragraph1>
          </button>
        </div>

        <LogoutConfirmModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogoutConfirm}
          isLoading={logout.isPending}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Link
        href={`/auth/sign-in?redirect=${encodeURIComponent(signInRedirectUrl)}`}
        onClick={handleLinkClick}
      >
        <button
          type="button"
          className="w-full rounded-lg border border-white px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-900"
        >
          Sign In
        </button>
      </Link>
      <Link href="/auth/create-account" onClick={handleLinkClick}>
        <button
          type="button"
          className="w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-100"
        >
          Sign Up
        </button>
      </Link>
    </div>
  );
}
