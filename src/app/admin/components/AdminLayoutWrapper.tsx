"use client";

import React, { ReactNode, useEffect, useMemo, useState } from "react";
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
import { useCheckDashboardSelection } from "@/lib/queries/auth/useCheckDashboardSelection";
import {
  adminIdFromPathname,
  getAdminLoginPath,
} from "@/lib/auth/adminLoginPath";
import { useUserStoreHydrated } from "@/hooks/useUserStoreHydrated";
import { useUserStore } from "@/store/useUserStore";
import { useSessionStore } from "@/store/useSessionStore";

interface AdminLayoutWrapperProps {
  children: ReactNode;
}

function AdminLoadingShell({
  showSessionExpired,
}: {
  showSessionExpired: boolean;
}) {
  return (
    <>
      {showSessionExpired ? <SessionExpiredModal /> : null}
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
      </div>
    </>
  );
}

export default function AdminLayoutWrapper({
  children,
}: AdminLayoutWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useUserStoreHydrated();
  const token = useUserStore((state) => state.token);
  const isSessionExpired = useSessionStore((state) => state.isSessionExpired);
  const adminId = useAdminIdStore((state) => state.adminId);
  const logout = useLogout();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isAuthRoute = pathname.includes("/auth");
  const adminLoginPath = useMemo(
    () => getAdminLoginPath(adminId ?? adminIdFromPathname(pathname)),
    [adminId, pathname],
  );

  const shouldVerifyAdmin = !isAuthRoute && hydrated && token !== null;

  const {
    data: dashboardSelection,
    isLoading,
    isFetched,
    error,
  } = useCheckDashboardSelection({
    enabled: shouldVerifyAdmin,
  });

  const waitingForAdminCheck =
    shouldVerifyAdmin && (isLoading || (!isFetched && !error));

  const shouldRedirectToLogin =
    hydrated &&
    !isAuthRoute &&
    !isSessionExpired &&
    (token === null ||
      (isFetched && (Boolean(error) || !dashboardSelection?.isAdmin)));

  useEffect(() => {
    if (!shouldRedirectToLogin) return;
    router.replace(adminLoginPath);
  }, [shouldRedirectToLogin, adminLoginPath, router]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    const redirectPath = adminLoginPath;
    logout.mutate(undefined, {
      onSettled: () => {
        setShowLogoutModal(false);
        router.replace(redirectPath);
      },
    });
  };

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (
    !hydrated ||
    waitingForAdminCheck ||
    shouldRedirectToLogin ||
    isSessionExpired
  ) {
    return <AdminLoadingShell showSessionExpired={isSessionExpired} />;
  }

  if (!dashboardSelection?.isAdmin) {
    return <AdminLoadingShell showSessionExpired={false} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <SessionExpiredModal />
      <MobileDesktopRecommendation />
      <AdminTopNavbar onLogout={handleLogout} />
      <AdminSidebar onLogout={handleLogout} />

      <main className="hide-scrollbar flex-1 overflow-auto bg-white p-2 pt-20 sm:p-8 sm:pt-[100px]">
        {children}
      </main>

      {showLogoutModal ? (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogoutModal(false)}
            className="absolute inset-0 bg-black/50"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <Paragraph2 className="font-bold text-gray-900">Logout</Paragraph2>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <Paragraph1 className="mb-6 text-gray-600">
                Are you sure you want to logout? You'll be redirected to the
                login page.
              </Paragraph1>

              <div className="space-y-3">
                <button
                  onClick={confirmLogout}
                  disabled={logout.isPending}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  <LogOut size={18} />
                  <Paragraph1 className="text-white">
                    {logout.isPending ? "Logging out..." : "Logout"}
                  </Paragraph1>
                </button>

                <button
                  onClick={() => setShowLogoutModal(false)}
                  disabled={logout.isPending}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-900 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  <Paragraph1 className="text-gray-900">Cancel</Paragraph1>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}
