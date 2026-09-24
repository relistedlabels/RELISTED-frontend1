// ENDPOINTS: GET /api/admin/users/:userId/wallet, GET /api/admin/users/:userId/transactions
"use client";

import React from "react";
import { Download } from "lucide-react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
import {
  UserWallet as UserWalletType,
  Transaction,
} from "@/lib/api/admin/users";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";

interface UserWalletProps {
  wallet?: UserWalletType;
  transactions?: Transaction[];
  transactionsLoading?: boolean;
  transactionsError?: Error | null;
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "MAIN":
      return "text-blue-600 font-semibold";
    case "AVAILABLE":
      return "text-green-600 font-semibold";
    case "COLLATERAL":
      return "text-orange-600 font-semibold";
    default:
      return "text-gray-600 font-semibold";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return "bg-green-50 text-green-700";
    case "PENDING":
      return "bg-yellow-50 text-yellow-700";
    case "FAILED":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

const transactionColumns: ResponsiveColumnDef<Transaction>[] = [
  {
    id: "date",
    header: "Date",
    mobile: "detail",
    render: (transaction) => (
      <div>
        <Paragraph1 className="text-sm text-gray-700">
          {new Date(transaction.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })}
        </Paragraph1>
        <Paragraph1 className="text-xs text-gray-500">
          {new Date(transaction.createdAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Paragraph1>
      </div>
    ),
  },
  {
    id: "note",
    header: "Note",
    mobile: "primary",
    render: (transaction) => (
      <Paragraph1 className="text-sm text-gray-700">{transaction.note}</Paragraph1>
    ),
  },
  {
    id: "type",
    header: "Type",
    mobile: "detail",
    render: (transaction) => (
      <Paragraph1 className={getTypeColor(transaction.type)}>
        {transaction.type}
      </Paragraph1>
    ),
  },
  {
    id: "amount",
    header: "Amount",
    mobile: "detail",
    render: (transaction) => (
      <Paragraph1 className="text-sm font-semibold text-gray-900">
        ₦{transaction.amount.toLocaleString()}
      </Paragraph1>
    ),
  },
  {
    id: "status",
    header: "Status",
    mobile: "badge",
    render: (transaction) => (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(transaction.status)}`}
      >
        {transaction.status}
      </span>
    ),
  },
];

export default function UserWallet({
  wallet,
  transactions,
  transactionsLoading,
  transactionsError,
}: UserWalletProps) {
  if (!wallet) {
    return (
      <div className="py-12 text-center">
        <Paragraph1 className="text-gray-500">
          No wallet data available
        </Paragraph1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <Paragraph1 className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
            Main Balance
          </Paragraph1>
          <Paragraph3 className="text-2xl font-bold text-blue-900">
            ₦{wallet.mainBalance.toLocaleString()}
          </Paragraph3>
          <Paragraph1 className="mt-2 text-xs text-blue-600">
            Available for withdrawal
          </Paragraph1>
        </div>

        <div className="rounded-lg border border-green-200 bg-green-50 p-6">
          <Paragraph1 className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-600">
            Available Balance
          </Paragraph1>
          <Paragraph3 className="text-2xl font-bold text-green-900">
            ₦{wallet.availableBalance.toLocaleString()}
          </Paragraph3>
          <Paragraph1 className="mt-2 text-xs text-green-600">
            Pending transactions
          </Paragraph1>
        </div>

        <div className="rounded-lg border border-orange-200 bg-orange-50 p-6">
          <Paragraph1 className="mb-2 text-xs font-semibold uppercase tracking-wide text-orange-600">
            Collateral Balance
          </Paragraph1>
          <Paragraph3 className="text-2xl font-bold text-orange-900">
            ₦{wallet.collateralBalance.toLocaleString()}
          </Paragraph3>
          <Paragraph1 className="mt-2 text-xs text-orange-600">
            Collateral held
          </Paragraph1>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Paragraph1 className="text-xs text-gray-500">
          Last updated:{" "}
          {new Date(wallet.updatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Paragraph1>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <Download size={18} />
          Export Statement
        </button>
      </div>

      <div>
        <Paragraph3 className="mb-6 text-base font-bold text-gray-900">
          Transaction History
        </Paragraph3>

        {transactionsLoading ? (
          <TableSkeleton />
        ) : transactionsError ? (
          <Paragraph1 className="text-red-600">
            Error loading transactions
          </Paragraph1>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <ResponsiveDataTable
              rows={transactions ?? []}
              columns={transactionColumns}
              getRowKey={(transaction) => transaction.id}
              emptyState={
                <Paragraph1 className="py-8 text-center text-gray-500">
                  No transactions found
                </Paragraph1>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
