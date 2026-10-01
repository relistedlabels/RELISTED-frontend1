"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartSkeleton } from "@/common/ui/SkeletonLoaders";
import { useCategoryBreakdown } from "@/lib/queries/admin/useAnalytics";

interface CategoryBreakdownProps {
  timeframe: "all_time" | "year" | "month";
  year?: number;
  month?: number;
}

const CategoryBreakdown = ({
  timeframe,
  year,
  month,
}: CategoryBreakdownProps) => {
  const { data, isPending, error } = useCategoryBreakdown({
    timeframe,
    year,
    month,
  });

  if (isPending) return <ChartSkeleton />;
  if (error || !data?.data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
        Could not load category supply and demand.
      </div>
    );
  }

  const chartData = [...data.data]
    .sort(
      (a, b) =>
        b.availabilityRequests - a.availabilityRequests ||
        b.activeListings - a.activeListings,
    )
    .slice(0, 8);

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="font-semibold text-gray-900">
        Supply & demand by category
      </h3>
      <p className="mt-1 text-xs text-gray-500">
        Live verified listings now vs availability requests in the selected
        period
      </p>
      {chartData.length ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 12, right: 16, bottom: 28, left: 12 }}
          >
            <CartesianGrid stroke="#E5E7EB" horizontal={false} />
            <XAxis type="number" allowDecimals={false} stroke="#6B7280" />
            <YAxis
              type="category"
              dataKey="category"
              width={104}
              stroke="#6B7280"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
            />
            <Tooltip />
            <Legend
              verticalAlign="bottom"
              align="left"
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
            />
            <Bar
              dataKey="activeListings"
              name="Live listings (now)"
              fill="#111827"
              radius={[0, 4, 4, 0]}
            />
            <Bar
              dataKey="availabilityRequests"
              name="Availability requests (period)"
              fill="#D97706"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="py-16 text-center text-sm text-gray-500">
          No product categories are available yet.
        </p>
      )}
    </article>
  );
};

export default CategoryBreakdown;
