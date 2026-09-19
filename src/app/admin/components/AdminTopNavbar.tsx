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
    <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between z-40 ">
      {/* Logo */}
      <div className="flex items-center">
        <h1 className="text-lg font-bold text-gray-900">RELISTED LABELS</h1>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {adminId ? (
          <NotificationBell
            href={`/admin/${adminId}/notifications`}
            iconClassName="h-5 w-5 text-gray-700"
            badgeClassName="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"
          />
        ) : null}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </div>
  );
}
