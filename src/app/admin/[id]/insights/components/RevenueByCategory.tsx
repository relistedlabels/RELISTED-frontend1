"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartSkeleton } from "@/common/ui/SkeletonLoaders";
import { useRevenueByCategory } from "@/lib/queries/admin/useAnalytics";

interface RevenueByCategoryProps {
  timeframe: "all_time" | "year" | "month";
  year?: number;
  month?: number;
}

const formatCurrency = (value: number) =>
  `₦${Number(value).toLocaleString("en-NG")}`;

const RevenueByCategory = ({
  timeframe,
  year,
  month,
}: RevenueByCategoryProps) => {
  const { data, isPending, error } = useRevenueByCategory({
    timeframe,
    year,
    month,
  });

  if (isPending) return <ChartSkeleton />;
  if (error || !data?.data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
        Could not load rental revenue by category.
      </div>
    );
  }

  const chartData = [...data.data.revenue]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5">
      <h3 className="font-semibold text-gray-900">
        Rental revenue by category
      </h3>
      <p className="mt-1 text-xs text-gray-500">
        Rental amounts recorded in the selected period; excludes resale revenue
      </p>
      {chartData.length ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 12, right: 18, bottom: 4, left: 12 }}
          >
            <CartesianGrid stroke="#E5E7EB" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={formatCurrency}
              stroke="#6B7280"
              tick={{ fontSize: 11 }}
            />
            <YAxis
              type="category"
              dataKey="category"
              width={104}
              stroke="#6B7280"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(value) => [
                formatCurrency(Number(value ?? 0)),
                "Rental revenue",
              ]}
            />
            <Bar
              dataKey="amount"
              name="Rental revenue"
              fill="#D97706"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="py-16 text-center text-sm text-gray-500">
          No rental revenue was recorded in this period.
        </p>
      )}
    </article>
  );
};

export default RevenueByCategory;
