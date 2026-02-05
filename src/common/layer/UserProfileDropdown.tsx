"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Wallet,
  AlertCircle,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import LogoutConfirmModal from "./LogoutConfirmModal";
import { useLogout } from "@/lib/mutations";

interface UserProfileDropdownProps {
  userName: string | null;
  userAvatar: string | null;
  userRole: "lister" | "renter" | string;
}

export default function UserProfileDropdown({
  userName,
  userAvatar,
  userRole,
}: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const logout = useLogout();

  // Get first letter of name for avatar
  const firstLetter = userName?.charAt(0).toUpperCase() || "U";

  // Menu items based on user role
  const menuItems =
    userRole === "lister"
      ? [
          {
            label: "Inventory",
            icon: ShoppingBag,
            href: "/listers/inventory",
          },
          {
            label: "Orders",
            icon: ShoppingBag,
            href: "/listers/orders",
          },
          {
            label: "Wallet",
            icon: Wallet,
            href: "/listers/wallet",
          },
          {
            label: "Disputes",
            icon: AlertCircle,
            href: "/listers/dispute",
          },
          {
            label: "Account",
            icon: User,
            href: "/listers/settings",
          },
        ]
      : [
          {
            label: "Orders",
            icon: ShoppingBag,
            href: "/renters/orders",
          },
          {
            label: "Favorites",
            icon: ShoppingBag,
            href: "/renters/favorites",
          },
          {
            label: "Wallet",
            icon: Wallet,
            href: "/renters/wallet",
          },
          {
            label: "Disputes",
            icon: AlertCircle,
            href: "/renters/dispute",
          },
          {
            label: "Account",
            icon: User,
            href: "/renters/account",
          },
        ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    setIsOpen(false);
    logout.mutate();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        {/* Avatar */}
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold flex-shrink-0">
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName || "User"}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            firstLetter
          )}
        </div>

        {/* Name */}
        <span className="text-white font-medium text-sm hidden sm:inline truncate max-w-[120px]">
          {userName || "User"}
        </span>

        {/* Dropdown Icon */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className="text-white flex-shrink-0" />
        </motion.div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 overflow-hidden"
          >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Logged in as
              </p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {userName || "User"}
              </p>
              <p className="text-xs text-gray-400 capitalize">{userRole}</p>
            </div>

            {/* Menu Items */}
            <nav className="py-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                  >
                    <motion.div
                      whileHover={{ backgroundColor: "#f3f4f6" }}
                      className="px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors"
                    >
                      <Icon size={18} className="text-gray-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700">
                        {item.label}
                      </span>
                    </motion.div>
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="border-t border-gray-200 my-2" />

              {/* Logout Button */}
              <motion.button
                whileHover={{ backgroundColor: "#fee2e2" }}
                onClick={() => {
                  setIsOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full px-4 py-3 flex items-center gap-3 text-left transition-colors hover:bg-red-50"
              >
                <LogOut size={18} className="text-red-600 flex-shrink-0" />
                <span className="text-sm font-medium text-red-600">
                  {logout.isPending ? "Logging out..." : "Log Out"}
                </span>
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        isLoading={logout.isPending}
      />
    </div>
  );
}
