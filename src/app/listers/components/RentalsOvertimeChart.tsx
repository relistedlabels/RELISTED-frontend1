"use client";

import React, { useMemo, useState } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { ToolInfo } from "@/common/ui/ToolInfo";
import { useRentalsOvertime } from "@/lib/queries/listers/useRentalsOvertime";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TimeframeType = "month" | "quarter" | "year";

const compactNaira = (value: number) => {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `₦${Number.isInteger(m) ? m : m.toFixed(1)}M`;
  }
  if (value >= 1_000) {
    const k = value / 1_000;
    return `₦${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  }
  return `₦${Math.round(value)}`;
};

const fullNaira = (value: number) => `₦${value.toLocaleString()}`;

type TooltipEntry = {
  dataKey?: string | number;
  name?: string;
  value?: number;
  color?: string;
  fill?: string;
};

const ChartTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-md">
      <Paragraph1 className="mb-1 text-xs font-semibold text-gray-800">
        {label}
      </Paragraph1>
      {payload.map((entry) => (
        <div
          key={String(entry.dataKey)}
          className="flex items-center justify-between gap-4 text-xs"
        >
          <span className="flex items-center gap-1.5 text-gray-600">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: entry.color ?? entry.fill }}
            />
            {entry.name}
          </span>
          <span className="font-medium text-gray-900">
            {entry.dataKey === "revenue"
              ? fullNaira(Number(entry.value ?? 0))
              : Number(entry.value ?? 0)}
          </span>
        </div>
      ))}
    </div>
  );
};

const RentalsOvertimeChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<TimeframeType>("year");
  const { data: chartData, isLoading, isError } = useRentalsOvertime(timeframe);

  const rows = useMemo(() => {
    const source = chartData?.data?.rentalsOvertime ?? [];
    return source.map((d) => ({
      label: String(d.month ?? "").slice(0, 3) || "—",
      revenue: Number(d.revenue ?? 0),
      orders: Number(d.orders ?? 0),
    }));
  }, [chartData]);

  const averages = useMemo(() => {
    if (!rows.length) return { revenue: 0, orders: 0 };
    return {
      revenue:
        rows.reduce((sum, row) => sum + row.revenue, 0) / rows.length,
      orders: rows.reduce((sum, row) => sum + row.orders, 0) / rows.length,
    };
  }, [rows]);

  const hasData = rows.length > 0;

  return (
    <div className="bg-white sm:col-span-3 p-6 rounded-xl border border-gray-300 w-full">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Paragraph3 className="text-xl font-semibold text-black">
            Earnings Overtime
          </Paragraph3>
          <ToolInfo content="Rental and sales revenue with order volume over time, so you can spot growth and seasonality." />

          <div className="ml-4 flex gap-2">
            {(["month", "quarter", "year"] as TimeframeType[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded text-sm font-medium transition ${
                  timeframe === tf
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          {hasData ? (
            <span className="text-gray-500">
              Avg. revenue{" "}
              <span className="font-semibold text-gray-900">
                {compactNaira(Math.round(averages.revenue))}
              </span>
              <span className="mx-1.5 text-gray-300">·</span>
              Avg. orders{" "}
              <span className="font-semibold text-gray-900">
                {Math.round(averages.orders)}
              </span>
            </span>
          ) : null}

          <span className="flex items-center gap-1.5 text-blue-600">
            <span className="h-2 w-2 rounded-full bg-blue-600" />
            Revenue
          </span>
          <span className="flex items-center gap-1.5 text-purple-600">
            <span className="h-2 w-2 rounded-full bg-purple-600" />
            Orders
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        {isLoading ? (
          <div className="h-full w-full animate-pulse rounded-lg bg-gray-100" />
        ) : !hasData || isError ? (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-400">
            No data available for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={rows}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="revenue"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                width={56}
                tickFormatter={(value) => compactNaira(Number(value))}
              />
              <YAxis
                yAxisId="orders"
                orientation="right"
                allowDecimals={false}
                tick={{ fontSize: 12, fill: "#a855f7" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Bar
                yAxisId="revenue"
                dataKey="revenue"
                name="Revenue"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                maxBarSize={28}
              />
              <Line
                yAxisId="orders"
                dataKey="orders"
                name="Orders"
                stroke="#9333ea"
                strokeWidth={2}
                dot={{ r: 3, fill: "#9333ea" }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RentalsOvertimeChart;
