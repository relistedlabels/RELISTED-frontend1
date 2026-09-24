"use client";
// ENDPOINTS: GET /api/admin/wallets?search=&page=1&limit=20

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
import { useWallets } from "@/lib/queries/admin/useWallets";
import AdminTablePagination, {
  EMPTY_WALLET_PAGINATION,
  useWalletTablePage,
} from "./AdminTablePagination";

interface WalletTableProps {
  searchQuery: string;
}

type WalletRow = {
  id: string;
  userId: string;
  mainBalance: number;
  availableBalance: number;
  collateralBalance: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
    role?: string;
    avatar?: string | null;
  };
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);

const truncateWalletId = (id: string): string => id.substring(0, 5);

const getLastUpdatedDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const getRoleBadgeColor = (role: string | undefined): string => {
  switch (role?.toLowerCase()) {
    case "lister":
      return "bg-blue-100 text-blue-700";
    case "renter":
      return "bg-purple-100 text-purple-700";
    case "admin":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

function buildWalletColumns(adminSegment: string): ResponsiveColumnDef<WalletRow>[] {
  return [
    {
      id: "walletId",
      header: "Wallet ID",
      mobile: "detail",
      render: (wallet) => (
        <Paragraph1 className="font-medium text-gray-900">
          {truncateWalletId(wallet.id)}
        </Paragraph1>
      ),
    },
    {
      id: "user",
      header: "User",
      mobile: "primary",
      render: (wallet) => (
        <div className="flex items-center gap-3">
          {wallet.user.avatar ? (
            <img
              src={wallet.user.avatar}
              alt={wallet.user.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-gray-700">
              {getInitials(wallet.user.name)}
            </div>
          )}
          <div>
            <Paragraph1 className="font-medium text-gray-900">
              {wallet.user.name}
            </Paragraph1>
            <span className="text-xs text-gray-500">{wallet.user.email}</span>
          </div>
        </div>
      ),
    },
    {
      id: "mainBalance",
      header: "Total Balance",
      mobile: "detail",
      render: (wallet) => (
        <Paragraph1 className="font-semibold text-gray-900">
          {formatCurrency(wallet.mainBalance)}
        </Paragraph1>
      ),
    },
    {
      id: "availableBalance",
      header: "Available",
      mobile: "detail",
      render: (wallet) => (
        <Paragraph1 className="font-medium text-green-600">
          {formatCurrency(wallet.availableBalance)}
        </Paragraph1>
      ),
    },
    {
      id: "collateralBalance",
      header: "Collateral",
      mobile: "detail",
      render: (wallet) => (
        <Paragraph1 className="font-medium text-orange-600">
          {formatCurrency(wallet.collateralBalance)}
        </Paragraph1>
      ),
    },
    {
      id: "role",
      header: "Role",
      mobile: "badge",
      render: (wallet) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getRoleBadgeColor(wallet.user.role)}`}
        >
          {wallet.user.role || "N/A"}
        </span>
      ),
    },
    {
      id: "lastUpdated",
      header: "Last Updated",
      mobile: "detail",
      render: (wallet) => (
        <Paragraph1 className="text-gray-600">
          {getLastUpdatedDate(wallet.createdAt)}
        </Paragraph1>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      mobile: "action",
      render: (wallet) => {
        const userHref =
          adminSegment && wallet.userId
            ? `/admin/${adminSegment}/users/${wallet.userId}`
            : "#";

        return (
          <Link
            href={userHref}
            className="inline-flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900"
            aria-label={`View user ${wallet.user.name}`}
          >
            <Paragraph1>View</Paragraph1> <ChevronRight size={16} />
          </Link>
        );
      },
    },
  ];
}

export default function WalletTable({ searchQuery }: WalletTableProps) {
  const params = useParams<{ id: string }>();
  const adminSegment = params?.id ?? "";
  const { page, setPage, limit } = useWalletTablePage(searchQuery);
  const walletsQuery = useWallets({ search: searchQuery, page, limit });
  const wallets = walletsQuery.data?.data?.wallets ?? [];
  const pagination =
    walletsQuery.data?.data?.pagination ?? EMPTY_WALLET_PAGINATION;
  const columns = buildWalletColumns(adminSegment);

  return (
    <div>
      <ResponsiveDataTable
        rows={wallets as unknown as WalletRow[]}
        columns={columns}
        getRowKey={(wallet) => wallet.id}
        loading={walletsQuery.isPending}
        loadingState={
          <div className="px-4 py-8 text-center md:px-6">
            <p className="text-gray-500">Loading wallets...</p>
          </div>
        }
        emptyState={
          <div className="px-4 py-8 text-center md:px-6">
            <p className="text-gray-500">No wallets found</p>
          </div>
        }
      />
      <AdminTablePagination
        pagination={pagination}
        onPageChange={setPage}
        isLoading={walletsQuery.isFetching}
      />
    </div>
  );
}
