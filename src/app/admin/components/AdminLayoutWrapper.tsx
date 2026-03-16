"use client";

import React, { ReactNode, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { X, LogOut } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import AdminTopNavbar from "./AdminTopNavbar";
import SessionExpiredModal from "./SessionExpiredModal";
import { useLogout } from "@/lib/mutations";
import { useAdminIdStore } from "@/store/useAdminIdStore";
import MobileDesktopRecommendation from "@/common/ui/MobileDesktopRecommendation";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";

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
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Check if we're on an auth route
  const isAuthRoute = pathname.includes("/auth");

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        setShowLogoutModal(false);
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
      <SessionExpiredModal />
      <MobileDesktopRecommendation />
      <AdminTopNavbar onLogout={handleLogout} />
      <AdminSidebar onLogout={handleLogout} />

      <main className="flex-1 bg-white p-2 sm:p-8 pt-20 sm:pt-[100px] hide-scrollbar overflow-auto">
        {children}
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogoutModal(false)}
            className="absolute inset-0 bg-black/50"
          />

          {/* Modal - Center */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <Paragraph2 className="text-gray-900 font-bold">
                  Logout
                </Paragraph2>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <Paragraph1 className="text-gray-600 mb-6">
                Are you sure you want to logout? You'll be redirected to the
                login page.
              </Paragraph1>

              <div className="space-y-3">
                <button
                  onClick={confirmLogout}
                  disabled={logout.isPending}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 transition flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  <Paragraph1 className="text-white">
                    {logout.isPending ? "Logging out..." : "Logout"}
                  </Paragraph1>
                </button>

                <button
                  onClick={() => setShowLogoutModal(false)}
                  disabled={logout.isPending}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 transition"
                >
                  <Paragraph1 className="text-gray-900">Cancel</Paragraph1>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
