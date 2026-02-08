"use client";
// ENDPOINTS: GET /api/admin/disputes?status=pending&search=, GET /api/admin/disputes/:disputeId

import React, { useMemo } from "react";
import { Paragraph1 } from "@/common/ui/Text";

interface PendingDisputeData {
  id: string;
  raisedBy: string;
  raiserRole: string;
  raisedByAvatar: string;
  category: string;
  orderId: string;
  priority: "High" | "Medium" | "Low";
  dateCreated: string;
  status: "Pending";
}

interface PendingTableProps {
  searchQuery: string;
}

const mockPendingData: PendingDisputeData[] = [
  {
    id: "DQ-0345",
    raisedBy: "Chioma Eze",
    raiserRole: "Dresser",
    raisedByAvatar: "https://i.pravatar.cc/40?img=1",
    category: "Damaged Item",
    orderId: "#RLS-23984",
    priority: "High",
    dateCreated: "Nov 12, 2025",
    status: "Pending",
  },
];

export default function PendingTable({ searchQuery }: PendingTableProps) {
  const filteredData = useMemo(() => {
    return mockPendingData.filter(
      (item) =>
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.raisedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.orderId.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

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
                PRIORITY
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                DATE CREATED
              </Paragraph1>
            </th>
            <th className="px-6 py-4 text-left">
              <Paragraph1 className="text-gray-900 font-semibold">
                STATUS
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
                  No pending disputes found
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
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : item.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Paragraph1 className="text-gray-600">
                    {item.dateCreated}
                  </Paragraph1>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                    {item.status}
                  </span>
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
