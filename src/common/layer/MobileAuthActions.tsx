"use client";

import { useMe } from "@/lib/queries/auth/useMe";
import { useListerProfile } from "@/lib/queries/listers/useListerProfile";
import { useProfile as useRenterProfile } from "@/lib/queries/renters/useProfile";
import { useLogout } from "@/lib/mutations";
import { useState } from "react";
import {
  ChevronDown,
  LogOut,
  Settings,
  User,
  Wallet,
  ShoppingBag,
  AlertCircle,
  LayoutDashboard,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import Link from "next/link";
import { Paragraph1 } from "../ui/Text";
import { usePathname } from "next/navigation";
import LogoutConfirmModal from "./LogoutConfirmModal";
import { useRouter } from "next/navigation";

interface MobileAuthActionsProps {
  onClose?: () => void;
}

export function MobileAuthActions({ onClose }: MobileAuthActionsProps) {
  const { data: user, isLoading } = useMe();
  const isLister = user?.role?.toLowerCase() === "lister";
  const { data: listerProfileData } = useListerProfile(isLister);
  const { data: renterProfileData } = useRenterProfile(!isLister);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { clearUser } = useUserStore();
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();

  // Avoid flicker while auth state is resolving
  if (isLoading) return null;

  const handleLinkClick = () => {
    setIsDropdownOpen(false);
    onClose?.();
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    setIsDropdownOpen(false);
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
        return "/admin/dashboard";
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
        return "/admin/dashboard";
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
        return "/admin/orders";
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
        return "/admin/disputes";
      case "DRESSER":
      default:
        return "/renters/dispute";
    }
  };

  // ✅ Logged in → show User Name and Dropdown
  if (user) {
    // ✅ Determine avatar based on user role
    let userAvatar: string | null = null;

    if (user.role?.toLowerCase() === "lister") {
      userAvatar = listerProfileData?.data?.profile?.profileImage || null;
    } else {
      userAvatar = renterProfileData?.profile?.profileImage || null;
    }

    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex justify-between items-center gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex justify-center items-center bg-gradient-to-br from-gray-600 to-gray-800 rounded-full w-10 h-10 overflow-hidden">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={20} className="text-white" />
              )}
            </div>
            <div className="text-left">
              <Paragraph1 className="font-semibold text-white text-sm">
                {user.name}
              </Paragraph1>
              <Paragraph1 className="text-gray-400 text-xs capitalize">
                {user.role}
              </Paragraph1>
            </div>
          </div>
          <ChevronDown
            size={18}
            className={`text-gray-400 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="flex flex-col gap-2 px-2">
            {user.role === "LISTER" && (
              <Link href="/listers/dashboard" onClick={handleLinkClick}>
                <button className="flex items-center gap-3 hover:bg-gray-900 px-4 py-2 rounded-lg w-full text-left transition-colors">
                  <LayoutDashboard size={18} className="text-gray-400" />
                  <Paragraph1 className="text-white text-sm">
                    Lister Dashboard
                  </Paragraph1>
                </button>
              </Link>
            )}{" "}
            <Link href={getSettingsRoute()} onClick={handleLinkClick}>
              <button className="flex items-center gap-3 hover:bg-gray-900 px-4 py-2 rounded-lg w-full text-left transition-colors">
                <Settings size={18} className="text-gray-400" />
                <Paragraph1 className="text-white text-sm">Settings</Paragraph1>
              </button>
            </Link>
            <Link href={getWalletRoute()} onClick={handleLinkClick}>
              <button className="flex items-center gap-3 hover:bg-gray-900 px-4 py-2 rounded-lg w-full text-left transition-colors">
                <Wallet size={18} className="text-gray-400" />
                <Paragraph1 className="text-white text-sm">Wallet</Paragraph1>
              </button>
            </Link>
            <Link href={getOrdersRoute()} onClick={handleLinkClick}>
              <button className="flex items-center gap-3 hover:bg-gray-900 px-4 py-2 rounded-lg w-full text-left transition-colors">
                <ShoppingBag size={18} className="text-gray-400" />
                <Paragraph1 className="text-white text-sm">Orders</Paragraph1>
              </button>
            </Link>
            <Link href={getDisputeRoute()} onClick={handleLinkClick}>
              <button className="flex items-center gap-3 hover:bg-gray-900 px-4 py-2 rounded-lg w-full text-left transition-colors">
                <AlertCircle size={18} className="text-gray-400" />
                <Paragraph1 className="text-white text-sm">Disputes</Paragraph1>
              </button>
            </Link>
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                setShowLogoutConfirm(true);
              }}
              disabled={logout.isPending}
              className="flex items-center gap-3 hover:bg-gray-900 disabled:opacity-50 px-4 py-2 rounded-lg w-full text-left transition-colors"
            >
              <LogOut size={18} className="text-red-500" />
              <Paragraph1 className="text-red-500 text-sm">
                {logout.isPending ? "Logging out..." : "Logout"}
              </Paragraph1>
            </button>
          </div>
        )}

        {/* Logout Confirmation Modal */}
        <LogoutConfirmModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogoutConfirm}
          isLoading={logout.isPending}
        />
      </div>
    );
  }

  // ❌ Not logged in → show Sign In / Sign Up stacked
  const redirectUrl = `${pathname}${typeof window !== "undefined" ? window.location.search : ""}`;
  return (
    <div className="flex flex-col gap-3">
      <Link
        href={`/auth/sign-in?redirect=${encodeURIComponent(redirectUrl)}`}
        onClick={handleLinkClick}
      >
        <button className="hover:bg-gray-900 px-4 py-2 border border-white rounded-lg w-full font-medium text-white text-sm transition-colors">
          Sign In
        </button>
      </Link>
      <Link href={`/auth/create-account`} onClick={handleLinkClick}>
        <button className="bg-white hover:bg-gray-100 px-4 py-2 rounded-lg w-full font-medium text-black text-sm transition-colors">
          Sign Up
        </button>
      </Link>
    </div>
  );
}
