"use client";

// ENDPOINTS: GET /api/admin/wallets/transactions?page=1&limit=6

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useWalletTransactions } from "@/lib/queries/admin/useWallets";

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(Math.abs(amount));

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}, ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
};

const formatTransactionNote = (note: string): string =>
  note.replace(
    /(Collateral locked:\s*)(?:₦\s*)?([\d,]+(?:\.\d+)?)/i,
    (_match, label: string, amount: string) => {
      const value = Number(amount.replaceAll(",", ""));
      return Number.isFinite(value)
        ? `${label}₦${new Intl.NumberFormat("en-NG", {
            maximumFractionDigits: 2,
          }).format(value)}`
        : _match;
    },
  );

const RecentTransactionsPanel = ({ adminId }: { adminId: string }) => {
  const transactionsQuery = useWalletTransactions({
    page: 1,
    limit: 6,
  });
  const transactions = transactionsQuery.data?.data?.transactions ?? [];

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
          Recent transactions
        </h3>
        <Link
          href={`/admin/${adminId}/wallets?tab=transactions`}
          className="text-[12px] font-medium text-blue-600 hover:underline"
        >
          View all
        </Link>
      </div>

      {transactionsQuery.isPending ? (
        <div className="space-y-3">
          {["s1", "s2", "s3", "s4", "s5"].map((key) => (
            <div key={key} className="flex animate-pulse items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gray-200" />
              <div className="flex-1">
                <div className="mb-1.5 h-3.5 w-44 rounded bg-gray-200" />
                <div className="h-3 w-28 rounded bg-gray-200" />
              </div>
              <div className="h-4 w-16 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-gray-500">
          No transactions yet.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {transactions.map((t) => {
            const isCredit = (t.amount ?? 0) > 0;
            return (
              <li key={t.id} className="flex items-center gap-3 py-2.5">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isCredit
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {isCredit ? (
                    <ArrowDownLeft className="h-4.5 w-4.5" />
                  ) : (
                    <ArrowUpRight className="h-4.5 w-4.5" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-gray-900">
                    {t.note
                      ? formatTransactionNote(t.note)
                      : isCredit
                        ? "Credit"
                        : "Debit"}
                  </span>
                  <span className="block truncate text-[12px] text-gray-500">
                    {t.wallet?.user?.name ?? "—"} ·{" "}
                    {formatDateTime(t.createdAt)}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span
                    className={`block text-[13px] font-semibold ${
                      isCredit ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {isCredit ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default RecentTransactionsPanel;
