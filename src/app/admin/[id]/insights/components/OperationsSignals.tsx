"use client";

import Link from "next/link";
import { useDashboardOverview } from "@/lib/queries/admin/useAnalytics";
import {
  adminHref,
  useAdminRouteId,
} from "../../dashboard/components/overviewShared";

const OperationsSignals = () => {
  const adminId = useAdminRouteId();
  const { data, isLoading, error } = useDashboardOverview();
  const counts = data?.data.needsAttention;
  const today = data?.data.today;

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-5">
        <div className="h-4 w-40 rounded bg-gray-200" />
        <div className="mt-4 h-20 rounded bg-gray-100" />
      </div>
    );
  }

  if (error || !counts) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 text-sm text-gray-600">
        Current operations queues could not be loaded.
      </div>
    );
  }

  const items = [
    {
      label: "Listings awaiting review",
      count: counts.newListingReviews,
      section: "listings",
    },
    {
      label: "Availability requests awaiting response",
      count: counts.availabilityRequests,
      section: "requests",
    },
    {
      label: "Expired requests",
      count: counts.listersNotResponding,
      section: "requests",
    },
    {
      label: "Overdue returns",
      count: counts.returnOverdue,
      section: "orders",
    },
    {
      label: "Open disputes",
      count: counts.disputesPending,
      section: "disputes",
    },
    {
      label: "Withdrawal requests",
      count: counts.withdrawalRequests,
      section: "wallets",
    },
    {
      label: "Shipments due today",
      count: counts.deliveriesToday,
      section: "shipments",
    },
    {
      label: "Orders awaiting fulfilment",
      count: today?.ordersAwaitingFulfilment ?? 0,
      section: "orders",
    },
  ].filter((item) => item.count > 0);

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="font-semibold text-gray-900">Open admin queues</h3>
      <p className="mt-1 text-xs text-gray-500">
        Current workload, not limited by the selected reporting period
      </p>
      {items.length ? (
        <div className="mt-4 divide-y divide-gray-100">
          {items.map((item) => (
            <Link
              key={item.label}
              href={adminHref(adminId, item.section)}
              className="flex items-center justify-between gap-4 py-3 text-sm transition hover:text-amber-700"
            >
              <span>{item.label}</span>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-800">
                {item.count}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-4 rounded-lg bg-green-50 p-4 text-sm text-green-800">
          No open queues need attention right now.
        </p>
      )}
    </article>
  );
};

export default OperationsSignals;
