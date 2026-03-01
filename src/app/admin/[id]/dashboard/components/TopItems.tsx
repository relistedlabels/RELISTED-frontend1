"use client";

import React from "react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { CardGridSkeleton } from "@/common/ui/SkeletonLoaders";
import { useTopItems } from "@/lib/queries/admin/useAnalytics";

interface TopItemsProps {
  limit?: number;
}

export default function TopItems({ limit = 5 }: TopItemsProps) {
  const { data, isPending, error } = useTopItems(limit);

  if (error) {
    console.log("TopItems error:", error);
  }

  // Map API response to expected format
  const items = Array.isArray(data?.data)
    ? data.data.map((item) => ({
        id: item.id,
        name: item.name,
        brand: item.brand ?? null,
        rentalsCount: item.rentalsCount ?? 0,
        dailyPrice: item.dailyPrice ?? 0,
        earnings: (item.rentalsCount ?? 0) * (item.dailyPrice ?? 0),
      }))
    : [];

  if (isPending || error) {
    return <CardGridSkeleton count={limit} />;
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="mb-6">
        <Paragraph3 className="text-xl font-semibold mb-4 text-gray-900">
          Top Items
        </Paragraph3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left">
                <Paragraph1 className="text-gray-600 font-semibold">
                  ITEM
                </Paragraph1>
              </th>
              <th className="px-4 py-3 text-center">
                <Paragraph1 className="text-gray-600 font-semibold">
                  BRAND
                </Paragraph1>
              </th>
              <th className="px-4 py-3 text-center">
                <Paragraph1 className="text-gray-600 font-semibold">
                  RENTALS
                </Paragraph1>
              </th>
              <th className="px-4 py-3 text-center">
                <Paragraph1 className="text-gray-600 font-semibold">
                  EARNINGS
                </Paragraph1>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0"
              >
                <td className="px-4 py-4">
                  <Paragraph1 className="text-gray-900 font-medium">
                    {item.name}
                  </Paragraph1>
                </td>
                <td className="px-4 py-4 text-center">
                  <Paragraph1 className="text-gray-900 font-medium">
                    {item.brand ?? "null"}
                  </Paragraph1>
                </td>
                <td className="px-4 py-4 text-center">
                  <Paragraph1 className="text-gray-700">
                    {item.rentalsCount}
                  </Paragraph1>
                </td>
                <td className="px-4 py-4 text-center">
                  <Paragraph1 className="text-gray-900 font-semibold">
                    ₦{item.earnings.toLocaleString()}
                  </Paragraph1>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
