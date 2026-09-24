"use client";

import React from "react";
import { LogOut } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useAdminIdStore } from "@/store/useAdminIdStore";

interface AdminTopNavbarProps {
  onLogout?: () => void;
}

export default function AdminTopNavbar({ onLogout }: AdminTopNavbarProps) {
  const adminId = useAdminIdStore((state) => state.adminId);
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-3 sm:h-16 sm:px-8">
      <div className="flex min-w-0 items-center">
        <h1 className="truncate text-sm font-bold text-gray-900 sm:text-lg">
          RELISTED LABELS
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {adminId ? (
          <NotificationBell
            href={`/admin/${adminId}/notifications`}
            iconClassName="h-5 w-5 text-gray-700"
            badgeClassName="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"
          />
        ) : null}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 sm:px-4"
          aria-label="Log out"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>
    </div>
  );
}
