"use client";

import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import type React from "react";
import {
  HiOutlineArchiveBox,
  HiOutlineBanknotes,
  HiOutlineBuildingStorefront,
  HiOutlineChartBar,
  HiOutlineClipboardDocumentList,
  HiOutlineCog6Tooth,
  HiOutlineCreditCard,
  HiOutlineCube,
  HiOutlineFolder,
  HiOutlineHome,
  HiOutlineRectangleStack,
  HiOutlineShoppingCart,
  HiOutlineStar,
  HiOutlineTruck,
  HiOutlineUsers,
} from "react-icons/hi2";
import { Paragraph1 } from "@/common/ui/Text";
import type { AdminNavCountKey } from "@/lib/admin/adminNavItems";
import { getAdminNavItemDefinitions } from "@/lib/admin/adminNavItems";
import { settingsApi } from "@/lib/api/admin/settings";
import { useAdminNavCounts } from "@/lib/queries/admin/useAdminNavCounts";
import { useAdminNavState } from "@/lib/queries/admin/useSettings";
import { useAdminIdStore } from "@/store/useAdminIdStore";
import AdminBrand from "./AdminBrand";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  getHref: (adminId: string) => string;
  showNewBadge?: boolean;
  countKey?: AdminNavCountKey;
}

const ADMIN_NAV_ICONS: Record<string, React.ElementType> = {
  overview: HiOutlineHome,
  insights: HiOutlineChartBar,
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
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { data: navState } = useAdminNavState();
  const navCounts = useAdminNavCounts();
  const seenNavIds = navState?.data.seenNavIds ?? [];
  const pathname = usePathname();
  const params = useParams();
  const adminId = useAdminIdStore((state) => state.adminId);
  const paramAdminId = Array.isArray(params.id) ? params.id[0] : params.id;
  const resolvedAdminId = paramAdminId ?? adminId ?? "";

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

  const activeLinkClasses = "bg-black text-white shadow-sm";
  const inactiveLinkClasses =
    "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900";

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white pb-6 pt-6 transition-transform duration-300 lg:static lg:mt-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0
        ${
          isOpen
            ? "translate-x-0 shadow-2xl lg:shadow-none"
            : "-translate-x-full"
        }`}
      >
        {/* Brand header (mobile drawer only) */}
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 px-4 pb-4 lg:hidden">
          <AdminBrand />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="hide-scrollbar flex-1 overflow-y-auto px-2 sm:px-6">
          <ul className="pb-2">
            {navItems.map((item) => {
              const href = item.getHref(resolvedAdminId);
              const isActive =
                pathname === href || pathname.startsWith(`${href}/`);
              const showNewBadge =
                item.showNewBadge && !seenNavIds.includes(item.id);
              const pendingCount = item.countKey ? navCounts[item.countKey] : 0;

              return (
                <li key={item.id} className="relative mb-2">
                  <Link
                    href={href}
                    onClick={() => {
                      onClose();
                      if (showNewBadge) dismissNavBadge(item.id);
                    }}
                    className={`flex w-full items-center rounded-xl p-3 transition-colors duration-200 group ${
                      isActive ? activeLinkClasses : inactiveLinkClasses
                    }`}
                  >
                    <item.icon
                      className={`h-6 w-6 shrink-0 ${
                        isActive ? "text-white" : "text-gray-500"
                      }`}
                    />

                    <Paragraph1 className="ml-4 block text-sm">
                      {item.label}
                    </Paragraph1>

                    {showNewBadge && pendingCount === 0 ? (
                      <span
                        className={`ml-auto rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          isActive
                            ? "bg-white text-black"
                            : "bg-black text-white"
                        }`}
                      >
                        New
                      </span>
                    ) : null}
                  </Link>

                  {pendingCount > 0 ? (
                    <span
                      className="pointer-events-none absolute -right-1 -top-1.5 z-10 flex h-7 min-w-7 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1.5 text-xs font-bold leading-none text-white"
                      title={`${pendingCount} pending`}
                    >
                      {pendingCount > 99 ? "99+" : pendingCount}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
