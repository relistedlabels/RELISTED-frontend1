"use client";

import { CardGridSkeleton } from "@/common/ui/SkeletonLoaders";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
import { useTopItems } from "@/lib/queries/admin/useAnalytics";

interface TopItemsProps {
  limit?: number;
}

type TopItemRow = {
  id: string;
  name: string;
  brand: string | null;
  rentalsCount: number;
  earnings: number;
};

const columns: ResponsiveColumnDef<TopItemRow>[] = [
  {
    id: "item",
    header: "Item",
    mobile: "primary",
    render: (item) => (
      <Paragraph1 className="font-medium text-gray-900">{item.name}</Paragraph1>
    ),
  },
  {
    id: "brand",
    header: "Brand",
    mobile: "detail",
    render: (item) => (
      <Paragraph1 className="font-medium text-gray-900">
        {item.brand ?? "null"}
      </Paragraph1>
    ),
  },
  {
    id: "rentals",
    header: "Rentals",
    mobile: "detail",
    render: (item) => (
      <Paragraph1 className="text-gray-700">{item.rentalsCount}</Paragraph1>
    ),
  },
  {
    id: "earnings",
    header: "Earnings",
    mobile: "detail",
    render: (item) => (
      <Paragraph1 className="font-semibold text-gray-900">
        ₦{item.earnings.toLocaleString()}
      </Paragraph1>
    ),
  },
];

export default function TopItems({ limit = 5 }: TopItemsProps) {
  const { data, isPending, error } = useTopItems(limit);

  const rawList =
    data?.data?.topItems ??
    (Array.isArray(data?.data) ? data.data : undefined) ??
    [];

  const items: TopItemRow[] = rawList.map((item) => ({
    id: item.id,
    name: item.name,
    brand: item.brand ?? null,
    rentalsCount: item.rentalsCount ?? 0,
    earnings: (item.rentalsCount ?? 0) * (item.dailyPrice ?? 0),
  }));

  if (isPending) {
    return <CardGridSkeleton count={limit} />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Paragraph3 className="mb-2 text-xl font-semibold text-gray-900">
          Top Items
        </Paragraph3>
        <Paragraph2 className="text-sm text-gray-600">
          Unable to load this chart. Check the API logs for{" "}
          <span className="font-mono text-xs">
            GET /api/admin/analytics/top-items
          </span>
          .
        </Paragraph2>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-6">
        <Paragraph3 className="mb-4 text-xl font-semibold text-gray-900">
          Top Items
        </Paragraph3>
      </div>

      <ResponsiveDataTable
        rows={items}
        columns={columns}
        getRowKey={(item) => item.id}
      />
    </div>
  );
}
