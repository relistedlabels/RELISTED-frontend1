// ENDPOINTS: GET /api/admin/users/:userId/disputes
"use client";

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface Dispute {
  id: string;
  itemName: string;
  status: "Open" | "Resolved" | "Pending" | "Closed";
  dateOpened: string;
}

interface User {
  name: string;
}

interface UserDisputesProps {
  user: User;
}

const DISPUTES: Dispute[] = [
  {
    id: "D001",
    itemName: "Hermes Silk Scarf",
    status: "Open",
    dateOpened: "Nov 4, 2024",
  },
  {
    id: "D002",
    itemName: "Prada Handbag",
    status: "Resolved",
    dateOpened: "Oct 20, 2024",
  },
];

const getStatusColor = (status: "Open" | "Resolved" | "Pending" | "Closed") => {
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

export default function UserDisputes({ user }: UserDisputesProps) {
  return (
    <div>
      <Paragraph3 className="text-base font-bold mb-6 text-gray-900">
        Dispute History
      </Paragraph3>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-white">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Dispute ID
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Item Name
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Date Opened
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {DISPUTES.map((dispute) => (
                <tr
                  key={dispute.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="py-4 px-6">
                    <Paragraph1 className="text-sm font-semibold text-gray-900">
                      {dispute.id}
                    </Paragraph1>
                  </td>
                  <td className="py-4 px-6">
                    <Paragraph1 className="text-sm text-gray-700">
                      {dispute.itemName}
                    </Paragraph1>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        dispute.status,
                      )}`}
                    >
                      {dispute.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <Paragraph1 className="text-sm text-gray-700">
                      {dispute.dateOpened}
                    </Paragraph1>
                  </td>
                  <td className="py-4 px-6">
                    <button className="text-sm font-medium text-gray-900 hover:text-gray-600 transition">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
