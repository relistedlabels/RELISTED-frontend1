"use client";

import React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
import { usePayouts } from "@/lib/queries/admin/useWallets";
import AdminTablePagination, {
  EMPTY_WALLET_PAGINATION,
  useWalletTablePage,
} from "./AdminTablePagination";

interface PayoutsTableProps {
  searchQuery: string;
}

type PayoutRow = {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  bankAccount: {
    accountNumber: string;
    bankName: string;
    accountName: string;
  };
  amount: number;
  status: "completed" | "paid";
  completedDate: string;
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);

const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

const getCompleteDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const columns: ResponsiveColumnDef<PayoutRow>[] = [
  {
    id: "user",
    header: "User",
    mobile: "primary",
    render: (payout) => (
      <div className="flex items-center gap-3">
        {payout.user.avatar ? (
          <img
            src={payout.user.avatar}
            alt={payout.user.name}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-gray-700">
            {getInitials(payout.user.name)}
          </div>
        )}
        <div>
          <Paragraph1 className="font-medium text-gray-900">
            {payout.user.name}
          </Paragraph1>
          <span className="text-xs text-gray-500">{payout.user.email}</span>
        </div>
      </div>
    ),
  },
  {
    id: "bankAccount",
    header: "Bank Account",
    mobile: "detail",
    render: (payout) => (
      <div>
        <Paragraph1 className="font-medium text-gray-900">
          {payout.bankAccount.accountNumber}
        </Paragraph1>
        <span className="text-xs text-gray-500">
          {payout.bankAccount.bankName}
        </span>
      </div>
    ),
  },
  {
    id: "amount",
    header: "Amount",
    mobile: "detail",
    render: (payout) => (
      <Paragraph1 className="font-semibold text-gray-900">
        {formatCurrency(payout.amount)}
      </Paragraph1>
    ),
  },
  {
    id: "status",
    header: "Status",
    mobile: "badge",
    render: () => (
      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
        Completed
      </span>
    ),
  },
  {
    id: "completedDate",
    header: "Completed Date",
    mobile: "detail",
    render: (payout) => (
      <Paragraph1 className="text-gray-600">
        {getCompleteDate(payout.completedDate)}
      </Paragraph1>
    ),
  },
];

export default function PayoutsTable({ searchQuery }: PayoutsTableProps) {
  const { page, setPage, limit } = useWalletTablePage(searchQuery);
  const payoutsQuery = usePayouts({ search: searchQuery, page, limit });
  const payouts = payoutsQuery.data?.data?.payouts ?? [];
  const pagination =
    payoutsQuery.data?.data?.pagination ?? EMPTY_WALLET_PAGINATION;

  return (
    <div>
      <ResponsiveDataTable
        rows={payouts as unknown as PayoutRow[]}
        columns={columns}
        getRowKey={(payout) => payout.id}
        loading={payoutsQuery.isPending}
        loadingState={
          <div className="px-4 py-8 text-center md:px-6">
            <p className="text-gray-500">Loading payouts...</p>
          </div>
        }
        emptyState={
          <div className="px-4 py-8 text-center md:px-6">
            <p className="text-gray-500">No payouts found</p>
          </div>
        }
      />
      <AdminTablePagination
        pagination={pagination}
        onPageChange={setPage}
        isLoading={payoutsQuery.isFetching}
      />
    </div>
  );
}
