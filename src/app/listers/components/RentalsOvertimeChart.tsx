"use client";
// ENDPOINTS: GET /api/listers/rentals/overtime?timeframe=year (revenue & orders over time)

import React from "react";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";
import { ToolInfo } from "@/common/ui/ToolInfo";

const RentalsOvertimeChart: React.FC = () => {
  const legendData = [
    { label: "Revenue", color: "text-blue-600", dotClass: "bg-blue-600" },
    { label: "Orders", color: "text-purple-600", dotClass: "bg-purple-600" },
  ];

  const averageData = [
    { label: "Aug 2025", value: "₦5.8k", dotClass: "bg-blue-600" },
    { label: "Aug 2024", value: "₦8.5k", dotClass: "bg-purple-600" },
  ];

  const yAxisLabels = ["₦ 5M", "₦ 1M", "₦ 500k", "₦ 50k", "₦ 0"];

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

  return (
    <div className="bg-white sm:col-span-3 p-6 rounded-xl border border-gray-300 w-full">
      {/* Header and Legend */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-1">
          <Paragraph3 className="text-xl font-semibold text-black">
            Rentals Overtime
          </Paragraph3>
          <ToolInfo content="Tracks rental revenue and order volume over time to identify growth trends and seasonality." />
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
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            [Placeholder for Chart Library Rendering Area]
          </div>

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
