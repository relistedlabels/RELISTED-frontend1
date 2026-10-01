"use client";

import {
  AlertTriangle,
  ArrowDownToLine,
  Banknote,
  CheckCircle2,
  ClipboardList,
  ShoppingBag,
  ShoppingCart,
  Tag,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { DashboardActivityItem } from "@/lib/api/admin/";
import { useDashboardOverview } from "@/lib/queries/admin/useAnalytics";
import {
  adminHref,
  formatNairaAmount,
  relativeActivityTime,
  useAdminRouteId,
} from "./overviewShared";

const ACTIVITY_ICONS: Record<
  DashboardActivityItem["kind"],
  { icon: ReactNode; iconBg: string; iconText: string }
> = {
  rental_request: {
    icon: <ShoppingBag className="h-4.5 w-4.5" />,
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
  },
  purchase_request: {
    icon: <Tag className="h-4.5 w-4.5" />,
    iconBg: "bg-violet-100",
    iconText: "text-violet-600",
  },
  listing_review: {
    icon: <ClipboardList className="h-4.5 w-4.5" />,
    iconBg: "bg-amber-100",
    iconText: "text-amber-600",
  },
  order_placed: {
    icon: <ShoppingCart className="h-4.5 w-4.5" />,
    iconBg: "bg-green-100",
    iconText: "text-green-700",
  },
  order_completed: {
    icon: <CheckCircle2 className="h-4.5 w-4.5" />,
    iconBg: "bg-green-100",
    iconText: "text-green-700",
  },
  dispute_opened: {
    icon: <AlertTriangle className="h-4.5 w-4.5" />,
    iconBg: "bg-red-100",
    iconText: "text-red-600",
  },
  withdrawal_requested: {
    icon: <Banknote className="h-4.5 w-4.5" />,
    iconBg: "bg-amber-100",
    iconText: "text-amber-600",
  },
  payout_released: {
    icon: <ArrowDownToLine className="h-4.5 w-4.5" />,
    iconBg: "bg-blue-100",
    iconText: "text-blue-600",
  },
};

const kindHref = (kind: DashboardActivityItem["kind"], adminId: string) => {
  switch (kind) {
    case "rental_request":
    case "purchase_request":
      return adminHref(adminId, "requests");
    case "listing_review":
      return adminHref(adminId, "listings");
    case "order_placed":
    case "order_completed":
      return adminHref(adminId, "orders");
    case "dispute_opened":
      return adminHref(adminId, "disputes");
    case "withdrawal_requested":
    case "payout_released":
      return adminHref(adminId, "wallets");
    default:
      return adminHref(adminId, "dashboard");
  }
};

const RecentActivitySection = () => {
  const adminId = useAdminRouteId();
  const { data, isLoading } = useDashboardOverview();
  const activity = data?.data.recentActivity ?? [];

  return (
    <section className="mb-4 mt-4 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-900">
          Recent activity
        </h2>
        <Link
          href={adminHref(adminId, "notifications")}
          className="flex items-center gap-0.5 text-[12px] font-medium text-blue-600 hover:underline"
        >
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {["s1", "s2", "s3", "s4", "s5"].map((key) => (
            <div key={key} className="flex animate-pulse items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gray-200" />
              <div className="flex-1">
                <div className="mb-1.5 h-3.5 w-40 rounded bg-gray-200" />
                <div className="h-3 w-56 max-w-[60%] rounded bg-gray-200" />
              </div>
              <div className="h-3 w-14 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : activity.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-gray-500">
          No recent activity.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {activity.map((item) => {
            const style = ACTIVITY_ICONS[item.kind];
            return (
              <li key={item.id}>
                <Link
                  href={kindHref(item.kind, adminId)}
                  className="flex items-center gap-3 rounded-lg py-2.5 transition hover:bg-gray-50"
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.iconBg} ${style.iconText}`}
                  >
                    {style.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-gray-900">
                      {item.title}
                    </span>
                    <span className="block truncate text-[12px] text-gray-500">
                      {item.detail}
                    </span>
                  </span>
                  {item.amount !== null ? (
                    <span className="shrink-0 text-[13px] font-semibold text-gray-900">
                      {formatNairaAmount(item.amount)}
                    </span>
                  ) : null}
                  <span className="w-20 shrink-0 text-right text-[11px] text-gray-400">
                    {relativeActivityTime(item.createdAt)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default RecentActivitySection;
