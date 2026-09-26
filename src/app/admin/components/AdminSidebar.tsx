"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { useState } from "react";
import {
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
  HiOutlineArchiveBox,
  HiOutlineBanknotes,
  HiOutlineStar,
} from "react-icons/hi2";
import { Paragraph1 } from "@/common/ui/Text";
import { settingsApi } from "@/lib/api/admin/settings";
import type { AdminNavCountKey } from "@/lib/admin/adminNavItems";
import { useAdminNavCounts } from "@/lib/queries/admin/useAdminNavCounts";
import { useAdminNavState } from "@/lib/queries/admin/useSettings";
import { useMe } from "@/lib/queries/auth/useMe";
import { useAdminIdStore } from "@/store/useAdminIdStore";
import { getAdminNavItemDefinitions } from "@/lib/admin/adminNavItems";

interface NavItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon: React.ElementType;
  getHref: (adminId: string) => string;
  showNewBadge?: boolean;
  countKey?: AdminNavCountKey;
}

const ADMIN_NAV_ICONS: Record<string, React.ElementType> = {
  overview: HiOutlineHome,
  users: HiOutlineUsers,
  listings: HiOutlineCube,
  shop: HiOutlineBuildingStorefront,
  requests: HiOutlineClipboardDocumentList,
  orders: HiOutlineShoppingCart,
  shipments: HiOutlineTruck,
  closets: HiOutlineArchiveBox,
  sales: HiOutlineRectangleStack,
  wallet: HiOutlineCreditCard,
  withdrawals: HiOutlineBanknotes,
  dispute: HiOutlineFolder,
  reviews: HiOutlineStar,
  settings: HiOutlineCog6Tooth,
};

const getNavItems = (): NavItem[] =>
  getAdminNavItemDefinitions().map((item) => ({
    ...item,
    icon: ADMIN_NAV_ICONS[item.id] ?? HiOutlineHome,
  }));

interface AdminSidebarProps {
  onLogout?: () => void;
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

const AdminSidebar: React.FC<AdminSidebarProps> = () => {
  const queryClient = useQueryClient();
  const { data: user } = useMe();
  const { data: navState } = useAdminNavState();
  const navCounts = useAdminNavCounts();
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
    "flex w-full rounded-xl transition-colors duration-200 group";

  const activeLinkClasses = "bg-black text-white shadow-sm";
  const inactiveLinkClasses =
    "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900";

  return (
    <>
      {isMobileExpanded ? (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-10 bg-black/40 lg:hidden"
          onClick={() => setIsMobileExpanded(false)}
        />
      ) : null}
      <div
        className={`z-20 flex h-screen flex-col border-r border-gray-200 bg-white py-6 transition-all duration-300 sm:py-[100px]
        ${
          isMobileExpanded
            ? "absolute w-64 shadow-2xl lg:relative lg:w-64 lg:shadow-none"
            : "relative w-[6.5rem] lg:w-64"
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
      <nav className="hide-scrollbar max-h-[calc(100dvh-11rem)] overflow-y-auto px-2 sm:max-h-[calc(100dvh-13rem)] sm:px-4">
        <ul className="pb-2">
          {navItems.map((item) => {
            const href = item.getHref(resolvedAdminId);
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            const showNewBadge =
              item.showNewBadge && !seenNavIds.includes(item.id);
            const pendingCount = item.countKey
              ? navCounts[item.countKey]
              : 0;
            const mobileStacked = !isMobileExpanded;
            const navLabel = item.shortLabel ?? item.label;

            return (
              <li key={item.id} className="relative mb-2">
                <Link
                  href={href}
                  onClick={() => {
                    setIsMobileExpanded(false);
                    if (showNewBadge) dismissNavBadge(item.id);
                  }}
                  className={`${linkBaseClasses} ${
                    isActive ? activeLinkClasses : inactiveLinkClasses
                  } ${
                    mobileStacked
                      ? "flex-col items-center gap-1 px-1 py-2.5 text-center lg:flex-row lg:items-center lg:gap-0 lg:p-3 lg:text-left"
                      : "items-center p-3"
                  }`}
                >
                  <item.icon
                    className={`h-6 w-6 shrink-0 ${
                      isActive ? "text-white" : "text-gray-500"
                    }`}
                  />

                  {mobileStacked ? (
                    <span
                      className={`block w-full max-w-full break-words text-[10px] font-medium leading-snug lg:hidden ${
                        isActive ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {navLabel}
                    </span>
                  ) : null}

                  <Paragraph1
                    className={`text-sm ${
                      mobileStacked
                        ? "hidden lg:ml-4 lg:block"
                        : "ml-4 block"
                    }`}
                  >
                    {item.label}
                  </Paragraph1>

                  {showNewBadge && pendingCount === 0 ? (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        isActive
                          ? "bg-white text-black"
                          : "bg-black text-white"
                      } ${
                        mobileStacked
                          ? "mt-0.5 lg:ml-auto lg:mt-0"
                          : "ml-auto"
                      }`}
                    >
                      New
                    </span>
                  ) : null}
                </Link>

                {pendingCount > 0 ? (
                  <span
                    className="pointer-events-none absolute -right-2 -top-2 z-10 flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1.5 text-xs font-bold leading-none text-white"
                    aria-label={`${pendingCount} pending`}
                  >
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
    </>
  );
};

export default AdminSidebar;
