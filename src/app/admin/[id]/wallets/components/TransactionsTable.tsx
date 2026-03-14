"use client";
// ENDPOINTS: GET /api/admin/wallets/transactions?search=&page=1&limit=20&type=&status=

import React, { useMemo } from "react";
import { ArrowUpRight, ArrowDownLeft, Send } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useWalletTransactions } from "@/lib/queries/admin/useWallets";
import { usePublicUserById } from "@/lib/queries/user/usePublicUserById";

interface TransactionsTableProps {
  searchQuery: string;
}

// Component to display a single transaction row
function TransactionRow({ transaction }: { transaction: any }) {
  // Extract user ID from wallet structure and fetch user details
  const userId = transaction.walletId; // We'll use walletId to identify unique wallet/user
  const userName = transaction.wallet?.user?.name || "Unknown User";
  const userEmail = transaction.wallet?.user?.email || "";

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const truncateId = (id: string): string => {
    return id.substring(0, 5);
  };

  const getFormattedDateTime = (
    dateString: string,
  ): { date: string; time: string } => {
    const date = new Date(dateString);
    const dateFormatted = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const timeFormatted = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return { date: dateFormatted, time: timeFormatted };
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

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

  const transactionType = getTransactionType(transaction.amount);
  const { date, time } = getFormattedDateTime(transaction.createdAt);

  const amountColor =
    transaction.amount > 0 ? "text-green-600" : "text-red-600";

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <Paragraph1 className="text-gray-900 font-medium">
          {truncateId(transaction.id)}
        </Paragraph1>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-semibold">
            {getInitials(userName)}
          </div>
          <div>
            <Paragraph1 className="font-medium text-gray-900">
              {userName}
            </Paragraph1>
            <span className="text-xs text-gray-500">{userEmail}</span>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {getTransactionIcon(transactionType)}
          <Paragraph1 className="font-medium text-gray-900 capitalize">
            {transaction.type?.toLowerCase() || "transfer"}
          </Paragraph1>
        </div>
      </td>
      <td className="px-6 py-4">
        <Paragraph1 className={`font-semibold ${amountColor}`}>
          {transaction.amount >= 0 ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </Paragraph1>
      </td>
      <td className="px-6 py-4">
        <Paragraph1 className="text-gray-600">-</Paragraph1>
      </td>
      <td className="px-6 py-4">
        <Paragraph1 className="text-gray-600">
          {transaction.note || "-"}
        </Paragraph1>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <Paragraph1 className="text-gray-600">{date}</Paragraph1>
          <Paragraph1 className="text-gray-500 text-xs">{time}</Paragraph1>
        </div>
      </td>
      <td className="px-6 py-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}
        >
          {getStatusLabel(transaction.status)}
        </span>
      </td>
    </tr>
  );
}

export default function TransactionsTable({
  searchQuery,
}: TransactionsTableProps) {
  const transactionsQuery = useWalletTransactions({ search: searchQuery });

  const filteredData = useMemo(() => {
    if (!transactionsQuery.data?.data?.transactions) return [];
    return transactionsQuery.data.data.transactions.filter(
      (item: any) =>
        (item.wallet?.user?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
          item.id?.toLowerCase().includes(searchQuery.toLowerCase())) ??
        false,
    );
  }, [transactionsQuery.data, searchQuery]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                TRANSACTION ID
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                USER
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                TYPE
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                AMOUNT
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                BALANCE
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                DESCRIPTION
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                DATE & TIME
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                STATUS
              </Paragraph1>
            </th>
          </tr>
        </thead>
        <tbody>
          {transactionsQuery.isPending ? (
            <tr>
              <td colSpan={8} className="px-6 py-8 text-center">
                <p className="text-gray-500">Loading transactions...</p>
              </td>
            </tr>
          ) : filteredData.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-8 text-center">
                <p className="text-gray-500">No transactions found</p>
              </td>
            </tr>
          ) : (
            filteredData.map((transaction: any) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
