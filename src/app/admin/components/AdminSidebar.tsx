"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useState } from "react";
import {
  HiOutlineArrowRightOnRectangle,
  HiOutlineCog6Tooth,
  HiOutlineCreditCard,
  HiOutlineCube,
  HiOutlineFolder,
  HiOutlineHome,
  HiOutlineShoppingCart,
  HiOutlineUsers,
  HiOutlineTruck,
  HiOutlineRectangleStack,
  HiOutlineBuildingStorefront,
  HiOutlineClipboardDocumentList,
} from "react-icons/hi2";
import { Paragraph1 } from "@/common/ui/Text";
import { settingsApi } from "@/lib/api/admin/settings";
import { useAdminNavState } from "@/lib/queries/admin/useSettings";
import { useMe } from "@/lib/queries/auth/useMe";
import { useAdminIdStore } from "@/store/useAdminIdStore";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  getHref: (adminId: string) => string;
  showNewBadge?: boolean;
}

const getNavItems = (): NavItem[] => [
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
    id: "shop",
    label: "Shop",
    icon: HiOutlineBuildingStorefront,
    getHref: (id) => `/admin/${id}/shop`,
    showNewBadge: true,
  },
  {
    id: "requests",
    label: "Requests",
    icon: HiOutlineClipboardDocumentList,
    getHref: (id) => `/admin/${id}/requests`,
    showNewBadge: true,
  },
  {
    id: "orders",
    label: "Orders",
    icon: HiOutlineShoppingCart,
    getHref: (id) => `/admin/${id}/orders`,
  },
  {
    id: "shipments",
    label: "Shipments",
    icon: HiOutlineTruck,
    getHref: (id) => `/admin/${id}/shipments`,
  },
  {
    id: "sales",
    label: "Sales",
    icon: HiOutlineRectangleStack,
    getHref: (id) => `/admin/${id}/sales`,
    showNewBadge: true,
  },
  {
    id: "wallet",
    label: "Payments & balances",
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
  const queryClient = useQueryClient();
  const { data: user } = useMe();
  const { data: navState } = useAdminNavState();
  const seenNavIds = navState?.data.seenNavIds ?? [];
  const pathname = usePathname();
  const params = useParams();
  const adminId = useAdminIdStore((state) => state.adminId);
  const paramAdminId = Array.isArray(params.id) ? params.id[0] : params.id;
  const resolvedAdminId = paramAdminId ?? adminId ?? "";
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const navItems = getNavItems();

  const dismissNavBadge = (navId: string) => {
    if (seenNavIds.includes(navId)) return;

    queryClient.setQueryData(
      ["admin", "settings", "nav-state"],
      (prev: { success: true; data: { seenNavIds: string[] } } | undefined) =>
        prev
          ? {
              ...prev,
              data: { seenNavIds: [...prev.data.seenNavIds, navId] },
            }
          : prev,
    );
    void settingsApi.dismissNav(navId);
  };

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
      <div className="lg:hidden flex justify-center mb-4 px-4">
        <button
          type="button"
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="hover:bg-gray-100 p-2 rounded-lg text-gray-500"
        >
          {isMobileExpanded ? <X /> : <Menu />}
        </button>
      </div>

      {/* User */}
      <div className="mb-6 px-4">
        <div
          className={`flex items-center gap-4 ${
            !isMobileExpanded ? "justify-center lg:justify-start" : ""
          }`}
        >
          <div
            className={`w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center font-bold text-white text-sm ${getAvatarBgColor(
              user?.name || "",
            )}`}
          >
            {getInitials(user?.name || "")}
          </div>

          <div className={`${!isMobileExpanded ? "hidden lg:block" : "block"}`}>
            <Paragraph1 className="font-bold text-sm truncate">
              {user?.name || "Loading..."}
            </Paragraph1>
            <Paragraph1 className="text-[10px] text-gray-500 uppercase">
              -{user?.role || "ADMIN"}-
            </Paragraph1>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1- px-4 overflow-y-auto- hide-scrollbar-">
        <ul>
          {navItems.map((item) => {
            const href = item.getHref(resolvedAdminId);
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            const showNewBadge =
              item.showNewBadge && !seenNavIds.includes(item.id);

            return (
              <li key={item.id}>
                <Link
                  href={href}
                  onClick={() => {
                    setIsMobileExpanded(false);
                    if (showNewBadge) dismissNavBadge(item.id);
                  }}
                  className={`${linkBaseClasses} ${
                    isActive ? activeLinkClasses : inactiveLinkClasses
                  } ${
                    !isMobileExpanded ? "justify-center lg:justify-start" : ""
                  }`}
                >
                  <item.icon
                    className={`w-6 h-6 shrink-0 ${
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

                  {showNewBadge && (
                    <span
                      className={`ml-auto text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white text-black"
                          : "bg-black text-white"
                      } ${
                        !isMobileExpanded ? "hidden lg:inline" : "inline"
                      }`}
                    >
                      New
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="mb-4 px-4">
        <button
          type="button"
          onClick={onLogout}
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
