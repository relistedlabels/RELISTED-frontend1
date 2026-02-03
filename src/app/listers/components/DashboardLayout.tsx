"use client";

import React, { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import {
  Bell,
  Menu,
  X,
  FileText,
  Settings,
  LogOut,
  HelpCircle,
  Mail,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
  LucideIcon,
  ChevronDown,
} from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useLogout } from "@/lib/mutations";
import {
  Header2Plus,
  HeaderAny,
  Paragraph1,
  Paragraph3,
} from "@/common/ui/Text";
import { UserProfileBadge } from "./UserProfileBadge";
import { UserProfileBadge2 } from "./UserProfileBadge2";

// --------------------
// Types
// --------------------
export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  isActive?: boolean;
};

export type UserProfile = {
  name: string;
  role?: string;
  avatarUrl?: string;
};

interface DashboardLayoutProps {
  children: ReactNode;
  brand?: string;
}

// --------------------
// Reusable Sidebar Nav
// --------------------
const SidebarNav: React.FC<{
  navItems: NavItem[];
  onItemClick?: () => void;
}> = ({ navItems, onItemClick }) => {
  return (
    <nav className="space-y-2">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          onClick={onItemClick}
          className={`flex items-center p-3 rounded-xl transition duration-150 ${
            item.isActive
              ? "bg-white text-black font-semibold"
              : "text-gray-300 hover:bg-gray-800"
          }`}
        >
          <item.icon className="w-5 h-5 mr-3" />
          <Paragraph1 className="text-sm">{item.name}</Paragraph1>
        </Link>
      ))}
    </nav>
  );
};

// --------------------
// Sidebar Footer
// --------------------
const SidebarFooter = ({
  onLogoutClick,
  isLoggingOut = false,
}: {
  onLogoutClick: () => void;
  isLoggingOut?: boolean;
}) => {
  return (
    <div className="mt-8 space-y-2 border-t border-gray-800 pt-6">
      <button
        type="button"
        onClick={onLogoutClick}
        disabled={isLoggingOut}
        className="flex items-center w-full p-3 rounded-xl text-gray-300 hover:bg-gray-800 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LogOut className="w-5 h-5 mr-3" />
        <Paragraph1 className="text-sm">
          {isLoggingOut ? "Logging out..." : "Log Out"}
        </Paragraph1>
      </button>
      <Link
        href="/contact-us"
        className="flex items-center p-3 text-gray-500 text-xs mt-4"
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        <Paragraph1 className="text-xs">Help & Support</Paragraph1>
      </Link>
    </div>
  );
};

// --------------------
// Main Layout
// --------------------
const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  brand = "DASHBOARD",
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const clearUser = useUserStore((s) => s.clearUser);
  const logout = useLogout();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        clearUser();
        setShowLogoutModal(false);
        router.push("/auth/sign-in");
      },
      onError: () => {
        setShowLogoutModal(false);
      },
    });
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
  };

  // TODO: replace this mock with real auth/user hook (Supabase, Firebase, API, etc.)
  const user: UserProfile = {
    name: "Jane Graham",
    role: "- CURATOR -",
    avatarUrl: "https://i.pravatar.cc/150?u=jane",
  };

  // Centralized navigation (NOT passed from parents)
  const navItems: NavItem[] = [
    // {
    //   name: "Overview",
    //   href: "/listers/dashboard",
    //   icon: LayoutDashboard,
    //   isActive: pathname === "/listers/dashboard",
    // },
    {
      name: "Inventory",
      href: "/listers/inventory",
      icon: Package,
      isActive: pathname.startsWith("/listers/inventory"),
    },
    // {
    //   name: "Orders",
    //   href: "/listers/orders",
    //   icon: ShoppingCart,
    //   isActive: pathname.startsWith("/listers/orders"),
    // },
    // {
    //   name: "Wallet",
    //   href: "/listers/wallet",
    //   icon: Wallet,
    //   isActive: pathname.startsWith("/listers/wallet"),
    // },

    // {
    //   name: "Dispute",
    //   href: "/listers/dispute",
    //   icon: FileText,
    //   isActive: pathname.startsWith("/listers/dispute"),
    // },
  ];

  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen((p) => !p);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen overflow-hidden hide-scrollbar  overflow-y-auto bg-[#241F20] text-white p-6 sticky top-0">
        <HeaderAny className="text-[20px]  mb-10 uppercase">
          Relisted labels
        </HeaderAny>

        <Paragraph3 className=" text-white"> Early Access</Paragraph3>

        {/* Profile */}
        <div className="flex items-center border-b border-gray-800 pb-4 mb-4 space-x-3">
          <UserProfileBadge />
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar">
          <SidebarNav navItems={navItems} />
        </div>

        <SidebarFooter
          onLogoutClick={() => setShowLogoutModal(true)}
          isLoggingOut={logout.isPending}
        />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-black text-white p-6 transform transition-transform md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-start mb-8">
          {/* <Paragraph3 className="text-xl font-bold">{brand}</Paragraph3> */}
          <HeaderAny className="text-[16px]   uppercase">
            Relisted labels
          </HeaderAny>

          <button onClick={toggleMobile}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex items-center border-b border-gray-800 pb-4 mb-4 space-x-3">
          <UserProfileBadge />
        </div>
        <SidebarNav navItems={navItems} onItemClick={toggleMobile} />
        <SidebarFooter
          onLogoutClick={() => setShowLogoutModal(true)}
          isLoggingOut={logout.isPending}
        />
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggleMobile}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 sm:px-8 h-16 bg-[#241F20]">
          <div className="md:hidden">
            <button onClick={toggleMobile}>
              <Menu className="w-6 h-6 text-white" />
            </button>
          </div>

          <div />

          <Paragraph3 className=" text-white"> Early Access</Paragraph3>

          <div className="flex- hidden items-center gap-4">
            <Mail className="w-5 h-5 text-white cursor-pointer" />
            <Bell className="w-5 h-5 text-white cursor-pointer" />

            <UserProfileBadge2 />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 h-[90vh] max-h-[90vh] overflow-hidden overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Motion Popup Modal - Rendered at top level */}
      <AnimatePresence>
        {showLogoutModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelLogout}
              style={{ zIndex: 9998 }}
              className="fixed inset-0 bg-black/50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              style={{ zIndex: 9999 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4"
            >
              <Paragraph3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm Logout
              </Paragraph3>
              <Paragraph1 className="text-gray-600 text-sm mb-6">
                Are you sure you want to log out? You'll need to sign in again
                to access your account.{" "}
              </Paragraph1>

              {/* Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleCancelLogout}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleConfirmLogout}
                  disabled={logout.isPending}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {logout.isPending ? "Logging out..." : "Logout"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;
