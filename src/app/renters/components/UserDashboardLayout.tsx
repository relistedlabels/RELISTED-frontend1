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
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Paragraph2, Paragraph3, ParagraphLink1 } from "@/common/ui/Text";
import { AnimatePresence, motion } from "framer-motion";
import { useUserStore } from "@/store/useUserStore";

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
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const clearUser = useUserStore((s) => s.clearUser);

  // Get the active page title
  const activeItem = navItems.find((item) => pathname.startsWith(item.href));
  const title = activeItem?.name || "";

  const handleLogout = async () => {
    await clearUser();
    setShowLogoutModal(false);
    router.replace("/auth/sign-in");
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
      <main className="grow h-screen overflow-x-auto px-4 sm:pl-8 sm:px-0 py-">
        <Paragraph2 className="text-2xl font-bold mb-6">{title}</Paragraph2>
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm"
            >
              <h2 className="text-lg font-bold mb-2">Confirm Logout</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to log out?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold"
                  onClick={() => setShowLogoutModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold"
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
