// ENDPOINTS: GET /api/admin/users/:userId/rentals
"use client";

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface RentalRecord {
  id: string;
  itemName: string;
  itemImage: string;
  status: "Delivered" | "Return Due" | "Completed" | "In Transit";
  returnDue: string;
  amount: string;
}

interface User {
  name: string;
}

interface UserRecordsProps {
  user: User;
}

const RENTAL_HISTORY: RentalRecord[] = [
  {
    id: "1",
    itemName: "Gucci Blazer",
    itemImage:
      "https://images.unsplash.com/photo-1591047990315-385546f5b3b9?w=100&h=100&fit=crop",
    status: "Delivered",
    returnDue: "Nov 12, 2024",
    amount: "₦25,000",
  },
  {
    id: "2",
    itemName: "Hermes Silk Scarf",
    itemImage:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=100&h=100&fit=crop",
    status: "Return Due",
    returnDue: "Nov 8, 2024",
    amount: "₦18,000",
  },
  {
    id: "3",
    itemName: "Prada Handbag",
    itemImage:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=100&h=100&fit=crop",
    status: "Completed",
    returnDue: "Oct 28, 2024",
    amount: "₦35,000",
  },
  {
    id: "4",
    itemName: "Chanel Sunglasses",
    itemImage:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100&h=100&fit=crop",
    status: "In Transit",
    returnDue: "Nov 15, 2024",
    amount: "₦12,000",
  },
];

const getStatusColor = (
  status: "Delivered" | "Return Due" | "Completed" | "In Transit",
) => {
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

export default function UserRecords({ user }: UserRecordsProps) {
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
              {RENTAL_HISTORY.map((record) => (
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
                      {record.returnDue}
                    </Paragraph1>
                  </td>
                  <td className="py-4 px-6">
                    <Paragraph1 className="text-sm font-semibold text-gray-900">
                      {record.amount}
                    </Paragraph1>
                  </td>
                  <td className="py-4 px-6">
                    <button className="text-sm font-medium text-gray-900 hover:text-gray-600 transition">
                      View Details
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
