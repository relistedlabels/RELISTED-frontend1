"use client";

// ENDPOINTS: GET /api/admin/wallets/transactions?search=&page=1&limit=20&type=&status=

import { ArrowDownLeft, ArrowUpRight, Send } from "lucide-react";
import {
  type ResponsiveColumnDef,
  ResponsiveDataTable,
} from "@/common/ui/ResponsiveDataTable";
import { Paragraph1 } from "@/common/ui/Text";
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
    headerClassName: "w-28",
    cellClassName: "align-middle",
    render: (transaction) => (
      <Paragraph1 className="font-mono text-xs font-medium text-gray-600">
        {truncateId(transaction.id)}
      </Paragraph1>
    ),
  },
  {
    id: "user",
    header: "User",
    mobile: "primary",
    headerClassName: "w-56",
    cellClassName: "align-middle",
    render: (transaction) => {
      const userName = transaction.wallet?.user?.name || "Unknown User";
      const userEmail = transaction.wallet?.user?.email || "";
      return (
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 ring-1 ring-inset ring-gray-200">
            {getInitials(userName)}
          </div>
          <div className="min-w-0">
            <Paragraph1 className="truncate font-medium text-gray-900">
              {userName}
            </Paragraph1>
            <span className="block truncate text-xs text-gray-500">
              {userEmail}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    id: "type",
    header: "Type",
    mobile: "detail",
    headerClassName: "w-32",
    cellClassName: "align-middle",
    render: (transaction) => {
      const transactionType = getTransactionType(transaction.amount);
      return (
        <div className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
              transactionType === "deposit"
                ? "bg-green-50"
                : transactionType === "withdrawal"
                  ? "bg-red-50"
                  : "bg-blue-50"
            }`}
          >
            {getTransactionIcon(transactionType)}
          </span>
          <Paragraph1 className="font-medium capitalize text-gray-800">
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
    headerClassName: "w-36",
    cellClassName: "align-middle whitespace-nowrap",
    render: (transaction) => {
      const amountColor =
        transaction.amount > 0 ? "text-green-600" : "text-red-600";
      return (
        <Paragraph1 className={`font-semibold tabular-nums ${amountColor}`}>
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
    headerClassName: "w-28",
    cellClassName: "align-middle",
    render: () => <Paragraph1 className="text-gray-600">-</Paragraph1>,
  },
  {
    id: "description",
    header: "Description",
    mobile: "detail",
    cellClassName: "align-middle",
    render: (transaction) => (
      <Paragraph1 className="line-clamp-2 text-sm leading-5 text-gray-600">
        {transaction.note || "-"}
      </Paragraph1>
    ),
  },
  {
    id: "dateTime",
    header: "Date & Time",
    mobile: "detail",
    headerClassName: "w-40",
    cellClassName: "align-middle whitespace-nowrap",
    render: (transaction) => {
      const { date, time } = getFormattedDateTime(transaction.createdAt);
      return (
        <div className="flex flex-col">
          <Paragraph1 className="text-sm font-medium text-gray-700">
            {date}
          </Paragraph1>
          <Paragraph1 className="text-xs text-gray-500">{time}</Paragraph1>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    mobile: "badge",
    headerClassName: "w-36",
    cellClassName: "align-middle",
    render: (transaction) => (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusColor(transaction.status)}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
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
        tableClassName="w-full table-fixed"
        desktopMinWidthClassName="min-w-[1120px]"
        loading={transactionsQuery.isPending}
        loadingState={
          <div className="px-4 py-8 text-center md:px-6">
            <p className="text-gray-500">Loading transactions...</p>
          </div>
        }
        emptyState={
          transactionsQuery.isError ? (
            <div className="px-4 py-8 text-center md:px-6">
              <p className="text-red-600">
                Could not load transactions. Please try again.
              </p>
            </div>
          ) : (
            <div className="px-4 py-8 text-center md:px-6">
              <p className="text-gray-500">No transactions found</p>
            </div>
          )
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
