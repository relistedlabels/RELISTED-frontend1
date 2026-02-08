// ENDPOINTS: GET /api/admin/analytics/stats, GET /api/admin/analytics/rentals-revenue-trend, GET /api/admin/analytics/category-breakdown, GET /api/admin/analytics/revenue-by-category
import React from "react";
import AnalyticsHeader from "./components/AnalyticsHeader";
import AnalyticsStats from "./components/AnalyticsStats";
import AnalyticsDashboard from "./components/AnalyticsDashboard";

function page() {
  return (
    <div>
      <AnalyticsHeader />
      <AnalyticsStats />
      <AnalyticsDashboard />
    </div>
  );
}

export default page;
