"use client";

import {
  type ResponsiveColumnDef,
  ResponsiveDataTable,
} from "@/common/ui/ResponsiveDataTable";
import { CardGridSkeleton } from "@/common/ui/SkeletonLoaders";
import { Paragraph1, Paragraph2, Paragraph3 } from "@/common/ui/Text";
import { useTopItems } from "@/lib/queries/admin/useAnalytics";

interface TopItemsProps {
  timeframe: "all_time" | "year" | "month";
  year?: number;
  month?: number;
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
        {item.brand ?? "—"}
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
    header: "Rental value",
    mobile: "detail",
    render: (item) => (
      <Paragraph1 className="font-semibold text-gray-900">
        ₦{item.earnings.toLocaleString()}
      </Paragraph1>
    ),
  },
];

export default function TopItems({
  timeframe,
  year,
  month,
  limit = 5,
}: TopItemsProps) {
  const { data, isPending, error } = useTopItems(
    { timeframe, year, month },
    limit,
  );

  const rawList = data?.data ?? [];

  const items: TopItemRow[] = rawList.map((item) => ({
    id: item.id,
    name: item.name,
    brand: item.brand ?? null,
    rentalsCount: item.rentalsCount ?? 0,
    earnings: item.earnings ?? 0,
  }));

  if (isPending) {
    return <CardGridSkeleton count={limit} />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Paragraph3 className="mb-2 text-xl font-semibold text-gray-900">
          Most rented items
        </Paragraph3>
        <Paragraph2 className="text-xs text-gray-500">
          Rental count and rental value in the selected period.
        </Paragraph2>
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

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <Paragraph3 className="mb-2 text-xl font-semibold text-gray-900">
          Most rented items
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
          Most rented items
        </Paragraph3>
        <Paragraph2 className="text-xs text-gray-500">
          Rental count and rental value in the selected period.
        </Paragraph2>
      </div>

      <ResponsiveDataTable
        rows={items}
        columns={columns}
        getRowKey={(item) => item.id}
      />
    </div>
  );
}
