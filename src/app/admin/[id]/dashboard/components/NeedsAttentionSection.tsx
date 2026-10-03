"use client";

import {
  Banknote,
  ChevronRight,
  ClipboardList,
  ShieldAlert,
  Tag,
  UndoDot,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useDashboardOverview } from "@/lib/queries/admin/useAnalytics";
import { adminHref, useAdminRouteId } from "./overviewShared";

interface AttentionItem {
  key: string;
  label: string;
  sub: string;
  count: number;
  href: string;
  icon: ReactNode;
  cardBg: string;
  iconBg: string;
  iconText: string;
}

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5"];

const NeedsAttentionSection = () => {
  const adminId = useAdminRouteId();
  const { data, isLoading } = useDashboardOverview();
  const counts = data?.data.needsAttention;

  const items: AttentionItem[] = [
    {
      key: "newListingReviews",
      label: "New listings",
      sub: "Need review",
      count: counts?.newListingReviews ?? 0,
      href: adminHref(adminId, "listings"),
      icon: <Tag className="h-5 w-5" />,
      cardBg: "bg-rose-50 border-rose-100",
      iconBg: "bg-rose-100",
      iconText: "text-rose-600",
    },
    {
      key: "availabilityRequests",
      label: "Availability requests",
      sub: "Waiting for lister response",
      count: counts?.availabilityRequests ?? 0,
      href: adminHref(adminId, "requests"),
      icon: <ClipboardList className="h-5 w-5" />,
      cardBg: "bg-blue-50 border-blue-100",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
    },
    {
      key: "returnOverdue",
      label: "Return overdue",
      sub: "Past expected date",
      count: counts?.returnOverdue ?? 0,
      href: adminHref(adminId, "orders"),
      icon: <UndoDot className="h-5 w-5" />,
      cardBg: "bg-violet-50 border-violet-100",
      iconBg: "bg-violet-100",
      iconText: "text-violet-600",
    },
    {
      key: "disputesPending",
      label: "Dispute pending",
      sub: "Needs review",
      count: counts?.disputesPending ?? 0,
      href: adminHref(adminId, "disputes"),
      icon: <ShieldAlert className="h-5 w-5" />,
      cardBg: "bg-red-50 border-red-100",
      iconBg: "bg-red-100",
      iconText: "text-red-600",
    },
    {
      key: "withdrawalRequests",
      label: "Withdrawal requests",
      sub: "Awaiting action",
      count: counts?.withdrawalRequests ?? 0,
      href: adminHref(adminId, "wallets"),
      icon: <Banknote className="h-5 w-5" />,
      cardBg: "bg-amber-50 border-amber-100",
      iconBg: "bg-amber-100",
      iconText: "text-amber-600",
    },
  ];

  return (
    <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-900">
        Needs attention
      </h2>

      {isLoading || !counts ? (
        <div className="flex gap-3 lg:grid lg:grid-cols-3 xl:grid-cols-5">
          {SKELETON_KEYS.map((key) => (
            <div
              key={key}
              className="min-w-[9.5rem] flex-1 animate-pulse rounded-xl bg-gray-100 p-3.5 lg:min-w-0"
            >
              <div className="mb-3 h-9 w-9 rounded-lg bg-gray-200" />
              <div className="mb-2 h-7 w-10 rounded bg-gray-200" />
              <div className="mb-1 h-3.5 w-full rounded bg-gray-200" />
              <div className="h-3 w-3/4 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="hide-scrollbar flex snap-x gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-3 lg:overflow-visible xl:grid-cols-5">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`group min-w-[9.5rem] flex-1 snap-start rounded-xl border p-3.5 transition hover:shadow-sm lg:min-w-0 ${item.cardBg}`}
            >
              <div className="flex items-start justify-between">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.iconBg} ${item.iconText}`}
                >
                  {item.icon}
                </span>
                <ChevronRight
                  className={`h-4 w-4 opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-100 ${item.iconText}`}
                />
              </div>
              <p className="mt-3 text-2xl font-bold leading-none text-gray-900">
                {item.count}
              </p>
              <p className="mt-2 text-[13px] font-semibold leading-tight text-gray-800">
                {item.label}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
                {item.sub}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default NeedsAttentionSection;
