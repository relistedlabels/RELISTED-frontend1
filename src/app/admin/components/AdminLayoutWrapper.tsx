"use client";

import React, { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import AdminTopNavbar from "./AdminTopNavbar";
import { useLogout } from "@/lib/mutations";
import { useAdminIdStore } from "@/store/useAdminIdStore";
import MobileDesktopRecommendation from "@/common/ui/MobileDesktopRecommendation";

interface AdminLayoutWrapperProps {
  children: ReactNode;
}

export default function AdminLayoutWrapper({
  children,
}: AdminLayoutWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const adminId = useAdminIdStore((state) => state.adminId);
  const logout = useLogout();

  // Check if we're on an auth route
  const isAuthRoute = pathname.includes("/auth");

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        if (adminId) {
          router.push(`/admin/${adminId}/auth/login`);
        } else {
          router.push("/auth/sign-in");
        }
      },
    });
  };

  // For auth routes, just show the children without navbar/sidebar
  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <MobileDesktopRecommendation />
      <AdminTopNavbar onLogout={handleLogout} />
      <AdminSidebar onLogout={handleLogout} />

      <main className="flex-1 bg-white p-2 sm:p-8 pt-20 sm:pt-[100px] hide-scrollbar overflow-auto">
        {children}
      </main>
    </div>
  );
}
