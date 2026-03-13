"use client";

import React, { useState } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { useRentalHistory } from "@/lib/queries/admin/useRentalHistory";
import { Loader } from "lucide-react";

interface RentalHistoryTabProps {
  listerUserId?: string;
  productId?: string;
}

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

export default function RentalHistoryTab({
  listerUserId,
  productId,
}: RentalHistoryTabProps) {
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch rental history for the lister
  const {
    data: rentalResponse,
    isLoading,
    error,
  } = useRentalHistory(listerUserId || "", page, limit, !!listerUserId);

  const rentals = (rentalResponse?.data?.rentals as any[]) || [];
  const total = rentalResponse?.data?.total || 0;
  const totalPages = Math.ceil(total / limit);
  return (
    <div>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-gray-400" size={32} />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <Paragraph1 className="text-red-600">
            Failed to load rental history
          </Paragraph1>
        </div>
      ) : rentals.length === 0 ? (
        <div className="text-center py-8">
          <Paragraph1 className="text-gray-500">
            No rental history found
          </Paragraph1>
        </div>
      ) : (
        <>
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
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <Paragraph1 className="text-sm text-gray-600">
                Page {page} of {totalPages} • {total} total rentals
              </Paragraph1>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
