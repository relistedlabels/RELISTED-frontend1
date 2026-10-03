// ENDPOINTS: GET /api/admin/users/:userId/disputes
"use client";

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
import { UserDispute } from "@/lib/api/admin/users";

interface UserDisputesProps {
  disputes: UserDispute[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Open":
      return "bg-red-50 text-red-700";
    case "Resolved":
      return "bg-green-50 text-green-700";
    case "Pending":
      return "bg-yellow-50 text-yellow-700";
    case "Closed":
      return "bg-gray-50 text-gray-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

const columns: ResponsiveColumnDef<UserDispute>[] = [
  {
    id: "disputeId",
    header: "Dispute ID",
    mobile: "detail",
    render: (dispute) => (
      <Paragraph1 className="text-sm font-semibold text-gray-900">
        {dispute.disputeId}
      </Paragraph1>
    ),
  },
  {
    id: "itemName",
    header: "Item Name",
    mobile: "primary",
    render: (dispute) => (
      <Paragraph1 className="text-sm text-gray-700">{dispute.itemName}</Paragraph1>
    ),
  },
  {
    id: "party",
    header: "Party",
    mobile: "detail",
    render: (dispute) => (
      <Paragraph1 className="text-sm text-gray-700">{dispute.party}</Paragraph1>
    ),
  },
  {
    id: "reason",
    header: "Reason",
    mobile: "detail",
    render: (dispute) => (
      <Paragraph1 className="max-w-xs truncate text-sm text-gray-700">
        {dispute.reason}
      </Paragraph1>
    ),
  },
  {
    id: "status",
    header: "Status",
    mobile: "badge",
    render: (dispute) => (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(dispute.status)}`}
      >
        {dispute.status}
      </span>
    ),
  },
  {
    id: "dateOpened",
    header: "Date Opened",
    mobile: "detail",
    render: (dispute) => (
      <Paragraph1 className="text-sm text-gray-700">
        {new Date(dispute.dateOpened).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
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
        View
      </button>
    ),
  },
];

export default function UserDisputes({ disputes }: UserDisputesProps) {
  return (
    <div>
      <Paragraph3 className="mb-6 text-base font-bold text-gray-900">
        Dispute History
      </Paragraph3>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <ResponsiveDataTable
          rows={disputes ?? []}
          columns={columns}
          getRowKey={(dispute) => dispute.id}
          emptyState={
            <Paragraph1 className="py-8 text-center text-gray-500">
              No disputes found
            </Paragraph1>
          }
        />
      </div>
    </div>
  );
}
