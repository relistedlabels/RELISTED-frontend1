"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminIdStore } from "@/store/useAdminIdStore";
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
    getHref: (id) => `/admin/${id}/wallet`,
  },
  {
    id: "dispute",
    label: "Dispute",
    icon: HiOutlineFolder,
    getHref: (id) => `/admin/${id}/dispute`,
  },
  {
    id: "settings",
    label: "Settings",
    icon: HiOutlineCog6Tooth,
    getHref: (id) => `/admin/${id}/settings`,
  },
];

interface AdminSidebarProps {
  userAvatarUrl: string;
  userName: string;
  userRole: string;
  onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  userAvatarUrl,
  userName,
  userRole,
  onLogout,
}) => {
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
          <img
            src={userAvatarUrl}
            alt={userName}
            className="w-12 h-12 rounded-full border"
          />

          <div className={`${!isMobileExpanded ? "hidden lg:block" : "block"}`}>
            <Paragraph1 className="text-sm font-bold truncate">
              {userName}
            </Paragraph1>
            <Paragraph1 className="text-[10px] text-gray-500 uppercase">
              -{userRole}-
            </Paragraph1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto hide-scrollbar">
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
