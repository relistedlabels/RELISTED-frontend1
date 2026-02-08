// ENDPOINTS: GET /api/admin/analytics/top-curators
"use client";

import React from "react";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";

interface CuratorData {
  id: string;
  name: string;
  rentals: number;
  revenue: number;
  avatar?: string;
}

const mockTopCurators: CuratorData[] = [
  {
    id: "curator_001",
    name: "Anita Cole",
    rentals: 132,
    revenue: 820000,
  },
  {
    id: "curator_002",
    name: "Blessing Okafor",
    rentals: 118,
    revenue: 745000,
  },
  {
    id: "curator_003",
    name: "Chioma Eze",
    rentals: 97,
    revenue: 680000,
  },
  {
    id: "curator_004",
    name: "Fatima Bello",
    rentals: 89,
    revenue: 590000,
  },
  {
    id: "curator_005",
    name: "Grace Adebayo",
    rentals: 76,
    revenue: 520000,
  },
];

export default function TopCurators() {
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
            {mockTopCurators.map((curator, index) => (
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
                    {curator.rentals}
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
