// CategoryBreakdown.tsx
import { Paragraph3 } from "@/common/ui/Text";
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

const data = [
  { name: "Dresses", value: 1300 },
  { name: "Bags", value: 700 },
  { name: "Shoes", value: 550 },
  { name: "Jewelry", value: 280 },
  { name: "Accessories", value: 100 },
];

const CategoryBreakdown = () => {
  return (
    <div className="bg-white p-6 rounded-xl h-full border border-gray-200">
      <Paragraph3 className="text-xl font-semibold mb-4 text-gray-900">
        Category Breakdown
      </Paragraph3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#6B7280"
            tickLine={false}
            angle={-20}
            textAnchor="end"
            interval={0}
            height={60}
          />
          <YAxis
            stroke="#6B7280"
            tickLine={false}
            axisLine={false}
            domain={[0, 1400]}
            ticks={[0, 350, 700, 1050, 1400]}
          />
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
