// RevenueByCategory.tsx
import { Paragraph3 } from "@/common/ui/Text";
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Dresses", value: 42, color: "#D97706" },
  { name: "Bags", value: 28, color: "#000000" },
  { name: "Shoes", value: 18, color: "#4B5563" },
  { name: "Jewelry", value: 4, color: "#D1D5DB" },
  { name: "Accessories", value: 8, color: "#9CA3AF" },
];

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
  color,
}: any) => {
  const radius = outerRadius * 1.1;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill={color}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={14}
    >
      {`${name} ${data[index].value}%`}
    </text>
  );
};

const RevenueByCategory = () => {
  return (
    <div className="bg-white p-6 rounded-xl h-full border border-gray-200">
      <Paragraph3 className="text-xl font-semibold mb-4 text-gray-900">
        Revenue by Category
      </Paragraph3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueByCategory;
