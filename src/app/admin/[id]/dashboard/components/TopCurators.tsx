"use client";

import React from "react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { ListItemSkeleton } from "@/common/ui/SkeletonLoaders";
import { useTopCurators } from "@/lib/queries/admin/useAnalytics";

interface TopCuratorsProps {
  limit?: number;
}

export default function TopCurators({ limit = 5 }: TopCuratorsProps) {
  const { data, isPending, error } = useTopCurators(limit);

  if (error) {
    console.log("TopCurators error:", error);
  }

  const curators = data?.data?.topCurators || [];

  if (isPending || error) {
    return <ListItemSkeleton count={limit} />;
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="mb-6">
        <Paragraph3 className="text-gray-900">Top Listers</Paragraph3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left">
                <Paragraph1 className="text-gray-600 font-semibold">
                  CURATOR
                </Paragraph1>
              </th>
              <th className="px-4 py-3 text-left">
                <Paragraph1 className="text-gray-600 font-semibold">
                  RENTALS
                </Paragraph1>
              </th>
              <th className="px-4 py-3 text-left">
                <Paragraph1 className="text-gray-600 font-semibold">
                  REVENUE
                </Paragraph1>
              </th>
            </tr>
          </thead>
          <tbody>
            {curators.map((curator) => (
              <tr
                key={curator.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-b-0"
              >
                <td className="px-4 py-4">
                  <Paragraph1 className="text-gray-900 font-medium">
                    {curator.name}
                  </Paragraph1>
                </td>
                <td className="px-4 py-4">
                  <Paragraph1 className="text-gray-700">
                    {curator.rentals.toLocaleString()}
                  </Paragraph1>
                </td>
                <td className="px-4 py-4">
                  <Paragraph1 className="text-gray-900 font-semibold">
                    ₦{curator.revenue.toLocaleString()}
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
