"use client";

import React, { useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
import { useRentalHistory } from "@/lib/queries/admin/useRentalHistory";

interface RentalHistoryTabProps {
  listerUserId?: string;
  productId?: string;
}

type RentalRow = {
  id: string;
  dresserImage: string;
  dresserName: string;
  duration: string;
  dateRange: string;
  status: string;
  total: string;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-50 text-green-700";
    case "Pending Return":
      return "bg-yellow-50 text-yellow-700";
    case "In Transit":
      return "bg-blue-50 text-blue-700";
    case "Cancelled":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

const columns: ResponsiveColumnDef<RentalRow>[] = [
  {
    id: "dresser",
    header: "Dresser",
    mobile: "primary",
    render: (rental) => (
      <div className="flex items-center gap-3">
        <img
          src={rental.dresserImage}
          alt={rental.dresserName}
          className="h-8 w-8 rounded-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <Paragraph1 className="text-sm font-medium text-gray-900">
          {rental.dresserName}
        </Paragraph1>
      </div>
    ),
  },
  {
    id: "duration",
    header: "Duration",
    mobile: "detail",
    render: (rental) => (
      <div>
        <Paragraph1 className="text-sm font-medium text-gray-900">
          {rental.duration}
        </Paragraph1>
        <Paragraph1 className="text-xs text-gray-500">
          {rental.dateRange}
        </Paragraph1>
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    mobile: "badge",
    render: (rental) => (
      <span
        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(rental.status)}`}
      >
        {rental.status}
      </span>
    ),
  },
  {
    id: "total",
    header: "Total",
    mobile: "detail",
    render: (rental) => (
      <Paragraph1 className="text-sm font-medium text-gray-900">
        {rental.total}
      </Paragraph1>
    ),
  },
  {
    id: "order",
    header: "Order",
    mobile: "action",
    render: () => (
      <button
        type="button"
        className="text-sm font-medium text-blue-600 transition hover:text-blue-800"
      >
        View Order
      </button>
    ),
  },
];

export default function RentalHistoryTab({
  listerUserId,
}: RentalHistoryTabProps) {
  const [page, setPage] = useState(1);
  const limit = 20;

  const {
    data: rentalResponse,
    isLoading,
    error,
  } = useRentalHistory(listerUserId || "", page, limit, !!listerUserId);

  const rentals = (rentalResponse?.data?.rentals as RentalRow[]) || [];
  const total = rentalResponse?.data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  if (error) {
    return (
      <div className="py-8 text-center">
        <Paragraph1 className="text-red-600">
          Failed to load rental history
        </Paragraph1>
      </div>
    );
  }

  return (
    <div>
      <ResponsiveDataTable
        rows={rentals}
        columns={columns}
        getRowKey={(rental) => rental.id}
        loading={isLoading}
        loadingState={
          <div className="flex items-center justify-center py-12">
            <Paragraph1 className="text-gray-500">Loading rental history...</Paragraph1>
          </div>
        }
        emptyState={
          <div className="py-8 text-center">
            <Paragraph1 className="text-gray-500">
              No rental history found
            </Paragraph1>
          </div>
        }
      />
      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-2 py-1.5 text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
