"use client";

import { useMe } from "@/lib/queries/auth/useMe";
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

interface MobileAuthActionsProps {
  onClose?: () => void;
}

export function MobileAuthActions({ onClose }: MobileAuthActionsProps) {
  const { data: user, isLoading } = useMe();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { clearUser } = useUserStore();

  // Avoid flicker while auth state is resolving
  if (isLoading) return null;

  const handleLinkClick = () => {
    setIsDropdownOpen(false);
    onClose?.();
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
    return (
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-between gap-3  "
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div className="text-left">
              <Paragraph1 className="font-semibold text-white text-sm">
                {user.name}
              </Paragraph1>
              <Paragraph1 className="text-xs text-gray-400 capitalize">
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
                <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors text-left">
                  <LayoutDashboard size={18} className="text-gray-400" />
                  <Paragraph1 className="text-sm text-white">
                    Lister Dashboard
                  </Paragraph1>
                </button>
              </Link>
            )}{" "}
            <Link href={getSettingsRoute()} onClick={handleLinkClick}>
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors text-left">
                <Settings size={18} className="text-gray-400" />
                <Paragraph1 className="text-sm text-white">Settings</Paragraph1>
              </button>
            </Link>
            <Link href={getWalletRoute()} onClick={handleLinkClick}>
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors text-left">
                <Wallet size={18} className="text-gray-400" />
                <Paragraph1 className="text-sm text-white">Wallet</Paragraph1>
              </button>
            </Link>
            <Link href={getOrdersRoute()} onClick={handleLinkClick}>
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors text-left">
                <ShoppingBag size={18} className="text-gray-400" />
                <Paragraph1 className="text-sm text-white">Orders</Paragraph1>
              </button>
            </Link>
            <Link href={getDisputeRoute()} onClick={handleLinkClick}>
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors text-left">
                <AlertCircle size={18} className="text-gray-400" />
                <Paragraph1 className="text-sm text-white">Disputes</Paragraph1>
              </button>
            </Link>
            <button
              onClick={() => {
                clearUser();
                handleLinkClick();
              }}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors text-left"
            >
              <LogOut size={18} className="text-red-500" />
              <Paragraph1 className="text-sm text-red-500">Logout</Paragraph1>
            </button>
          </div>
        )}
      </div>
    );
  }

  // ❌ Not logged in → show Sign In / Sign Up stacked
  return (
    <div className="flex flex-col gap-3">
      <Link href="/auth/sign-in" onClick={handleLinkClick}>
        <button className="w-full px-4 py-2 border border-white text-white rounded-lg hover:bg-gray-900 transition-colors font-medium text-sm">
          Sign In
        </button>
      </Link>
      <Link href="/auth/create-account" onClick={handleLinkClick}>
        <button className="w-full px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm">
          Sign Up
        </button>
      </Link>
    </div>
  );
}
