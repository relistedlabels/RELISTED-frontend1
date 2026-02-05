"use client";

import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { HeaderAny, Paragraph1, Paragraph2, Paragraph3, ParagraphAny } from "@/common/ui/Text";

interface StatCardProps {
  icon: ReactNode;
  value: string;
  label: string;
  change: string;
  positive?: boolean;
  data: { value: number }[];
}

const StatCard = ({
  icon,
  value,
  label,
  change,
  positive = true,
  data,
}: StatCardProps) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 w-full">
      {/* Top */}
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-black text-yellow-400">
          {icon}
        </div>

        <span
          className={`text-[10px] font-semibold ${
            positive ? "text-green-600" : "text-red-600"
          }`}
        >
          <span className="flex items-center gap-1">
            {positive ? (
              <ArrowUpRight className="w-4 h-4 text-green-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            )}
            <ParagraphAny> {change}</ParagraphAny>
          </span>{" "}
        </span>
      </div>

      {/* Value */}
      <div className="mt-3">
        <Paragraph3 className="text-xl font-extrabold text-gray-900">
          {value}
        </Paragraph3>
        <Paragraph1 className="text-xs font-medium text-gray-500 uppercase">
          {label}
        </Paragraph1>
      </div>

      {/* Sparkline */}
      <div className="mt-3 h-12">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Tooltip cursor={false} contentStyle={{ display: "none" }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#facc15"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatCard;
