// ENDPOINTS: GET /api/renters/wallet/transactions, GET /api/renters/wallet/withdraw/:withdrawalId

"use client";

import React, { useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineArrowUpRight, HiOutlineArrowDownLeft } from "react-icons/hi2";
import { FaLock } from "react-icons/fa";
import { useTransactions } from "@/lib/queries/renters/useTransactions";
import TransactionDetailView from "./TransactionDetailView";

// Map API transaction types to UI types
const getTransactionType = (
  apiType: "deposit" | "debit" | "refund" | "withdrawal",
) => {
  switch (apiType) {
    case "deposit":
      return "Credit";
    case "withdrawal":
      return "Debit";
    case "refund":
      return "Credit";
    case "debit":
      return "Debit";
    default:
      return "Locked";
  }
};

// Map API transaction status to UI status
const getTransactionStatus = (
  apiStatus: "completed" | "pending" | "failed",
) => {
  switch (apiStatus) {
    case "completed":
      return "Completed";
    case "pending":
      return "Locked";
    case "failed":
      return "Failed";
    default:
      return "Locked";
  }
};

interface TransactionItemProps {
  id: string;
  description: string;
  type: "Debit" | "Credit" | "Locked";
  date: string;
  amount: string;
  status: "Completed" | "Locked" | "Successful" | "Failed";
  onClick?: () => void;
}

// Skeleton Loader
const TransactionItemSkeleton = () => (
  <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 mb-3 animate-pulse">
    <div className="grid grid-cols-2 gap-4 lg:flex lg:flex-wrap lg:justify-between lg:items-start">
      <div className="space-y-2">
        <div className="h-3 w-12 bg-gray-200 rounded"></div>
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-12 bg-gray-200 rounded"></div>
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-16 bg-gray-200 rounded"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-12 bg-gray-200 rounded"></div>
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-12 bg-gray-200 rounded"></div>
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
      <div className="h-10 w-24 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// Revised Sub-component to render a single transaction Card/Div
const TransactionItem: React.FC<TransactionItemProps> = ({
  id,
  description,
  type,
  date,
  amount,
  status,
  onClick,
}) => {
  // Determine Type Icon and Color
  let typeIcon: React.ReactNode;
  let typeColorClass = "text-gray-900";

  switch (type) {
    case "Debit":
      typeIcon = <HiOutlineArrowUpRight className="w-4 h-4" />;
      break;
    case "Credit":
      typeIcon = <HiOutlineArrowDownLeft className="w-4 h-4" />;
      typeColorClass = "text-green-600";
      break;
    case "Locked":
      typeIcon = <FaLock className="w-3 h-3" />;
      typeColorClass = "text-orange-500";
      break;
    default:
      typeIcon = null;
  }

  // Determine Status Badge Color
  let statusBadgeClass = "";
  switch (status) {
    case "Completed":
    case "Successful":
      statusBadgeClass = "bg-green-100 text-green-800";
      break;
    case "Locked":
      statusBadgeClass = "bg-yellow-100 text-orange-800";
      break;
    case "Failed":
      statusBadgeClass = "bg-red-100 text-red-800";
      break;
    default:
      statusBadgeClass = "bg-gray-100 text-gray-800";
  }

  // Determine Amount Color
  const amountColorClass =
    type === "Credit" ? "text-green-600" : "text-gray-900";

  return (
    <div
      onClick={onClick}
      className="bg-white cursor-pointer p-4 sm:p-5 rounded-xl border border-gray-200 mb-3 hover:bg-gray-50 transition"
    >
      {/* Top Row */}
      <div
        className="
    grid grid-cols-2 gap-4
    lg:flex lg:flex-wrap lg:justify-between lg:items-start
  "
      >
        {/* ID */}
        <div className="">
          <Paragraph1 className="text-xs text-gray-500">ID</Paragraph1>
          <Paragraph1 className="text-xs font-bold ">{id}</Paragraph1>
        </div>
        {/* Type */}
        <div className="">
          <Paragraph1 className="text-xs text-gray-500">Type</Paragraph1>
          <div className="flex gap-2">
            <Paragraph1 className={`font-bold ${typeColorClass}`}>
              {type}
            </Paragraph1>
            <span className={`text-xs ${typeColorClass}`}>{typeIcon}</span>
          </div>
        </div>
        {/* Description */}
        <div>
          <Paragraph1 className="text-xs text-gray-500">Description</Paragraph1>
          <Paragraph1 className="text-sm font-semibold text-gray-900 leading-snug">
            {description}
          </Paragraph1>
        </div>
        <div className="">
          <Paragraph1 className="text-xs text-gray-500">Date</Paragraph1>
          <Paragraph1 className="text-xs">
            {new Date(date).toLocaleDateString()}
          </Paragraph1>
        </div>
        <div className="">
          <Paragraph1 className="text-xs text-gray-500">Amount</Paragraph1>
          <Paragraph1 className={`text-base font-bold ${amountColorClass}`}>
            {amount}
          </Paragraph1>
        </div>
        {/* Status */}
        <div className="flex flex-col sm:items-end shrink-0">
          <span
            className={`mt-1 px-4 py-2 rounded-lg text-xs font-medium ${statusBadgeClass}`}
          >
            {status}
          </span>
        </div>
      </div>
    </div>
  );
};

const AllTransactionsList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data, isLoading, error } = useTransactions(
    page,
    20,
    "all",
    "all",
    "newest",
  );

  if (isLoading) {
    return (
      <div className="font-sans pt-[30px]">
        <Paragraph1 className="text-xl font-extrabold text-gray-900 uppercase mb-4">
          All Transactions
        </Paragraph1>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <TransactionItemSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-sans pt-[30px]">
        <Paragraph1 className="text-xl font-extrabold text-gray-900 uppercase mb-4">
          All Transactions
        </Paragraph1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <Paragraph1 className="text-red-600">
            Failed to load transactions. Please try again.
          </Paragraph1>
        </div>
      </div>
    );
  }

  const transactions = data?.transactions || [];

  return (
    <div className="font-sans pt-[30px]">
      <Paragraph1 className="text-xl font-extrabold text-gray-900 uppercase mb-4">
        All Transactions
      </Paragraph1>

      {transactions.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Paragraph1 className="text-gray-600">
            No transactions found.
          </Paragraph1>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              id={tx.id}
              description={tx.description}
              type={getTransactionType(tx.type)}
              date={tx.timestamp || tx.date}
              amount={`${tx.type === "debit" ? "-" : "+"} ₦${tx.amount.toLocaleString()}`}
              status={getTransactionStatus(tx.status)}
              onClick={() => {
                setSelectedTx(tx);
                setIsDetailsOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.total > 20 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            Next
          </button>
        </div>
      )}

      {/* Transaction Details Panel */}
      <TransactionDetailView
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        transaction={selectedTx}
      />
    </div>
  );
};

export default AllTransactionsList;
