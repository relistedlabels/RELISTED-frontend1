"use client";

import { ChevronDown, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useMe } from "@/lib/queries/auth/useMe";
import { useAdminIdStore } from "@/store/useAdminIdStore";
import AdminBrand from "./AdminBrand";
import AdminSearchBar from "./AdminSearchBar";

interface AdminTopNavbarProps {
  onLogout?: () => void;
  onMenuClick?: () => void;
}

const getInitials = (name: string): string => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length > 0) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return "";
};

const getAvatarBgColor = (name: string): string => {
  const colors = [
    "bg-red-400",
    "bg-blue-400",
    "bg-green-400",
    "bg-yellow-400",
    "bg-purple-400",
    "bg-pink-400",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function AdminTopNavbar({
  onLogout,
  onMenuClick,
}: AdminTopNavbarProps) {
  const adminId = useAdminIdStore((state) => state.adminId);
  const { data: user } = useMe();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    setShowUserMenu(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center gap-3 border-b border-gray-200 bg-white px-4 sm:px-6">
      {/* Left: Burger menu (mobile only) */}
      <button
        type="button"
        onClick={onMenuClick}
        className="-ml-2 flex-shrink-0 rounded-lg p-2 text-gray-700 transition-colors hover:bg-gray-100 lg:hidden"
        aria-label="Open navigation menu"
      >
        <Menu size={20} />
      </button>

      <AdminBrand className="hidden sm:flex" />

      {/* Center: Search Bar */}
      <div className="flex min-w-0 flex-1 justify-center px-2 sm:px-6">
        <div className="w-full max-w-md">
          <AdminSearchBar />
        </div>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex flex-shrink-0 items-center gap-3">
        {adminId ? (
          <NotificationBell
            href={`/admin/${adminId}/notifications`}
            iconClassName="h-5 w-5 text-gray-700"
            badgeClassName="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500"
          />
        ) : null}

        {/* User Profile Section with Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-gray-100"
          >
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${getAvatarBgColor(
                user?.name || "",
              )}`}
            >
              {getInitials(user?.name || "")}
            </div>
            <div className="hidden min-w-0 text-left sm:block">
              <p className="truncate text-[13px] font-semibold leading-tight text-gray-900">
                {user?.name || "Admin"}
              </p>
              <p className="text-[11px] leading-tight text-gray-500">Admin</p>
            </div>
            <ChevronDown
              size={16}
              className="hidden flex-shrink-0 text-gray-400 sm:block"
            />
          </button>

          {/* User Dropdown Menu */}
          {showUserMenu && (
            <>
              <button
                type="button"
                aria-label="Close user menu"
                className="fixed inset-0 z-30 cursor-default"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full z-40 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
