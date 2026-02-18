"use client";
// ENDPOINTS: GET /api/admin/disputes?status=resolved&search=, GET /api/admin/disputes/:disputeId

import React, { useMemo } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import type { Dispute } from "@/lib/api/admin/disputes";

interface ResolvedDisputeData {
  id: string;
  raisedBy: string;
  raiserRole: string;
  raisedByAvatar: string;
  category: string;
  orderId: string;
  resolution: string;
  dateCreated: string;
  dateResolved: string;
  status: "Resolved";
}

interface ResolvedTableProps {
  searchQuery: string;
  disputes?: Dispute[];
}

const mockResolvedData: ResolvedDisputeData[] = [
  {
    id: "DQ-0340",
    raisedBy: "Amara Obi",
    raiserRole: "Dresser",
    raisedByAvatar: "https://i.pravatar.cc/40?img=4",
    category: "Item Quality",
    orderId: "#RLS-23980",
    resolution: "Refund Issued",
    dateCreated: "Oct 28, 2025",
    dateResolved: "Nov 5, 2025",
    status: "Resolved",
  },
  {
    id: "DQ-0341",
    raisedBy: "Chukwu Emma",
    raiserRole: "Curator",
    raisedByAvatar: "https://i.pravatar.cc/40?img=5",
    category: "Dispute Cleared",
    orderId: "#RLS-23981",
    resolution: "Both Parties Agreed",
    dateCreated: "Oct 25, 2025",
    dateResolved: "Nov 1, 2025",
    status: "Resolved",
  },
];

// Transform Dispute API response to display format
function transformDisputeData(dispute: Dispute): ResolvedDisputeData {
  const dateStr = new Date(dispute.dateCreated).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return {
    id: dispute.id,
    raisedBy: dispute.raisedBy.name,
    raiserRole: dispute.raisedBy.role,
    raisedByAvatar: dispute.raisedBy.avatar,
    category: dispute.category,
    orderId: dispute.orderId,
    resolution: "Resolved",
    dateCreated: dateStr,
    dateResolved: dateStr,
    status: "Resolved",
  };
}

export default function ResolvedTable({
  searchQuery,
  disputes,
}: ResolvedTableProps) {
  const displayData = disputes?.map(transformDisputeData) ?? mockResolvedData;

  const filteredData = useMemo(() => {
    return displayData.filter(
      (item) =>
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.raisedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.orderId.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, displayData]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                DISPUTE ID
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                RAISED BY
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                CATEGORY
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                ORDER ID
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                RESOLUTION
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                DATE CREATED
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                DATE RESOLVED
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                ACTION
              </Paragraph1>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-6 py-8 text-center">
                <Paragraph1 className="text-gray-500">
                  No resolved disputes found
                </Paragraph1>
              </td>
            </tr>
          ) : (
            filteredData.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <Paragraph1 className="text-gray-900 font-medium">
                    {item.id}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.raisedByAvatar}
                      alt={item.raisedBy}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <Paragraph1 className="font-medium text-gray-900">
                        {item.raisedBy}
                      </Paragraph1>
                      <Paragraph1 className="text-gray-500 text-xs">
                        {item.raiserRole}
                      </Paragraph1>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="text-gray-600">
                    {item.category}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="text-gray-900 font-medium">
                    {item.orderId}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="text-gray-600">
                    {item.resolution}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="text-gray-600">
                    {item.dateCreated}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="text-gray-600">
                    {item.dateResolved}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
                    <Paragraph1>View Details</Paragraph1>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
