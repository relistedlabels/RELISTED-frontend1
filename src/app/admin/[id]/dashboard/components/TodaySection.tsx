"use client";

import { ChevronRight, Package, Truck, UndoDot } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useDashboardOverview } from "@/lib/queries/admin/useAnalytics";
import { adminHref, useAdminRouteId } from "./overviewShared";

interface TodayItem {
  key: string;
  label: string;
  linkLabel: string;
  count: number;
  href: string;
  icon: ReactNode;
  cardBg: string;
  iconBg: string;
  iconText: string;
  linkText: string;
}

const SKELETON_KEYS = ["s1", "s2", "s3"];

const TodaySection = () => {
  const adminId = useAdminRouteId();
  const { data, isLoading } = useDashboardOverview();
  const today = data?.data.today;

  const items: TodayItem[] = [
    {
      key: "rentalsGoingOut",
      label: "Rentals going out",
      linkLabel: "View orders",
      count: today?.rentalsGoingOut ?? 0,
      href: adminHref(adminId, "shipments"),
      icon: <Truck className="h-5 w-5" />,
      cardBg: "bg-green-50 border-green-100",
      iconBg: "bg-green-100",
      iconText: "text-green-700",
      linkText: "text-green-700",
    },
    {
      key: "returnsExpected",
      label: "Returns expected",
      linkLabel: "View returns",
      count: today?.returnsExpected ?? 0,
      href: adminHref(adminId, "shipments"),
      icon: <UndoDot className="h-5 w-5" />,
      cardBg: "bg-blue-50 border-blue-100",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
      linkText: "text-blue-600",
    },
    {
      key: "ordersAwaitingFulfilment",
      label: "Orders awaiting fulfilment",
      linkLabel: "View orders",
      count: today?.ordersAwaitingFulfilment ?? 0,
      href: adminHref(adminId, "orders"),
      icon: <Package className="h-5 w-5" />,
      cardBg: "bg-violet-50 border-violet-100",
      iconBg: "bg-violet-100",
      iconText: "text-violet-600",
      linkText: "text-violet-600",
    },
  ];

  return (
    <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-900">
        Today
      </h2>

      {isLoading || !today ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {SKELETON_KEYS.map((key) => (
            <div key={key} className="animate-pulse rounded-xl bg-gray-100 p-4">
              <div className="mb-3 h-9 w-9 rounded-lg bg-gray-200" />
              <div className="mb-2 h-7 w-10 rounded bg-gray-200" />
              <div className="h-3.5 w-3/4 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.key}
              className={`rounded-xl border p-4 ${item.cardBg}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.iconBg} ${item.iconText}`}
                >
                  {item.icon}
                </span>
                <p className="text-2xl font-bold leading-none text-gray-900">
                  {item.count}
                </p>
              </div>
              <p className="mt-3 text-[13px] font-semibold leading-tight text-gray-800">
                {item.label}
              </p>
              <Link
                href={item.href}
                className={`mt-2 inline-flex items-center gap-0.5 text-[12px] font-medium ${item.linkText} hover:underline`}
              >
                {item.linkLabel}
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TodaySection;
