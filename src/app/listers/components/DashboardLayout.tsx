"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarClock,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  type LucideIcon,
  Mail,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { type ReactNode, useState } from "react";
import {
  HeaderAny,
  Paragraph1,
  Paragraph3,
} from "@/common/ui/Text";
import { useLogout } from "@/lib/mutations";
import { useBusinessProfile } from "@/lib/queries/listers/useBusinessProfile";
import { useOpenAvailabilityRequestsCount } from "@/lib/queries/listers/useOpenAvailabilityRequestsCount";
import { useActiveOrdersCount } from "@/lib/queries/listers/useActiveOrdersCount";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useUserStore } from "@/store/useUserStore";
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
  badgeCount?: number;
};

interface DashboardLayoutProps {
  children: ReactNode;
}

const BrandHeader: React.FC = () => {
  const { data: businessProfileResponse } = useBusinessProfile();

  const businessName =
    businessProfileResponse?.data.businessProfile.businessName?.trim();

  // If no business name yet, show plain text brand with NO logo
  if (!businessName) {
    return (
      <HeaderAny className="text-[20px] md:text-[18px] mb-0 uppercase truncate text-white">
        Relisted labels
      </HeaderAny>
    );
  }

  // If business name exists, show logo + business name
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/images/logo.svg"
        alt="Relisted logo"
        width={28}
        height={28}
        className="rounded-full"
      />
      <HeaderAny className="text-[20px] md:text-[18px] mb-0 uppercase truncate text-white">
        {businessName}
      </HeaderAny>
    </div>
  );
};

// --------------------
// Reusable Sidebar Nav
// --------------------
const SidebarNav: React.FC<{
  navItems: NavItem[];
  onItemClick?: () => void;
}> = ({ navItems, onItemClick }) => {
  return (
    <nav>
      <Paragraph1 className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
        Menu
      </Paragraph1>
      <div className="space-y-1 pr-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={onItemClick}
            className={`group relative flex items-center px-3 py-2.5 rounded-xl transition duration-150 ${
              item.isActive
                ? "bg-white text-black font-semibold shadow-lg shadow-black/30"
                : "text-gray-400 hover:bg-white/[0.06] hover:text-white"
            }`}
          >
            <div className="flex items-center min-w-0">
              <item.icon
                className={`w-5 h-5 mr-3 shrink-0 transition-colors duration-150 ${
                  item.isActive
                    ? "text-black"
                    : "text-gray-500 group-hover:text-gray-200"
                }`}
              />
              <Paragraph1 className="text-sm whitespace-nowrap">
                {item.name}
              </Paragraph1>
            </div>
            {typeof item.badgeCount === "number" && item.badgeCount > 0 ? (
              <span
                className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold leading-none text-white ring-2 ring-[#241F20]"
                aria-label={`${item.badgeCount} pending`}
              >
                {item.badgeCount > 99 ? "99+" : item.badgeCount}
              </span>
            ) : null}
          </Link>
        ))}
      </div>
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
    <div className="mt-6 border-t border-white/10 pt-4 space-y-1">
      <button
        type="button"
        onClick={onLogoutClick}
        disabled={isLoggingOut}
        className="group flex items-center w-full px-3 py-2.5 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
      >
        <LogOut className="w-5 h-5 mr-3 shrink-0" />
        <Paragraph1 className="text-sm">
          {isLoggingOut ? "Logging out..." : "Log Out"}
        </Paragraph1>
      </button>
      <Link
        href="/contact-us"
        className="flex items-center px-3 py-2 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-white/[0.05] transition duration-150"
      >
        <HelpCircle className="w-4 h-4 mr-2 shrink-0" />
        <Paragraph1 className="text-xs">Help & Support</Paragraph1>
      </Link>
    </div>
  );
};

// --------------------
// Main Layout
// --------------------
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
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

  const { data: openRequestsCount = 0 } = useOpenAvailabilityRequestsCount();
  const { data: activeOrdersCount = 0 } = useActiveOrdersCount();

  // Centralized navigation (NOT passed from parents)
  const navItems: NavItem[] = [
    {
      name: "Overview",
      href: "/listers/dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/listers/dashboard",
    },
    {
      name: "Orders",
      href: "/listers/orders",
      icon: ShoppingCart,
      isActive: pathname.startsWith("/listers/orders"),
      badgeCount: activeOrdersCount,
    },
    {
      name: "Requests",
      href: "/listers/availability-requests",
      icon: CalendarClock,
      isActive: pathname.startsWith("/listers/availability-requests"),
      badgeCount: openRequestsCount,
    },
    {
      name: "Inventory",
      href: "/listers/inventory",
      icon: Package,
      isActive: pathname.startsWith("/listers/inventory"),
    },
    {
      name: "Inbox",
      href: "/listers/inbox",
      icon: Mail,
      isActive: pathname.startsWith("/listers/inbox"),
    },
    {
      name: "Wallet",
      href: "/listers/wallet",
      icon: Wallet,
      isActive: pathname.startsWith("/listers/wallet"),
    },

    {
      name: "Dispute",
      href: "/listers/dispute",
      icon: FileText,
      isActive: pathname.startsWith("/listers/dispute"),
    },
    {
      name: "Settings",
      href: "/listers/settings",
      icon: Settings,
      isActive: pathname.startsWith("/listers/settings"),
    },
  ];

  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen((p) => !p);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen overflow-hidden hide-scrollbar overflow-y-auto bg-[#241F20] text-white p-6 sticky top-0">
        <div className="mb-6">
          <BrandHeader />
        </div>

        {/* Profile */}
        <div className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-3 mb-6">
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
        className={`fixed inset-y-0 left-0 z-90 w-72 bg-[#241F20] text-white p-6 flex flex-col transform transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="max-w-[180px]">
            <BrandHeader />
          </div>

          <button
            onClick={toggleMobile}
            aria-label="Close menu"
            className="p-2 -mr-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition duration-150"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-3 mb-6">
          <UserProfileBadge />
        </div>
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          <SidebarNav navItems={navItems} onItemClick={toggleMobile} />
        </div>
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
            <button
              onClick={toggleMobile}
              aria-label="Open menu"
              className="p-2 -ml-2 rounded-lg text-white hover:bg-white/10 transition duration-150"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className="hidden md:block">{/* <BrandHeader /> */}</div>

          <div className="flex items-center gap-4">
            <Link href="/listers/inbox" className="relative hidden">
              <Mail className="w-5 h-5 text-white cursor-pointer" />
            </Link>
            <NotificationBell
              href="/listers/notifications"
              iconClassName="w-5 h-5 text-white cursor-pointer"
            />
            <UserProfileBadge2 />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 h-[90vh] max-h-[90vh] overflow-hidden overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
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
