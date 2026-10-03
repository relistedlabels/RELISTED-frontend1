// ENDPOINTS: GET /api/admin/users/:userId/rentals
"use client";

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
import { UserRental } from "@/lib/api/admin/users";

interface UserRecordsProps {
  rentals: UserRental[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Delivered":
      return "bg-green-50 text-green-700";
    case "Return Due":
      return "bg-yellow-50 text-yellow-700";
    case "Completed":
      return "bg-green-50 text-green-700";
    case "In Transit":
      return "bg-blue-50 text-blue-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

const columns: ResponsiveColumnDef<UserRental>[] = [
  {
    id: "item",
    header: "Item",
    mobile: "primary",
    render: (record) => (
      <div className="flex items-center gap-3">
        <img
          src={record.itemImage}
          alt={record.itemName}
          className="h-12 w-12 rounded object-cover"
        />
        <Paragraph1 className="text-sm font-medium text-gray-900">
          {record.itemName}
        </Paragraph1>
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    mobile: "badge",
    render: (record) => (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(record.status)}`}
      >
        {record.status}
      </span>
    ),
  },
  {
    id: "returnDue",
    header: "Return Due",
    mobile: "detail",
    render: (record) => (
      <Paragraph1 className="text-sm text-gray-700">
        {new Date(record.returnDue).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </Paragraph1>
    ),
  },
  {
    id: "amount",
    header: "Amount",
    mobile: "detail",
    render: (record) => (
      <Paragraph1 className="text-sm font-semibold text-gray-900">
        ₦{record.amount.toLocaleString()}
      </Paragraph1>
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

export default function UserRecords({ rentals }: UserRecordsProps) {
  return (
    <div>
      <Paragraph3 className="mb-6 text-base font-bold text-gray-900">
        Rental History
      </Paragraph3>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <ResponsiveDataTable
          rows={rentals ?? []}
          columns={columns}
          getRowKey={(record) => record.id}
          emptyState={
            <Paragraph1 className="py-8 text-center text-gray-500">
              No rental records found
            </Paragraph1>
          }
        />
      </div>
    </div>
  );
}
