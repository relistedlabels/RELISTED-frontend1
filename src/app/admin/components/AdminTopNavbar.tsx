"use client";

import React from "react";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdminIdStore } from "@/store/useAdminIdStore";
import { useUserStore } from "@/store/useUserStore";

interface AdminTopNavbarProps {
  onLogout?: () => void;
}

export default function AdminTopNavbar({ onLogout }: AdminTopNavbarProps) {
  const router = useRouter();
  const adminId = useAdminIdStore((state) => state.adminId);
  const { clearUser } = useUserStore();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    clearUser();
    if (adminId) {
      router.push(`/admin/${adminId}/auth/login`);
    } else {
      router.push("/auth/sign-in");
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between z-40 shadow-sm">
      {/* Logo */}
      <div className="flex items-center">
        <h1 className="text-lg font-bold text-gray-900">RELISTED LABELS</h1>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
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
