"use client";

import { ListItemSkeleton } from "@/common/ui/SkeletonLoaders";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
import { useTopCurators } from "@/lib/queries/admin/useAnalytics";

interface TopCuratorsProps {
  limit?: number;
}

type TopCuratorRow = {
  id: string;
  name: string;
  avatar?: string;
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
    header: "Revenue",
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

export default function TopCurators({ limit = 5 }: TopCuratorsProps) {
  const { data, isPending, error } = useTopCurators(limit);

  const rawList =
    data?.data?.topCurators ??
    (Array.isArray(data?.data) ? data.data : undefined) ??
    [];

  const curators: TopCuratorRow[] = rawList.map((item) => ({
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
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Paragraph3 className="mb-2 text-xl font-semibold text-gray-900">
          Top Listers
        </Paragraph3>
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

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-6">
        <Paragraph3 className="mb-4 text-xl font-semibold text-gray-900">
          Top Listers
        </Paragraph3>
      </div>

      <ResponsiveDataTable
        rows={curators}
        columns={columns}
        getRowKey={(curator) => curator.id}
      />
    </div>
  );
}
