"use client";

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface Rental {
  id: string;
  dresserName: string;
  dresserImage: string;
  duration: string;
  dateRange: string;
  status: "Completed" | "Pending Return" | "In Transit";
  total: string;
}

interface RentalHistoryTabProps {
  rentals?: Rental[];
}

const DEFAULT_RENTALS: Rental[] = [
  {
    id: "1",
    dresserName: "Grace Abeyayo",
    dresserImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&radius=50",
    duration: "3 Days",
    dateRange: "Oct 18 - 21",
    status: "Completed",
    total: "₦75,000",
  },
  {
    id: "2",
    dresserName: "Chioma Eze",
    dresserImage:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&radius=50",
    duration: "6 Days",
    dateRange: "Oct 24 - 31",
    status: "Completed",
    total: "₦150,000",
  },
  {
    id: "3",
    dresserName: "Aniia Cole",
    dresserImage:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&radius=50",
    duration: "9 Days",
    dateRange: "Oct 22 - 31",
    status: "Pending Return",
    total: "₦625,000",
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-50 text-green-700";
    case "Pending Return":
      return "bg-yellow-50 text-yellow-700";
    case "In Transit":
      return "bg-blue-50 text-blue-700";
    default:
      return "bg-gray-50 text-gray-700";
  }
};

export default function RentalHistoryTab({
  rentals = DEFAULT_RENTALS,
}: RentalHistoryTabProps) {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left">
                <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Dresser
                </Paragraph1>
              </th>
              <th className="px-4 py-3 text-left">
                <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Duration
                </Paragraph1>
              </th>
              <th className="px-4 py-3 text-left">
                <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Status
                </Paragraph1>
              </th>
              <th className="px-4 py-3 text-left">
                <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Total
                </Paragraph1>
              </th>
              <th className="px-4 py-3 text-left">
                <Paragraph1 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Order
                </Paragraph1>
              </th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => (
              <tr
                key={rental.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={rental.dresserImage}
                      alt={rental.dresserName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <Paragraph1 className="text-sm font-medium text-gray-900">
                      {rental.dresserName}
                    </Paragraph1>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <Paragraph1 className="text-sm font-medium text-gray-900">
                      {rental.duration}
                    </Paragraph1>
                    <Paragraph1 className="text-xs text-gray-500">
                      {rental.dateRange}
                    </Paragraph1>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      rental.status,
                    )}`}
                  >
                    {rental.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <Paragraph1 className="text-sm font-medium text-gray-900">
                    {rental.total}
                  </Paragraph1>
                </td>
                <td className="px-4 py-4">
                  <button className="text-blue-600 hover:text-blue-800 transition font-medium text-sm">
                    View Order
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
