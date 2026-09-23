"use client";

import React, { useState } from "react";
import {
  Wallet,
  Heart,
  Users,
  FileText,
  ShoppingBag,
  LogOut,
} from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { buttonDestructive, buttonSecondary } from "@/common/ui/buttonClasses";
import { dialogBackdrop, dialogCard } from "@/common/ui/dashboardClasses";
import { Paragraph2, Paragraph3, ParagraphLink1 } from "@/common/ui/Text";
import { AnimatePresence, motion } from "framer-motion";
import { useLogout } from "@/lib/mutations";

interface NavItem {
  name: string;
  icon: React.ElementType;
  href: string;
}

const navItems: NavItem[] = [
  { name: "My Orders", icon: ShoppingBag, href: "/renters/orders" },
  { name: "Wallet", icon: Wallet, href: "/renters/wallet" },
  { name: "Favourites", icon: Heart, href: "/renters/favorites" },
  { name: "My Disputes", icon: FileText, href: "/renters/dispute" },
  { name: "My Account", icon: Users, href: "/renters/account" },
];

export default function UserDashboardLayout({
  children,
  title: titleOverride,
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const logout = useLogout();

  // Get the active page title
  const activeItem = navItems.find((item) => pathname.startsWith(item.href));
  const title = titleOverride ?? activeItem?.name ?? "";

  const handleLogout = () => {
    setShowLogoutModal(false);
    logout.mutate(undefined, {
      onSettled: () => {
        router.replace("/auth/sign-in");
      },
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-14 sm:w-64 border-r border-gray-200 shrink-0">
        <nav className="flex flex-col h-full">
          <ul>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center px-2 sm:px-4 py-5 transition-colors
                      ${
                        isActive
                          ? "bg-black text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <Icon
                      size={22}
                      className={`mx-auto sm:mr-3 sm:mx-0 ${
                        isActive ? "text-white" : "text-gray-600"
                      }`}
                    />

                    <span className="hidden sm:inline font-semibold">
                      <ParagraphLink1>{item.name} </ParagraphLink1>
                    </span>
                  </Link>
                </li>
              );
            })}

            <button
              className={`
                flex text-red-500 hover:bg-red-100 w-full items-center px-2 sm:px-4 py-5 transition-colors
              `}
              onClick={() => setShowLogoutModal(true)}
            >
              <LogOut size={22} className={`mx-auto sm:mr-3 sm:mx-0`} />

              <span className="hidden sm:inline ">
                <ParagraphLink1 className="font-bold">Log out</ParagraphLink1>
              </span>
            </button>
            <div className="">
              {" "}
              <ParagraphLink1> </ParagraphLink1>
            </div>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="grow min-h-0 overflow-x-auto overflow-y-auto px-4 pb-24 sm:pl-8 sm:px-0 xl:pb-0">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Paragraph2 className="text-2xl font-bold">{title}</Paragraph2>
          <NotificationBell
            href="/renters/notifications"
            iconClassName="h-5 w-5 text-gray-700"
            badgeClassName="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-gray-50"
          />
        </div>
        {children}
      </main>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className={dialogBackdrop}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={dialogCard}
            >
              <h2 className="mb-2 font-bold text-gray-900 text-lg">
                Confirm logout
              </h2>
              <p className="mb-6 text-gray-600 text-sm">
                Are you sure you want to log out?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  className={buttonSecondary}
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={buttonDestructive}
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
