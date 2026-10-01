"use client";

// ENDPOINTS: GET /api/admin/wallets/withdrawal-requests?status=...&page=1&limit=1 (counts)

import { ChevronRight, Landmark } from "lucide-react";
import Link from "next/link";
import { useWithdrawalRequests } from "@/lib/queries/admin/useWallets";

const WithdrawalSummaryPanel = ({ adminId }: { adminId: string }) => {
  const pendingQuery = useWithdrawalRequests({
    status: "pending",
    page: 1,
    limit: 1,
  });
  const approvedQuery = useWithdrawalRequests({
    status: "approved",
    page: 1,
    limit: 1,
  });
  const paidQuery = useWithdrawalRequests({
    status: "paid",
    page: 1,
    limit: 1,
  });

  const pending = pendingQuery.data?.data?.pagination?.total ?? 0;
  const approved = approvedQuery.data?.data?.pagination?.total ?? 0;
  const paid = paidQuery.data?.data?.pagination?.total ?? 0;
  const isLoading =
    pendingQuery.isPending || approvedQuery.isPending || paidQuery.isPending;

  const rows = [
    { label: "Pending approval", value: pending, dot: "bg-yellow-400" },
    { label: "Awaiting payout", value: approved, dot: "bg-blue-500" },
    { label: "Paid", value: paid, dot: "bg-green-500" },
  ];

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
          Withdrawal requests
        </h3>
        <Link
          href={`/admin/${adminId}/wallets?tab=withdrawal-requests`}
          className="text-[12px] font-medium text-blue-600 hover:underline"
        >
          View all
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {["s1", "s2", "s3"].map((key) => (
            <div key={key} className="h-9 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center gap-3 py-2.5">
              <span className={`h-2 w-2 rounded-full ${row.dot}`} />
              <span className="flex-1 text-[13px] text-gray-600">
                {row.label}
              </span>
              <span className="text-[13px] font-semibold text-gray-900">
                {row.value}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={`/admin/${adminId}/wallets?tab=withdrawal-requests`}
        className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-black px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-gray-900"
      >
        <Landmark className="h-4 w-4" />
        Review requests
        <ChevronRight className="h-4 w-4" />
      </Link>
    </section>
  );
};

export default WithdrawalSummaryPanel;
