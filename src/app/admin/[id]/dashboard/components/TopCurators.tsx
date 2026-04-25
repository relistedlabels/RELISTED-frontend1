"use client";

import { ListItemSkeleton } from "@/common/ui/SkeletonLoaders";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { useTopCurators } from "@/lib/queries/admin/useAnalytics";

interface TopCuratorsProps {
  limit?: number;
}

export default function TopCurators({ limit = 5 }: TopCuratorsProps) {
  const { data, isPending, error } = useTopCurators(limit);

  const rawList =
    data?.data?.topCurators ??
    (Array.isArray(data?.data) ? data.data : undefined) ??
    [];

  const curators = rawList.map((item) => ({
    id: item.id,
    name: item.name,
    avatar: item.avatar,
    totalRentals: item.totalRentals ?? item.rentals ?? 0,
    totalProducts: item.totalProducts ?? 0,
    revenue: item.revenue ?? 0,
  }));

  if (isPending) {
    return <ListItemSkeleton count={limit} />;
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <Paragraph3 className="text-xl font-semibold mb-2 text-gray-900">
          Top Listers
        </Paragraph3>
        <Paragraph2 className="text-gray-600 text-sm">
          Unable to load this chart. The server returned an error (check the API
          logs for{" "}
          <span className="font-mono text-xs">
            GET /api/admin/analytics/top-curators
          </span>
          ).
        </Paragraph2>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="mb-6">
        <Paragraph3 className="text-xl font-semibold mb-4 text-gray-900">
          Top Listers
        </Paragraph3>
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
              <th className="px-4 py-3 text-center">
                <Paragraph1 className="text-gray-600 font-semibold">
                  RENTALS
                </Paragraph1>
              </th>
              <th className="px-4 py-3 text-center">
                <Paragraph1 className="text-gray-600 font-semibold">
                  REVENUE
                </Paragraph1>
              </th>
              <th className="px-4 py-3 text-center">
                <Paragraph1 className="text-gray-600 font-semibold">
                  PRODUCTS
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
                <td className="px-4 py-4 t">
                  <Paragraph1 className="text-gray-900 font-medium">
                    {curator.name}
                  </Paragraph1>
                </td>
                <td className="px-4 py-4 text-center">
                  <Paragraph1 className="text-gray-700">
                    {curator.totalRentals.toLocaleString()}
                  </Paragraph1>
                </td>
                <td className="px-4 py-4 text-center">
                  <Paragraph1 className="text-gray-900 font-semibold">
                    ₦{(curator.revenue ?? 0).toLocaleString()}
                  </Paragraph1>
                </td>
                <td className="px-4 py-4 text-center">
                  <Paragraph1 className="text-gray-900 font-semibold">
                    {curator.totalProducts ?? 0}
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
