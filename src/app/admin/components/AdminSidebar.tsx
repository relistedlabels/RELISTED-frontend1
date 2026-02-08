"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminIdStore } from "@/store/useAdminIdStore";
import { useMe } from "@/lib/queries/auth/useMe";
import { useProfile } from "@/lib/queries/user/useProfile";
import { Paragraph1 } from "@/common/ui/Text";
import {
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineCube,
  HiOutlineShoppingCart,
  HiOutlineCreditCard,
  HiOutlineFolder,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import { Menu, X } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  getHref: (adminId: string) => string;
}

const getNavItems = (adminId: string): NavItem[] => [
  {
    id: "overview",
    label: "Overview",
    icon: HiOutlineHome,
    getHref: (id) => `/admin/${id}/dashboard`,
  },
  {
    id: "users",
    label: "Users",
    icon: HiOutlineUsers,
    getHref: (id) => `/admin/${id}/users`,
  },
  {
    id: "listings",
    label: "Listings",
    icon: HiOutlineCube,
    getHref: (id) => `/admin/${id}/listings`,
  },
  {
    id: "orders",
    label: "Orders",
    icon: HiOutlineShoppingCart,
    getHref: (id) => `/admin/${id}/orders`,
  },
  {
    id: "wallet",
    label: "Wallet & Escrow",
    icon: HiOutlineCreditCard,
    getHref: (id) => `/admin/${id}/wallets`,
  },
  {
    id: "dispute",
    label: "Dispute",
    icon: HiOutlineFolder,
    getHref: (id) => `/admin/${id}/disputes`,
  },
  {
    id: "settings",
    label: "Settings",
    icon: HiOutlineCog6Tooth,
    getHref: (id) => `/admin/${id}/settings`,
  },
];

interface AdminSidebarProps {
  onLogout: () => void;
}

const getInitials = (name: string): string => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length > 0) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return "";
};

const getAvatarBgColor = (name: string): string => {
  const colors = [
    "bg-red-400",
    "bg-blue-400",
    "bg-green-400",
    "bg-yellow-400",
    "bg-purple-400",
    "bg-pink-400",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onLogout }) => {
  const { data: user } = useMe();
  const { data: profile } = useProfile();
  const pathname = usePathname();
  const adminId = useAdminIdStore((state) => state.adminId);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const navItems = getNavItems(adminId || "");

  const linkBaseClasses =
    "flex items-center w-full p-3 mb-2 rounded-xl transition-colors duration-200 group";

  const activeLinkClasses = "bg-black text-white shadow-sm";
  const inactiveLinkClasses =
    "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900";

  return (
    <div
      className={`h-screen bg-white sm:py-[100px] border-r border-gray-200 flex flex-col py-6 transition-all duration-300 z-20
        ${
          isMobileExpanded
            ? "w-64 absolute lg:relative shadow-2xl lg:shadow-none"
            : "w-20 lg:w-62 relative"
        }`}
    >
      {/* Mobile toggle */}
      <div className="px-4 mb-4 lg:hidden flex justify-center">
        <button
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
        >
          {isMobileExpanded ? <X /> : <Menu />}
        </button>
      </div>

      {/* User */}
      <div className="px-4 mb-6">
        <div
          className={`flex items-center gap-4 ${
            !isMobileExpanded ? "justify-center lg:justify-start" : ""
          }`}
        >
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt={user?.name || "Admin"}
              className="w-12 h-12 rounded-full border border-gray-200 object-cover"
            />
          ) : (
            <div
              className={`w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center font-bold text-white text-sm ${getAvatarBgColor(
                user?.name || "",
              )}`}
            >
              {getInitials(user?.name || "")}
            </div>
          )}

          <div className={`${!isMobileExpanded ? "hidden lg:block" : "block"}`}>
            <Paragraph1 className="text-sm font-bold truncate">
              {user?.name || "Loading..."}
            </Paragraph1>
            <Paragraph1 className="text-[10px] text-gray-500 uppercase">
              -{user?.role || "ADMIN"}-
            </Paragraph1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1-  px-4 overflow-y-auto-  hide-scrollbar-">
        <ul>
          {navItems.map((item) => {
            const href = item.getHref(adminId || "");
            const isActive =
              pathname === href || pathname.startsWith(href + "/");

            return (
              <li key={item.id}>
                <Link
                  href={href}
                  onClick={() => setIsMobileExpanded(false)}
                  className={`${linkBaseClasses} ${
                    isActive ? activeLinkClasses : inactiveLinkClasses
                  } ${
                    !isMobileExpanded ? "justify-center lg:justify-start" : ""
                  }`}
                >
                  <item.icon
                    className={`w-6 h-6 ${
                      isActive ? "text-white" : "text-gray-500"
                    }`}
                  />

                  <Paragraph1
                    className={`ml-4 text-sm ${
                      !isMobileExpanded ? "hidden lg:block" : "block"
                    }`}
                  >
                    {item.label}
                  </Paragraph1>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-4 mb-4">
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to log out?")) {
              onLogout();
            }
          }}
          className={`${linkBaseClasses} ${inactiveLinkClasses} hover:bg-red-50 hover:text-red-600 ${
            !isMobileExpanded ? "justify-center lg:justify-start" : ""
          }`}
        >
          <HiOutlineArrowRightOnRectangle className="w-6 h-6" />
          <Paragraph1
            className={`ml-4 ${
              !isMobileExpanded ? "hidden lg:block" : "block"
            }`}
          >
            Log Out
          </Paragraph1>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
