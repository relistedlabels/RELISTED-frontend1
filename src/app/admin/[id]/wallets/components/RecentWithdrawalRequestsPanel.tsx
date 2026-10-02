"use client";

import { Check, Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useWithdrawalRequests } from "@/lib/queries/admin/useWallets";
import { withdrawalAdminStatusLabel } from "../utils/withdrawalAdminStatus";
import {
  getStatusBadgeColor,
  type WithdrawalRow,
  WithdrawalRowActions,
} from "./WithdrawalRequestTable";

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export default function RecentWithdrawalRequestsPanel({
  adminId,
}: {
  adminId: string;
}) {
  const [copiedRequestId, setCopiedRequestId] = useState<string | null>(null);
  const requestsQuery = useWithdrawalRequests({ page: 1, limit: 5 });
  const requests = requestsQuery.data?.data?.withdrawals ?? [];

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
          Recent withdrawal requests
        </h3>
        <Link
          href={`/admin/${adminId}/wallets?tab=withdrawal-requests`}
          className="text-[12px] font-medium text-blue-600 hover:underline"
        >
          View all
        </Link>
      </div>

      {requestsQuery.isPending ? (
        <output
          className="block space-y-3"
          aria-label="Loading recent withdrawals"
        >
          {[0, 1, 2].map((key) => (
            <div
              key={key}
              className="h-20 animate-pulse rounded-lg bg-gray-100"
            />
          ))}
        </output>
      ) : requestsQuery.isError ? (
        <div className="rounded-lg border border-red-100 bg-red-50 p-3">
          <p className="text-xs text-red-700">
            Recent withdrawal requests could not be loaded.
          </p>
          <button
            type="button"
            onClick={() => void requestsQuery.refetch()}
            className="mt-2 text-xs font-semibold text-red-800 underline"
          >
            Try again
          </button>
        </div>
      ) : requests.length === 0 ? (
        <p className="rounded-lg bg-gray-50 p-4 text-center text-xs text-gray-500">
          No withdrawal requests yet.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {requests.map((request) => {
            const withdrawal: WithdrawalRow = request;
            return (
              <li key={withdrawal.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {withdrawal.user.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {formatDate(withdrawal.requestedDate)}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-gray-900">
                    {formatCurrency(withdrawal.amount)}
                  </span>
                </div>
                <div className="mt-2 min-w-0">
                  <p className="truncate text-xs text-gray-600">
                    <span className="font-medium text-gray-800">
                      {withdrawal.bankAccount.accountNumber}
                    </span>
                    <span className="mx-1.5 text-gray-300" aria-hidden="true">
                      ·
                    </span>
                    {withdrawal.bankAccount.bankName}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusBadgeColor(withdrawal.status)}`}
                  >
                    {withdrawalAdminStatusLabel(withdrawal.status)}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      aria-label={
                        copiedRequestId === withdrawal.id
                          ? `Payout details copied for ${withdrawal.user.name}`
                          : `Copy payout details for ${withdrawal.user.name}`
                      }
                      title={
                        copiedRequestId === withdrawal.id
                          ? "Copied"
                          : "Copy payout details"
                      }
                      onClick={async () => {
                        const details = [
                          "Bank Account",
                          withdrawal.bankAccount.accountNumber,
                          withdrawal.bankAccount.bankName,
                          "",
                          "Amount",
                          formatCurrency(withdrawal.amount),
                        ].join("\n");
                        try {
                          await navigator.clipboard.writeText(details);
                          setCopiedRequestId(withdrawal.id);
                          window.setTimeout(() => {
                            setCopiedRequestId((currentId) =>
                              currentId === withdrawal.id ? null : currentId,
                            );
                          }, 2000);
                        } catch {
                          toast.error("Could not copy payout details.");
                        }
                      }}
                      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
                        copiedRequestId === withdrawal.id
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      {copiedRequestId === withdrawal.id ? (
                        <Check
                          size={16}
                          className="animate-in zoom-in-75 duration-150"
                          aria-hidden="true"
                        />
                      ) : (
                        <Copy size={16} aria-hidden="true" />
                      )}
                      <span>
                        {copiedRequestId === withdrawal.id ? "Copied" : "Copy"}
                      </span>
                    </button>
                    <WithdrawalRowActions withdrawal={withdrawal} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
