// RentalsRevenueTrend.tsx
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import React from "react";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Dec", rentals: 500, revenue: 3.5 },
  { name: "Jan", rentals: 700, revenue: 4.5 },
  { name: "Feb", rentals: 730, revenue: 5.5 },
  { name: "Mar", rentals: 600, revenue: 3.8 },
  { name: "Apr", rentals: 820, revenue: 6 },
  { name: "May", rentals: 910, revenue: 6.5 },
];

const RentalsRevenueTrend = () => {
  return (
    <div className="bg-[#111827] p-6 rounded-xl h-full text-white">
      <Paragraph3 className="text-xl font-semibold mb-4">
        Rentals & Revenue Trend
      </Paragraph3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid stroke="#374151" vertical={false} />
          <XAxis dataKey="name" stroke="#9CA3AF" tickLine={false} />
          <YAxis
            yAxisId="left"
            stroke="#9CA3AF"
            tickLine={false}
            axisLine={false}
            domain={[0, 1000]}
            ticks={[0, 250, 500, 750, 1000]}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#D97706"
            tickLine={false}
            axisLine={false}
            domain={[0, 8]}
            ticks={[0, 2, 4, 6, 8]}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1F2937", border: "none" }}
            itemStyle={{ color: "#fff" }}
          />
          <Legend wrapperStyle={{ bottom: 0 }} />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="rentals"
            fill="#374151"
            stroke="#fff"
            strokeWidth={2}
            dot={{ r: 4, fill: "#fff", strokeWidth: 2 }}
            name="Rentals"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="revenue"
            stroke="#D97706"
            strokeWidth={2}
            dot={{ r: 4, fill: "#D97706", strokeWidth: 2 }}
            name="Revenue (k)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RentalsRevenueTrend;
