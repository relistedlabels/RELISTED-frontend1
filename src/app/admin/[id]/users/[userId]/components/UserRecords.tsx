// ENDPOINTS: GET /api/admin/users/:userId/rentals
"use client";

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
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

export default function UserRecords({ rentals }: UserRecordsProps) {
  return (
    <div>
      <Paragraph3 className="text-base font-bold mb-6 text-gray-900">
        Rental History
      </Paragraph3>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-white">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Item
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Return Due
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Amount
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {rentals && rentals.length > 0 ? (
                rentals.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={record.itemImage}
                          alt={record.itemName}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <Paragraph1 className="text-sm font-medium text-gray-900">
                          {record.itemName}
                        </Paragraph1>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          record.status,
                        )}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Paragraph1 className="text-sm text-gray-700">
                        {new Date(record.returnDue).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </Paragraph1>
                    </td>
                    <td className="py-4 px-6">
                      <Paragraph1 className="text-sm font-semibold text-gray-900">
                        ₦{record.amount.toLocaleString()}
                      </Paragraph1>
                    </td>
                    <td className="py-4 px-6">
                      <button className="text-sm font-medium text-gray-900 hover:text-gray-600 transition">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 px-6 text-center">
                    <Paragraph1 className="text-gray-500">
                      No rental records found
                    </Paragraph1>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
