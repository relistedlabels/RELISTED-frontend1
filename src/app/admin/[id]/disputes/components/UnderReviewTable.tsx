"use client";
// ENDPOINTS: GET /api/admin/disputes?status=under-review&search=, GET /api/admin/disputes/:disputeId, PUT /api/admin/disputes/:disputeId/assign

import React, { useMemo } from "react";
import { Paragraph1 } from "@/common/ui/Text";

interface UnderReviewDisputeData {
  id: string;
  raisedBy: string;
  raiserRole: string;
  raisedByAvatar: string;
  category: string;
  orderId: string;
  priority: "High" | "Medium" | "Low";
  dateCreated: string;
  assignedTo: string;
  status: "Under Review";
}

interface UnderReviewTableProps {
  searchQuery: string;
}

const mockUnderReviewData: UnderReviewDisputeData[] = [
  {
    id: "DQ-0346",
    raisedBy: "Ada Okafor",
    raiserRole: "Curator",
    raisedByAvatar: "https://i.pravatar.cc/40?img=2",
    category: "Late Return",
    orderId: "#RLS-23985",
    priority: "Medium",
    dateCreated: "Nov 10, 2025",
    assignedTo: "Grace Adebayo",
    status: "Under Review",
  },
  {
    id: "DQ-0347",
    raisedBy: "Ngozi Bello",
    raiserRole: "Dresser",
    raisedByAvatar: "https://i.pravatar.cc/40?img=3",
    category: "Payment Dispute",
    orderId: "#RLS-23986",
    priority: "High",
    dateCreated: "Nov 8, 2025",
    assignedTo: "Kemi Okoye",
    status: "Under Review",
  },
];

export default function UnderReviewTable({
  searchQuery,
}: UnderReviewTableProps) {
  const filteredData = useMemo(() => {
    return mockUnderReviewData.filter(
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
                ASSIGNED TO
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
                  No disputes under review found
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
                  <Paragraph1 className="text-gray-600">
                    {item.assignedTo}
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
