"use client";

import React from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "./dashboard/components/AdminSidebar";
import AdminTopNavbar from "./components/AdminTopNavbar";
import { useLogout } from "@/lib/mutations";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const router = useRouter();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => router.push("/auth/sign-in"),
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <AdminTopNavbar onLogout={handleLogout} />
      <AdminSidebar
        userAvatarUrl="https://i.pravatar.cc/150?img=30"
        userName="Jane Graham"
        userRole="ADMIN"
        onLogout={handleLogout}
      />

      <main className="flex-1 bg-white p-2 sm:p-8 pt-20 sm:pt-[100px] hide-scrollbar overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
