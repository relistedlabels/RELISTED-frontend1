"use client";

import { ArrowUpRight, Calendar } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  formatWithdrawalStatus,
  normalizeListerWithdrawals,
  normalizeRenterWithdrawals,
} from "@/lib/wallet/withdrawalTransactions";
import { useTransactions as useListerTransactions } from "@/lib/queries/listers/useTransactions";
import { useTransactions as useRenterTransactions } from "@/lib/queries/renters/useTransactions";

type WithdrawalsListProps = {
  variant: "lister" | "renter";
};

export default function WithdrawalsList({ variant }: WithdrawalsListProps) {
  const listerQuery = useListerTransactions(1, 50, "debit", "-date");
  const renterQuery = useRenterTransactions(1, 50, "all", "all", "newest");

  const isLoading = variant === "lister" ? listerQuery.isLoading : renterQuery.isLoading;
  const isError = variant === "lister" ? listerQuery.isError : renterQuery.isError;

  const withdrawals =
    variant === "lister"
      ? normalizeListerWithdrawals(listerQuery.data)
      : normalizeRenterWithdrawals(renterQuery.data?.transactions ?? []);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-32 rounded-xl bg-gray-200" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 py-12 text-center text-red-600">
        Failed to load withdrawals. Please try again.
      </div>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-8 sm:py-12 text-center text-gray-500 shadow-sm">
        No withdrawals yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {withdrawals.map((withdrawal) => {
        const status = formatWithdrawalStatus(withdrawal.status);

        return (
          <div
            key={withdrawal.id}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Paragraph1 className="text-sm font-semibold tracking-wide text-gray-900">
                  {withdrawal.reference ?? withdrawal.id}
                </Paragraph1>
                <Paragraph1 className="mt-1 text-xs text-gray-500">
                  {withdrawal.description}
                </Paragraph1>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}
              >
                {status.label}
              </span>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} className="shrink-0 text-gray-400" />
                {withdrawal.date
                  ? new Date(withdrawal.date).toLocaleDateString()
                  : "—"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ArrowUpRight size={14} className="shrink-0 text-gray-400" />
                Withdrawal
              </span>
            </div>

            <hr className="border-gray-200" />

            <div className="pt-4">
              <Paragraph1 className="text-xs text-gray-500">Amount</Paragraph1>
              <Paragraph1 className="text-lg font-bold text-gray-900">
                ₦{withdrawal.amount.toLocaleString("en-NG")}
              </Paragraph1>
            </div>
          </div>
        );
      })}
    </div>
  );
}
