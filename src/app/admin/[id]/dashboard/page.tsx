// ENDPOINTS: GET /api/admin/analytics/stats, GET /api/admin/analytics/rentals-revenue-trend, GET /api/admin/analytics/category-breakdown, GET /api/admin/analytics/revenue-by-category, GET /api/admin/analytics/top-curators, GET /api/admin/analytics/top-items
"use client";
import React, { useState } from "react";
import AnalyticsHeader from "./components/AnalyticsHeader";
import AnalyticsStats from "./components/AnalyticsStats";
import AnalyticsDashboard from "./components/AnalyticsDashboard";

type TimeframeType = "all_time" | "year" | "month";

function page() {
  const [timeframeType, setTimeframeType] = useState<TimeframeType>("all_time");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Convert UI timeframe to API format
  const getApiTimeframe = () => {
    if (timeframeType === "all_time") {
      return { timeframe: "all_time" as const };
    }
    if (timeframeType === "year") {
      return { timeframe: "year" as const, year: selectedYear };
    }
    if (timeframeType === "month") {
      return {
        timeframe: "month" as const,
        month: selectedMonth,
        year: selectedYear,
      };
    }
    return { timeframe: "all_time" as const };
  };

  const timeframeParams = getApiTimeframe();

  return (
    <div>
      <AnalyticsHeader
        timeframeType={timeframeType}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth - 1} // Convert to 0-indexed for display
        onTimeframeChange={setTimeframeType}
        onYearChange={setSelectedYear}
        onMonthChange={(idx) => setSelectedMonth(idx + 1)} // Convert back to 1-indexed
      />
      <AnalyticsStats {...timeframeParams} />
      <AnalyticsDashboard {...timeframeParams} />
    </div>
  );
}

export default page;
