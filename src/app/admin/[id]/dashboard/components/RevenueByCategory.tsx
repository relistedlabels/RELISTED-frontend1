"use client";

import { Paragraph3 } from "@/common/ui/Text";
import { ChartSkeleton } from "@/common/ui/SkeletonLoaders";
import { useRevenueByCategory } from "@/lib/queries/admin/useAnalytics";
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface RevenueByCategory {
  timeframe: "all_time" | "year" | "month";
  year?: number;
  month?: number;
}

const COLORS = ["#D97706", "#000000", "#4B5563", "#D1D5DB", "#9CA3AF"];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
  name,
}: any) => {
  const radius = outerRadius * 1.1;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill={COLORS[index % COLORS.length]}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={14}
    >
      {`${name} ${percent > 0 ? Math.round(percent * 100) : 0}%`}
    </text>
  );
};

const RevenueByCategory = ({ timeframe, year, month }: RevenueByCategory) => {
  const { data, isPending, error } = useRevenueByCategory({
    timeframe,
    year,
    month,
  });

  if (error) {
    console.log("RevenueByCategory error:", error);
  }

  const chartData =
    data?.data?.revenue?.map((item) => ({
      name: item.category,
      value: item.percentage,
      amount: item.amount,
    })) || [];

  if (isPending || error) {
    return <ChartSkeleton />;
  }

  return (
    <div className="bg-white p-6 rounded-xl h-full border border-gray-200">
      <Paragraph3 className="text-xl font-semibold mb-4 text-gray-900">
        Revenue by Category
      </Paragraph3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: any, name, props) => {
              if (name === "value") {
                return `${Math.round((value as number) * 100)}%`;
              }
              return value;
            }}
            labelFormatter={(label) => label}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueByCategory;
