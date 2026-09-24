// ENDPOINTS: GET /api/admin/users/:userId/transactions
"use client";

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
import { Transaction } from "@/lib/api/admin/users";

interface UserTransactionsProps {
  transactions: Transaction[];
}

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

const getTypeColor = (type: string) => {
  switch (type) {
    case "AVAILABLE":
      return "text-green-600 font-semibold";
    case "MAIN":
      return "text-blue-600 font-semibold";
    case "COLLATERAL":
      return "text-orange-600 font-semibold";
    default:
      return "text-gray-600 font-semibold";
  }
};

const columns: ResponsiveColumnDef<Transaction>[] = [
  {
    id: "date",
    header: "Date",
    mobile: "detail",
    render: (transaction) => (
      <Paragraph1 className="text-sm text-gray-700">
        {new Date(transaction.createdAt).toLocaleDateString()}
      </Paragraph1>
    ),
  },
  {
    id: "description",
    header: "Description",
    mobile: "primary",
    render: (transaction) => (
      <Paragraph1 className="text-sm font-medium text-gray-900">
        {transaction.note}
      </Paragraph1>
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
  {
    id: "action",
    header: "Action",
    mobile: "action",
    render: () => (
      <button
        type="button"
        className="text-sm font-medium text-gray-900 transition hover:text-gray-600"
      >
        View Details
      </button>
    ),
  },
];

export default function UserTransactions({
  transactions,
}: UserTransactionsProps) {
  return (
    <div>
      <Paragraph3 className="mb-6 text-base font-bold text-gray-900">
        Transaction History
      </Paragraph3>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <ResponsiveDataTable
          rows={transactions ?? []}
          columns={columns}
          getRowKey={(transaction) => transaction.id}
          emptyState={
            <Paragraph1 className="py-8 text-center text-gray-500">
              No transactions found
            </Paragraph1>
          }
        />
      </div>
    </div>
  );
}
