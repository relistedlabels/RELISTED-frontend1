"use client";

import {
  type ResponsiveColumnDef,
  ResponsiveDataTable,
} from "@/common/ui/ResponsiveDataTable";
import { ListItemSkeleton } from "@/common/ui/SkeletonLoaders";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { useTopCurators } from "@/lib/queries/admin/useAnalytics";

interface TopCuratorsProps {
  timeframe: "all_time" | "year" | "month";
  year?: number;
  month?: number;
  limit?: number;
}

type TopCuratorRow = {
  id: string;
  name: string;
  avatar?: string | null;
  totalRentals: number;
  totalProducts: number;
  revenue: number;
};

const columns: ResponsiveColumnDef<TopCuratorRow>[] = [
  {
    id: "curator",
    header: "Curator",
    mobile: "primary",
    render: (curator) => (
      <Paragraph1 className="font-medium text-gray-900">
        {curator.name}
      </Paragraph1>
    ),
  },
  {
    id: "rentals",
    header: "Rentals",
    mobile: "detail",
    render: (curator) => (
      <Paragraph1 className="text-gray-700">
        {curator.totalRentals.toLocaleString()}
      </Paragraph1>
    ),
  },
  {
    id: "revenue",
    header: "Rental value",
    mobile: "detail",
    render: (curator) => (
      <Paragraph1 className="font-semibold text-gray-900">
        ₦{(curator.revenue ?? 0).toLocaleString()}
      </Paragraph1>
    ),
  },
  {
    id: "products",
    header: "Products",
    mobile: "detail",
    render: (curator) => (
      <Paragraph1 className="font-semibold text-gray-900">
        {curator.totalProducts ?? 0}
      </Paragraph1>
    ),
  },
];

export default function TopCurators({
  timeframe,
  year,
  month,
  limit = 5,
}: TopCuratorsProps) {
  const { data, isPending, error } = useTopCurators(
    { timeframe, year, month },
    limit,
  );

  const rawList = data?.data ?? [];

  const curators: TopCuratorRow[] = rawList.map((item) => ({
    id: item.id,
    name: item.name,
    avatar: item.avatar,
    totalRentals: item.totalRentals ?? 0,
    totalProducts: item.totalProducts ?? 0,
    revenue: item.revenue ?? 0,
  }));

  if (isPending) {
    return <ListItemSkeleton count={limit} />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Paragraph3 className="mb-2 text-xl font-semibold text-gray-900">
          Top listers by rentals
        </Paragraph3>
        <Paragraph2 className="text-xs text-gray-500">
          Ranked by rentals and rental value in the selected period. Product
          count is current.
        </Paragraph2>
        <Paragraph2 className="text-sm text-gray-600">
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

  if (curators.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Paragraph3 className="mb-2 text-xl font-semibold text-gray-900">
          Top listers by rentals
        </Paragraph3>
        <Paragraph2 className="text-sm text-gray-600">
          No rentals were recorded in this period.
        </Paragraph2>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-6">
        <Paragraph3 className="mb-4 text-xl font-semibold text-gray-900">
          Top listers by rentals
        </Paragraph3>
        <Paragraph2 className="text-xs text-gray-500">
          Ranked by rentals and rental value in the selected period. Product
          count is current.
        </Paragraph2>
      </div>

      <ResponsiveDataTable
        rows={curators}
        columns={columns}
        getRowKey={(curator) => curator.id}
      />
    </div>
  );
}
