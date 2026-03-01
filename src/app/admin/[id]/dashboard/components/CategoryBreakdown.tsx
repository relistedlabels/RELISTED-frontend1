"use client";

import { Paragraph3 } from "@/common/ui/Text";
import { ChartSkeleton } from "@/common/ui/SkeletonLoaders";
import { useCategoryBreakdown } from "@/lib/queries/admin/useAnalytics";
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

  if (error || !data?.data) {
    return (
      <div className="bg-white border border-gray-200 p-6 rounded-xl h-full">
        <ChartSkeleton />
      </div>
    );
  }

  // Map API response to expected format and show only top 10 by value
  const chartData = Array.isArray(data.data)
    ? data.data
        .map((item) => ({
          category: item.category,
          value: item.value,
          percentage: item.percentage,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
    : (data.data.breakdown || [])
        .map((item: any) => ({
          category: item.category,
          value: item.value,
          percentage: item.percentage,
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

  if (isPending || error) {
    return <ChartSkeleton />;
  }

  return (
    <div className="bg-white p-6 rounded-xl h-full border border-gray-200">
      <Paragraph3 className="text-xl font-semibold mb-4 text-gray-900">
        Category Breakdown
      </Paragraph3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="category"
            stroke="#6B7280"
            tickLine={false}
            angle={-20}
            textAnchor="end"
            interval={0}
            height={60}
          />
          <YAxis stroke="#6B7280" tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: "transparent" }} />
          <Bar
            dataKey="value"
            fill="#000000"
            radius={[4, 4, 0, 0]}
            barSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryBreakdown;
