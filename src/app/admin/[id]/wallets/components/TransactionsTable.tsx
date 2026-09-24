"use client";
// ENDPOINTS: GET /api/admin/wallets/transactions?search=&page=1&limit=20&type=&status=

import React from "react";
import { ArrowUpRight, ArrowDownLeft, Send } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
import { useWalletTransactions } from "@/lib/queries/admin/useWallets";
import AdminTablePagination, {
  EMPTY_WALLET_PAGINATION,
  useWalletTablePage,
} from "./AdminTablePagination";

interface TransactionsTableProps {
  searchQuery: string;
}

type TransactionRow = {
  id: string;
  walletId: string;
  amount: number;
  type?: string;
  status: string;
  note?: string;
  createdAt: string;
  wallet?: {
    user?: {
      name?: string;
      email?: string;
    };
  };
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(Math.abs(amount));

const truncateId = (id: string): string => id.substring(0, 5);

const getFormattedDateTime = (
  dateString: string,
): { date: string; time: string } => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
};

const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

const getTransactionType = (
  amount: number,
): "deposit" | "withdrawal" | "transfer" => {
  if (amount > 0) return "deposit";
  if (amount < 0) return "withdrawal";
  return "transfer";
};

const getTransactionIcon = (type: "deposit" | "withdrawal" | "transfer") => {
  switch (type) {
    case "deposit":
      return <ArrowDownLeft size={16} className="text-green-600" />;
    case "withdrawal":
      return <ArrowUpRight size={16} className="text-red-600" />;
    case "transfer":
      return <Send size={16} className="text-blue-600" />;
    default:
      return null;
  }
};

const getStatusColor = (status: string): string => {
  switch (status?.toUpperCase()) {
    case "SUCCESS":
      return "bg-green-100 text-green-700";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700";
    case "FAILED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getStatusLabel = (status: string): string => {
  switch (status?.toUpperCase()) {
    case "SUCCESS":
      return "Completed";
    case "PENDING":
      return "Pending";
    case "FAILED":
      return "Failed";
    default:
      return status;
  }
};

const columns: ResponsiveColumnDef<TransactionRow>[] = [
  {
    id: "transactionId",
    header: "Transaction ID",
    mobile: "detail",
    render: (transaction) => (
      <Paragraph1 className="font-medium text-gray-900">
        {truncateId(transaction.id)}
      </Paragraph1>
    ),
  },
  {
    id: "user",
    header: "User",
    mobile: "primary",
    render: (transaction) => {
      const userName = transaction.wallet?.user?.name || "Unknown User";
      const userEmail = transaction.wallet?.user?.email || "";
      return (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-gray-700">
            {getInitials(userName)}
          </div>
          <div>
            <Paragraph1 className="font-medium text-gray-900">
              {userName}
            </Paragraph1>
            <span className="text-xs text-gray-500">{userEmail}</span>
          </div>
        </div>
      );
    },
  },
  {
    id: "type",
    header: "Type",
    mobile: "detail",
    render: (transaction) => {
      const transactionType = getTransactionType(transaction.amount);
      return (
        <div className="flex items-center gap-2">
          {getTransactionIcon(transactionType)}
          <Paragraph1 className="font-medium capitalize text-gray-900">
            {transaction.type?.toLowerCase() || "transfer"}
          </Paragraph1>
        </div>
      );
    },
  },
  {
    id: "amount",
    header: "Amount",
    mobile: "detail",
    render: (transaction) => {
      const amountColor =
        transaction.amount > 0 ? "text-green-600" : "text-red-600";
      return (
        <Paragraph1 className={`font-semibold ${amountColor}`}>
          {transaction.amount >= 0 ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </Paragraph1>
      );
    },
  },
  {
    id: "balance",
    header: "Balance",
    mobile: "hidden",
    render: () => <Paragraph1 className="text-gray-600">-</Paragraph1>,
  },
  {
    id: "description",
    header: "Description",
    mobile: "detail",
    render: (transaction) => (
      <Paragraph1 className="text-gray-600">
        {transaction.note || "-"}
      </Paragraph1>
    ),
  },
  {
    id: "dateTime",
    header: "Date & Time",
    mobile: "detail",
    render: (transaction) => {
      const { date, time } = getFormattedDateTime(transaction.createdAt);
      return (
        <div className="flex flex-col">
          <Paragraph1 className="text-gray-600">{date}</Paragraph1>
          <Paragraph1 className="text-xs text-gray-500">{time}</Paragraph1>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    mobile: "badge",
    render: (transaction) => (
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(transaction.status)}`}
      >
        {getStatusLabel(transaction.status)}
      </span>
    ),
  },
];

export default function TransactionsTable({
  searchQuery,
}: TransactionsTableProps) {
  const { page, setPage, limit } = useWalletTablePage(searchQuery);
  const transactionsQuery = useWalletTransactions({
    search: searchQuery,
    page,
    limit,
  });
  const transactions = transactionsQuery.data?.data?.transactions ?? [];
  const pagination =
    transactionsQuery.data?.data?.pagination ?? EMPTY_WALLET_PAGINATION;

  return (
    <div>
      <ResponsiveDataTable
        rows={transactions as unknown as TransactionRow[]}
        columns={columns}
        getRowKey={(transaction) => transaction.id}
        loading={transactionsQuery.isPending}
        loadingState={
          <div className="px-4 py-8 text-center md:px-6">
            <p className="text-gray-500">Loading transactions...</p>
          </div>
        }
        emptyState={
          <div className="px-4 py-8 text-center md:px-6">
            <p className="text-gray-500">No transactions found</p>
          </div>
        }
      />
      <AdminTablePagination
        pagination={pagination}
        onPageChange={setPage}
        isLoading={transactionsQuery.isFetching}
      />
    </div>
  );
}
