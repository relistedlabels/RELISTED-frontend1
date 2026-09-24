"use client";
// ENDPOINTS: GET /api/admin/wallets/escrow?search=&page=1&limit=20, PUT /api/admin/wallets/escrow/:escrowId/release

import React from "react";
import { Lock, Unlock, AlertCircle } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
import { useEscrows } from "@/lib/queries/admin/useWallets";
import AdminTablePagination, {
  EMPTY_WALLET_PAGINATION,
  useWalletTablePage,
} from "./AdminTablePagination";

interface EscrowTableProps {
  searchQuery: string;
}

type EscrowRow = {
  id: string;
  orderId?: string;
  userName?: string;
  renterName?: string;
  listerName?: string;
  curatorName?: string;
  lockedAmount?: number;
  amount?: number;
  reason?: string;
  lockedDate?: string;
  releaseDate?: string;
  status: string;
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);

const truncateEscrowId = (id: string): string => id.substring(0, 5);

const getFormattedDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case "locked":
      return <Lock size={16} className="text-orange-600" />;
    case "pending":
      return <AlertCircle size={16} className="text-yellow-600" />;
    case "released":
      return <Unlock size={16} className="text-green-600" />;
    case "partially_released":
      return <AlertCircle size={16} className="text-amber-600" />;
    case "refunded":
      return <Unlock size={16} className="text-gray-600" />;
    default:
      return null;
  }
};

const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "locked":
      return "bg-orange-100 text-orange-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "released":
      return "bg-green-100 text-green-700";
    case "partially_released":
      return "bg-amber-100 text-amber-800";
    case "refunded":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getStatusLabel = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "locked":
      return "Locked";
    case "pending":
      return "Pending";
    case "released":
      return "Released";
    case "partially_released":
      return "Partially released";
    case "refunded":
      return "Refunded";
    default:
      return status;
  }
};

const columns: ResponsiveColumnDef<EscrowRow>[] = [
  {
    id: "escrowId",
    header: "Escrow ID",
    mobile: "detail",
    render: (escrow) => (
      <Paragraph1 className="font-medium text-gray-900">
        {truncateEscrowId(escrow.id)}
      </Paragraph1>
    ),
  },
  {
    id: "orderId",
    header: "Order ID",
    mobile: "detail",
    render: (escrow) => (
      <Paragraph1 className="font-medium text-blue-600">
        {escrow.orderId || "N/A"}
      </Paragraph1>
    ),
  },
  {
    id: "renter",
    header: "Renter",
    mobile: "primary",
    render: (escrow) => (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-xs font-semibold text-gray-700">
          {getInitials(escrow.userName || "User")}
        </div>
        <Paragraph1 className="font-medium text-gray-900">
          {escrow.renterName ?? escrow.userName ?? "N/A"}
        </Paragraph1>
      </div>
    ),
  },
  {
    id: "lister",
    header: "Lister",
    mobile: "detail",
    render: (escrow) => (
      <Paragraph1 className="font-medium text-gray-900">
        {escrow.listerName ?? escrow.curatorName ?? "N/A"}
      </Paragraph1>
    ),
  },
  {
    id: "lockedAmount",
    header: "Locked Amount",
    mobile: "detail",
    render: (escrow) => (
      <Paragraph1 className="font-semibold text-orange-600">
        {formatCurrency(escrow.lockedAmount ?? escrow.amount ?? 0)}
      </Paragraph1>
    ),
  },
  {
    id: "reason",
    header: "Reason",
    mobile: "detail",
    render: (escrow) => (
      <Paragraph1 className="text-gray-600">{escrow.reason || "N/A"}</Paragraph1>
    ),
  },
  {
    id: "lockedDate",
    header: "Locked Date",
    mobile: "detail",
    render: (escrow) => (
      <Paragraph1 className="text-gray-600">
        {escrow.lockedDate ? getFormattedDate(escrow.lockedDate) : "N/A"}
      </Paragraph1>
    ),
  },
  {
    id: "releaseDate",
    header: "Release Date",
    mobile: "detail",
    render: (escrow) => (
      <Paragraph1 className="text-gray-600">
        {escrow.releaseDate ? getFormattedDate(escrow.releaseDate) : "N/A"}
      </Paragraph1>
    ),
  },
  {
    id: "status",
    header: "Status",
    mobile: "badge",
    render: (escrow) => (
      <div className="flex items-center gap-2">
        {getStatusIcon(escrow.status)}
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(escrow.status)}`}
        >
          {getStatusLabel(escrow.status)}
        </span>
      </div>
    ),
  },
];

export default function EscrowTable({ searchQuery }: EscrowTableProps) {
  const { page, setPage, limit } = useWalletTablePage(searchQuery);
  const escrowsQuery = useEscrows({ search: searchQuery, page, limit });
  const escrows = escrowsQuery.data?.data?.escrows ?? [];
  const pagination =
    escrowsQuery.data?.data?.pagination ?? EMPTY_WALLET_PAGINATION;

  return (
    <div>
      <ResponsiveDataTable
        rows={escrows as unknown as EscrowRow[]}
        columns={columns}
        getRowKey={(escrow) => escrow.id}
        loading={escrowsQuery.isPending}
        loadingState={
          <div className="px-4 py-8 text-center md:px-6">
            <p className="text-gray-500">Loading escrow records...</p>
          </div>
        }
        emptyState={
          <div className="px-4 py-8 text-center md:px-6">
            <p className="text-gray-500">No escrow records found</p>
          </div>
        }
      />
      <AdminTablePagination
        pagination={pagination}
        onPageChange={setPage}
        isLoading={escrowsQuery.isFetching}
      />
    </div>
  );
}
