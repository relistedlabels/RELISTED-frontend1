"use client";
// ENDPOINTS: GET /api/admin/wallets/escrow?search=&page=1&limit=20, PUT /api/admin/wallets/escrow/:escrowId/release

import React from "react";
import { Lock, Unlock, AlertCircle } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { useEscrows } from "@/lib/queries/admin/useWallets";
import { usePublicUserById } from "@/lib/queries/user/usePublicUserById";
import AdminTablePagination, {
  EMPTY_WALLET_PAGINATION,
  useWalletTablePage,
} from "./AdminTablePagination";

interface EscrowTableProps {
  searchQuery: string;
}

// Component to display a single escrow row with user details
function EscrowRow({ escrow }: { escrow: any }) {
  const { data: userDetails, isLoading } = usePublicUserById(escrow.userId);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const truncateEscrowId = (id: string): string => {
    return id.substring(0, 5);
  };

  const getFormattedDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

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

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <Paragraph1 className="text-gray-900 font-medium">
          {truncateEscrowId(escrow.id)}
        </Paragraph1>
      </td>
      <td className="px-6 py-4">
        <Paragraph1 className="font-medium text-blue-600">
          {escrow.orderId || "N/A"}
        </Paragraph1>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {userDetails?.avatar ? (
            <img
              src={userDetails.avatar}
              alt={escrow.userName || "User"}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs font-semibold">
              {getInitials(escrow.userName || "User")}
            </div>
          )}
          <Paragraph1 className="font-medium text-gray-900">
            {escrow.renterName ?? escrow.userName ?? "N/A"}
          </Paragraph1>
        </div>
      </td>
      <td className="px-6 py-4">
        <Paragraph1 className="text-gray-900 font-medium">
          {escrow.listerName ?? escrow.curatorName ?? "N/A"}
        </Paragraph1>
      </td>
      <td className="px-6 py-4">
        <Paragraph1 className="font-semibold text-orange-600">
          {formatCurrency(escrow.lockedAmount ?? escrow.amount ?? 0)}
        </Paragraph1>
      </td>
      <td className="px-6 py-4">
        <Paragraph1 className="text-gray-600">
          {escrow.reason || "N/A"}
        </Paragraph1>
      </td>
      <td className="px-6 py-4">
        <Paragraph1 className="text-gray-600">
          {escrow.lockedDate ? getFormattedDate(escrow.lockedDate) : "N/A"}
        </Paragraph1>
      </td>
      <td className="px-6 py-4">
        <Paragraph1 className="text-gray-600">
          {escrow.releaseDate ? getFormattedDate(escrow.releaseDate) : "N/A"}
        </Paragraph1>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          {getStatusIcon(escrow.status)}
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(escrow.status)}`}
          >
            {getStatusLabel(escrow.status)}
          </span>
        </div>
      </td>
    </tr>
  );
}

export default function EscrowTable({ searchQuery }: EscrowTableProps) {
  const { page, setPage, limit } = useWalletTablePage(searchQuery);
  const escrowsQuery = useEscrows({ search: searchQuery, page, limit });
  const escrows = escrowsQuery.data?.data?.escrows ?? [];
  const pagination =
    escrowsQuery.data?.data?.pagination ?? EMPTY_WALLET_PAGINATION;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                ESCROW ID
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                ORDER ID
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                RENTER
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                LISTER
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                LOCKED AMOUNT
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                REASON
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                LOCKED DATE
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                RELEASE DATE
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
          {escrowsQuery.isPending ? (
            <tr>
              <td colSpan={9} className="px-6 py-8 text-center">
                <p className="text-gray-500">Loading escrow records...</p>
              </td>
            </tr>
          ) : escrows.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-6 py-8 text-center">
                <p className="text-gray-500">No escrow records found</p>
              </td>
            </tr>
          ) : (
            escrows.map((escrow: any) => (
              <EscrowRow key={escrow.id} escrow={escrow} />
            ))
          )}
        </tbody>
      </table>
      </div>
      <AdminTablePagination
        pagination={pagination}
        onPageChange={setPage}
        isLoading={escrowsQuery.isFetching}
      />
    </div>
  );
}
