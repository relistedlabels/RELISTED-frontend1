"use client";

import { useEffect } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartSkeleton } from "@/common/ui/SkeletonLoaders";
import { useRentalsRevenueTrend } from "@/lib/queries/admin/useAnalytics";

interface RentalsRevenueTrendProps {
  timeframe: "all_time" | "year" | "month";
  year?: number;
  month?: number;
}

const formatCurrency = (value: number) =>
  `₦${Number(value).toLocaleString("en-NG")}`;

const RentalsRevenueTrend = ({
  timeframe,
  year,
  month,
}: RentalsRevenueTrendProps) => {
  const { data, isLoading, error } = useRentalsRevenueTrend({
    timeframe,
    year,
    month,
  });

  useEffect(() => {
    if (error) console.error("Failed to load order and revenue trends:", error);
  }, [error]);

  const chartData = data?.data?.trend ?? [];

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (error || !data?.data) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
        Could not load marketplace performance for this period.
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-600">
        No orders were recorded in this period.
      </div>
    );
  }

  const chartFrame = "rounded-xl border border-gray-200 bg-white p-4 sm:p-5";

  return (
    <section className="space-y-3">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className={chartFrame}>
          <h3 className="font-semibold text-gray-900">Orders over time</h3>
          <p className="mt-1 text-xs text-gray-500">
            Non-cancelled, non-rejected orders created in the selected period
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 12, bottom: 4, left: -16 }}
            >
              <CartesianGrid stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#6B7280"
                tickLine={false}
                axisLine={false}
                minTickGap={24}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                allowDecimals={false}
                stroke="#6B7280"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#111827"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </article>

        <article className={chartFrame}>
          <h3 className="font-semibold text-gray-900">Gross order value</h3>
          <p className="mt-1 text-xs text-gray-500">
            Sum of order amounts paid; not net platform earnings
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={chartData}
              margin={{ top: 12, right: 12, bottom: 4, left: 4 }}
            >
              <CartesianGrid stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#6B7280"
                tickLine={false}
                axisLine={false}
                minTickGap={24}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickFormatter={(value: number) => formatCurrency(value)}
                stroke="#6B7280"
                tickLine={false}
                axisLine={false}
                width={78}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value) => [
                  formatCurrency(Number(value ?? 0)),
                  "Gross order value",
                ]}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Gross order value"
                stroke="#D97706"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </article>
      </div>
    </section>
  );
};

export default RentalsRevenueTrend;
