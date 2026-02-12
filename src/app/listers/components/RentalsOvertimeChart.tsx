"use client";
// ENDPOINTS: GET /api/listers/rentals/overtime?timeframe=year (revenue & orders over time)

import React, { useState, useMemo } from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { ToolInfo } from "@/common/ui/ToolInfo";
import { useRentalsOvertime } from "@/lib/queries/listers/useRentalsOvertime";

type TimeframeType = "month" | "quarter" | "year";

const RentalsOvertimeChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<TimeframeType>("year");
  const { data: chartData, isLoading, isError } = useRentalsOvertime(timeframe);

  const legendData = [
    { label: "Revenue", color: "text-blue-600", dotClass: "bg-blue-600" },
    { label: "Orders", color: "text-purple-600", dotClass: "bg-purple-600" },
  ];

  const xAxisLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const yAxisLabels = ["₦ 5M", "₦ 1M", "₦ 500k", "₦ 50k", "₦ 0"];

  const averageData = useMemo(() => {
    if (!chartData?.data || chartData.data.length === 0) {
      return [
        { label: "Avg Revenue", value: "₦0", dotClass: "bg-blue-600" },
        { label: "Avg Orders", value: "0", dotClass: "bg-purple-600" },
      ];
    }
    const avgRevenue =
      chartData.data.reduce((sum, d) => sum + d.revenue, 0) /
      chartData.data.length;
    const avgOrders =
      chartData.data.reduce((sum, d) => sum + d.orders, 0) /
      chartData.data.length;

    return [
      {
        label: `Avg Revenue`,
        value: `₦${(avgRevenue / 1000).toFixed(1)}k`,
        dotClass: "bg-blue-600",
      },
      {
        label: `Avg Orders`,
        value: Math.round(avgOrders).toString(),
        dotClass: "bg-purple-600",
      },
    ];
  }, [chartData]);

  return (
    <div className="bg-white sm:col-span-3 p-6 rounded-xl border border-gray-300 w-full">
      {/* Header and Legend */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Paragraph3 className="text-xl font-semibold text-black">
            Rentals Overtime
          </Paragraph3>
          <ToolInfo content="Tracks rental revenue and order volume over time to identify growth trends and seasonality." />

          {/* Timeframe Selector */}
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

        <div className="flex space-x-4">
          {legendData.map((item) => (
            <div key={item.label} className="flex items-center space-x-1">
              <span className={`w-2 h-2 rounded-full ${item.dotClass}`} />
              <Paragraph1 className={`text-sm ${item.color}`}>
                {item.label}
              </Paragraph1>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative h-64 flex">
        <div className="flex flex-col justify-between pr-4 text-right text-gray-500 text-sm h-full">
          {yAxisLabels.map((label, index) => (
            <Paragraph1 key={index}>{label}</Paragraph1>
          ))}
        </div>

        <div className="flex-1 relative border-l border-gray-200 ml-2">
          {isLoading || isError ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-32 bg-gray-200 rounded w-full animate-pulse" />
            </div>
          ) : chartData?.data && chartData.data.length > 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              [Chart visualization - Backend data loaded]
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              No data available for selected period
            </div>
          )}

          <div
            className="absolute p-3 bg-white border border-gray-300 rounded-lg"
            style={{ top: "35%", left: "30%" }}
          >
            <Paragraph1 className="text-sm font-semibold text-gray-800 mb-1">
              Average
            </Paragraph1>

            {averageData.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center space-x-3 text-xs"
              >
                <div className="flex items-center space-x-1">
                  <span className={`w-2 h-2 rounded-full ${item.dotClass}`} />
                  <Paragraph1 className="text-gray-600">
                    {item.label}
                  </Paragraph1>
                </div>
                <Paragraph1 className="font-medium text-gray-800">
                  {item.value}
                </Paragraph1>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200">
        {xAxisLabels.map((label, index) => (
          <Paragraph1
            key={index}
            className="text-sm text-gray-500 w-full text-center"
          >
            {label}
          </Paragraph1>
        ))}
      </div>
    </div>
  );
};

export default RentalsOvertimeChart;
